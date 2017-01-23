const fs = require('fs')
const protobuf = require('protobufjs')

const hyperstructProto = fs.readFileSync('hyperstruct.proto', 'utf8')
const parsed = protobuf.parse(hyperstructProto)
const parsedJson = JSON.stringify(parsed, null, 2)
fs.writeFileSync('./hyperstruct.proto.js', `module.exports = ${parsedJson}`)
