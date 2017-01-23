module.exports = {
  "package": "hyperstruct",
  "syntax": "proto3",
  "root": {
    "nested": {
      "hyperstruct": {
        "nested": {
          "Hyperstruct": {
            "fields": {
              "hyperstructVersion": {
                "rule": "required",
                "type": "uint32",
                "id": 1
              },
              "protoMultihash": {
                "rule": "required",
                "type": "bytes",
                "id": 2
              },
              "protoType": {
                "rule": "required",
                "type": "bytes",
                "id": 3
              }
            }
          }
        }
      }
    }
  }
}