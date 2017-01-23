const protobuf = require('protobufjs')

const Type = protobuf.Type
const Field = protobuf.Field

module.exports = new Type('Hyperstruct')
  .add(new Field('version', 1, 'uint32'))
  .add(new Field('protofileMultihash', 2, 'bytes'))
  .add(new Field('fileTypeName', 3, 'string'))
  .add(new Field('file', 4, 'bytes'))
