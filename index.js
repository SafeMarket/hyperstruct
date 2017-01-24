const protobuf = require('protobufjs')
const IpfsApi = require('ipfs-amorph-api')
const arguguard = require('arguguard')
const Amorph = require('amorph')
const hyperstructType = require('./lib/hyperstructType')
const HyperstructVersionError = require('./lib/errors/HyperstructVersion')
const HyperstructDecodeError = require('./lib/errors/HyperstructDecode')
const UnknownFormError = require('./lib/errors/UnknownForm')

function HyperstructApi(ipfsOptions) {
  arguguard('HyperstructApi(ipfsOptions)', ['object'], arguments)
  this.ipfsApi = new IpfsApi(ipfsOptions)
  this.protobuf = protobuf
}

function deduceForm(bufferLike) {
  if (bufferLike instanceof Buffer) {
    return 'buffer'
  }
  if (bufferLike instanceof Uint8Array) {
    return 'uint8Array'
  }
  if (bufferLike instanceof Array) {
    return 'array'
  }
  throw new UnknownFormError()
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
    const protofileMultihashBufferLike = hyperstruct.protofileMultihash
    const form = deduceForm(protofileMultihashBufferLike)
    return this.ipfsApi.getFile(new Amorph(protofileMultihashBufferLike, form)).then((protofile) => {
      const fileType = protobuf.parse(protofile.to('utf8')).root.lookup(hyperstruct.fileTypeName)
      return fileType.decode(hyperstruct.file)
    })
  })
}

HyperstructApi.encode = HyperstructApi.prototype.encode = function encode(
  protofileMultihash, fileTypeName, file
) {
  arguguard(
    'HyperstructApi.encode(protofileMultihash, fileType, file)',
    [Amorph, 'string', Amorph],
    arguments
  )
  const hyperstruct = hyperstructType.create({
    version: 1,
    protofileMultihash: protofileMultihash.to('buffer'),
    fileTypeName,
    file: file.to('buffer')
  })
  const hyperstructFileBufferLike = hyperstructType.encode(hyperstruct).finish()
  const form = deduceForm(hyperstructFileBufferLike)
  return new Amorph(hyperstructFileBufferLike, form)
}

HyperstructApi.prototype.addFile = function addFile(protofileMultihash, fileTypeName, file) {
  arguguard(
    'hyperstructApi.addFile(protofileMultihash, fileType, file)',
    [Amorph, 'string', Amorph],
    arguments
  )
  const hyperstructFile = HyperstructApi.encode(protofileMultihash, fileTypeName, file)
  return this.ipfsApi.addFile(hyperstructFile)
}

module.exports = HyperstructApi
