const superGet = require('./superGet')
const fs = require('fs')
const path = require('path')
const LZString = require('lz-string')
const { app } = require('electron')
const protoPath = path.join(app.getPath('userData'),'protos')
if (!fs.existsSync(protoPath)) fs.mkdirSync(protoPath)
let protocolPromises = {}

function getProto(protoNumber) {
  if (protocolPromises[protoNumber]) return protocolPromises[protoNumber]
  let promise = new Promise(async function(resolve, reject) {
    const thisProtoPath = path.join(protoPath,`${protoNumber}.json`)
    if (fs.existsSync(thisProtoPath)) {
      let proto = JSON.parse(fs.readFileSync(thisProtoPath))
      if (proto === null) {
        fs.unlinkSync(thisProtoPath)
        console.log({protoNumber,proto})
      } else return resolve(proto)
    }
    let proto
    try {
      proto = await superGet(`https://heroes.report/getProto/${protoNumber}`)
    } catch (e) {
      console.log(e)
      return reject(e)
    }
    if (proto === null) return reject(new Error("Can't get new protocol"))
    let protoString = LZString.decompressFromUTF16(proto)
    fs.writeFileSync(thisProtoPath,protoString, 'utf8', (err) => { if (err) console.log(err) })
    proto = JSON.parse(protoString)
    return resolve(proto)
  })
  protocolPromises[protoNumber] = promise
  return promise
}

module.exports = getProto
