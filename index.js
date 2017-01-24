const protobuf = require('protobufjs')
const IpfsApi = require('ipfs-amorph-api')
const arguguard = require('arguguard')
const Amorph = require('amorph')
const hyperstructType = require('./lib/hyperstructType')
const HyperstructVersionError = require('./lib/errors/HyperstructVersion')
const HyperstructDecodeError = require('./lib/errors/HyperstructDecode')

function HyperstructApi(ipfsOptions) {
  arguguard('HyperstructApi(ipfsOptions)', ['object'], arguments)
  this.ipfsApi = new IpfsApi(ipfsOptions)
  this.protobuf = protobuf
}

HyperstructApi.prototype.getObject = function getObject(multihash) {
  arguguard('hyperstructApi.getObject(multihash)', [Amorph], arguments)
  return this.ipfsApi.getFile(multihash).then((hyperstructFile) => {
    const hyperstruct = hyperstructType.decode(hyperstructFile.to('buffer'))
    if (hyperstruct === null) {
      throw new HyperstructDecodeError(`Couuld not decode hyperstruct at ${multihash.to('hex')}`)
    }
    if (hyperstruct.version !== 1) {
      throw new HyperstructVersionError(`hyperstruct.version should be 1, received ${hyperstruct.version}`)
    }
    return this.ipfsApi.getFile(new Amorph(hyperstruct.protofileMultihash, 'buffer')).then((protofile) => {
      const fileType = protobuf.parse(protofile.to('utf8')).root.lookup(hyperstruct.fileTypeName)
      return fileType.decode(hyperstruct.file)
    })
  })
}

HyperstructApi.prototype.addFile = function addFile(protofileMultihash, fileTypeName, file) {
  arguguard(
    'hyperstructApi.addFile(protofileMultihash, fileType, file)',
    [Amorph, 'string', Amorph],
    arguments
  )
  const hyperstruct = hyperstructType.create({
    version: 1,
    protofileMultihash: protofileMultihash.to('buffer'),
    fileTypeName,
    file: file.to('buffer')
  })
  const hyperstructFileBuffer = hyperstructType.encode(hyperstruct).finish()
  const hyperstructFile = new Amorph(hyperstructFileBuffer, 'buffer')
  return this.ipfsApi.addFile(hyperstructFile)
}

module.exports = HyperstructApi
