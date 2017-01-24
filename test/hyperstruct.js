const HyperstructApi = require('../')
const hyperstructType = require('../lib/hyperstructType')
const protobufjs = require('protobufjs')
const IpfsAmorphApi = require('ipfs-amorph-api')
const Amorph = require('amorph')
const chai = require('chai')

chai.should()

const ipfsApiOptions = {
  host: 'ipfs.infura.io',
  port: '5001',
  protocol: 'https'
}
const hyperstructApi = new HyperstructApi(ipfsApiOptions)

const storeProtofile = new Amorph(`
  syntax = "proto3";

  message Store{
    required string name = 1;
    required string baseCountryCode = 2;
    required string info = 3;
  }
`, 'utf8')
const storeType = protobufjs.parse(storeProtofile.to('utf8')).root.lookup('Store')
const storeFileBuffer = storeType.encode(storeType.create({
  name: 'My Store',
  baseCountryCode: 'us',
  info: 'My store is awesome!'
})).finish()
const storeFile = new Amorph(storeFileBuffer, 'buffer')
const ipfsAmorphApi = new IpfsAmorphApi(ipfsApiOptions)
let storeProtofileMultihash
let hyperstructMultihash

describe('HyperstructApi', () => {
  it('setup: should add storeProtofile to ipfs', () => {
    return ipfsAmorphApi.addFile(storeProtofile).then((multihash) => {
      storeProtofileMultihash = multihash
      storeProtofileMultihash.should.be.instanceOf(Amorph)
    })
  })
  it('should add store hyperstruct', () => {
    return hyperstructApi.addFile(storeProtofileMultihash, 'Store', storeFile).then((multihash) => {
      hyperstructMultihash = multihash
    })
  })
  it('should get store', () => {
    return hyperstructApi.getObject(hyperstructMultihash).then((store) => {
      store.name.should.equal('My Store')
      store.baseCountryCode.should.equal('us')
      store.info.should.equal('My store is awesome!')
    })
  })
})
