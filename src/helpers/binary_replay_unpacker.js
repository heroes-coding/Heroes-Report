import asleep from './asleep'

function heapFromBytes(buffer) {
  let promise = new Promise(async function(resolve, reject) {
    const nReplays = Math.floor(buffer.byteLength/64)
    const startTime = window.performance.now()
    let realInts = new Uint32Array(buffer)
    console.log(`It took ${Math.round(window.performance.now()*100 - 100*startTime)/100} ms to unpack ints`)
    while (!window.moduleLoaded) {
      // need to get access to some stuff from the dictionary to proceed
      await asleep(10)
    }
    const bufferTime = window.performance.now()
    const buf = window.Module._malloc(nReplays*16,4)
    window.Module.HEAPU32.set(realInts,buf >> 2)
    console.log(`It took ${Math.round(window.performance.now()*100 - 100*bufferTime)/100} ms to move ints into buffer`)
    let unpackTime = window.performance.now()
    const replaysPointer = window.Module._decodeFullReplays(buf, nReplays)
    console.log(`It took ${Math.round(window.performance.now()*100 - 100*unpackTime)/100} ms to DECODE REPLAYS`)
    const copyTime = window.performance.now()
    const heap = window.Module.HEAPU8
    const unpackedReplays = heap.slice(replaysPointer,replaysPointer+141*nReplays)
    window.unpackedReplays = unpackedReplays
    console.log(`It took ${Math.round(window.performance.now()*100 - 100*copyTime)/100} ms to copy replay buffer`)

    resolve(unpackedReplays)
  })
  return promise
}


export default async function getReplayBinary(date,mode) {
  let promise = new Promise(function(resolve, reject) {
    const binaryReq = new window.XMLHttpRequest()
    binaryReq.open("GET", `https://heroes.report/stats/compressed/${"694-1"}`, true)
    binaryReq.responseType = "arraybuffer"
    binaryReq.onload = async function(oEvent) {
      const arrayBuffer = binaryReq.response
      if (arrayBuffer) {
        window.buffo=arrayBuffer
        const newReplays = await heapFromBytes(arrayBuffer)
        window.newReplays = newReplays
        resolve(newReplays)
      }
    }
    binaryReq.send(null)
  })
  return promise
}
