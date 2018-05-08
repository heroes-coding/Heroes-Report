export default async function getReplayBinary(days, modes, offsets) {
  let promise = new Promise(function(resolve, reject) {
    const binaryReq = new window.XMLHttpRequest()
    binaryReq.open("GET", `http://localhost:3333/?day=${days.join(",")}&mode=${modes.join(",")}&offset=${offsets.join(",")}`, true)
    binaryReq.responseType = "arraybuffer"
    binaryReq.onload = async function(oEvent) {
      const arrayBuffer = binaryReq.response
      console.log(binaryReq)
      window.aBuffer = arrayBuffer
      let realInts = []
      let offset = 0
      console.log({aBufferLength: arrayBuffer.byteLength})
      for (let d=0;d<days.length;d++) {
        console.log({offset})
        let length = new Uint32Array(arrayBuffer.slice(offset,offset+4))[0]
        console.log({length})
        offset = offset + 4
        realInts.push(new Uint32Array(arrayBuffer.slice(offset,offset+length)))
        offset += length
      }
      resolve(realInts)
    }
    binaryReq.send(null)
  })
  return promise
}
