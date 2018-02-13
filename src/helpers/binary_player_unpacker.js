import asleep from './asleep'
import { replayVals, replayDecoder, indexes, replayDecoderLengths, slotIndex, heroIndexes, decoderDictionary, talentIndexes, firsts, decoderIndex, nPredefined, winners, specialLocations, decoderNumbers } from './binary_defs'
window.binaryStuff = { replayVals, replayDecoder, indexes, replayDecoderLengths, slotIndex, heroIndexes, decoderDictionary, talentIndexes, firsts, decoderIndex, nPredefined, winners, specialLocations, decoderNumbers }

function heapFromBytes(buffer) {
  let promise = new Promise(async function(resolve, reject) {

    const dataview = new DataView(buffer)
    window.dataview = dataview
    let nReplays = Math.floor(dataview.byteLength/48)
    while (!window.HOTS) {
      // need to get access to some stuff from the dictionary to proceed
      await asleep(10)
    }
    const nHeroes = window.HOTS.fullHeroNames.length
    const offset = specialLocations.length+nHeroes

    let realInts = new Uint32Array(buffer)
    let initialArray = specialLocations.concat(Object.values(window.HOTS.roleN))
    let intsArray = new Uint32Array(offset +nReplays*12)
    window.intsArray = intsArray
    intsArray.set(initialArray)
    intsArray.set(realInts,offset)
    while (!window.moduleLoaded) {
      // need to get access to some stuff from the dictionary to proceed
      await asleep(10)
    }
    // console.log('binary player unpacker called',window.moduleLoaded)
    let buf, error, replays
    try {
      buf = window.Module._malloc((offset + nReplays*12)*4,4)
      window.Module.HEAPU32.set(intsArray,buf >> 2)
      window.ints = intsArray
      let startTime = window.performance.now()
      const replaysPointer = window.Module._decodeReplays(buf, replayDecoderLengths.length, replayDecoder.length/2, nReplays, nPredefined, decoderIndex, nHeroes)
      window.timings['unpack time for player'] = (window.performance.now()*100 - 100*startTime)/100
      replays = []
      const heap = window.Module.HEAPU32
      const startTime7 = window.performance.now()
      for (let r=0;r<nReplays;r++) {
        const rep = {}
        const off = r*(decoderIndex) +replaysPointer/4
        rep.allies= heap.slice(off+10,off+15)
        rep.stats = heap.slice(off+nPredefined,off+decoderIndex)
        rep.hero = rep.allies[0]
        rep.franchise = window.HOTS.franchiseN[rep.hero]
        rep.role = window.HOTS.roleN[rep.hero]
        rep.heroes= heap.slice(off,off+10)
        rep.enemies = heap.slice(off+15,off+20)
        rep.allyRoleCounts = heap.slice(off+20,off+24)
        rep.enemyRoleCounts = heap.slice(off+24,off+28)
        rep.Won = heap[off+28]
        rep.map = rep.stats[decoderNumbers.map]
        rep.mode = rep.stats[decoderNumbers.mode]
        rep.Winners = heap[off+29]
        rep.FirstTo10 = heap[off+30]
        rep.FirstTo20 = heap[off+31]
        rep.FirstFort = heap[off+32]
        rep.talents = heap.slice(off+33,off+40)
        rep.MSL = rep.stats[decoderNumbers.MSL]
        const Deaths = rep.stats[decoderNumbers.Deaths]
        rep.KDA = Deaths > 0 ? (rep.stats[decoderNumbers.Kills] + rep.stats[decoderNumbers.Assists])/Deaths : 25
        rep.ends = [rep.stats[decoderNumbers.Team0End],rep.stats[decoderNumbers.Team1End]]
        rep.buildIndex = rep.stats[decoderNumbers.buildIndex]
        replays.push(rep)
      }
      // console.log(`It took ${Math.round(window.performance.now()*100 - 100*startTime7)/100} ms to unpack returned data`)
    } catch (e) {
      error = e
    } finally {
      if (buf) {
        window.Module._free(buf)
      }
    }
    if (error) throw error
    resolve(replays)
  })
  return promise
}

export default async function getPlayerBinary(bnetID) {
  let promise = new Promise(function(resolve, reject) {
    const binaryReq = new window.XMLHttpRequest()
    binaryReq.open("GET", `https://heroes.report/stats/players/${bnetID}`, true)
    binaryReq.responseType = "arraybuffer"
    binaryReq.onload = async function(oEvent) {
      const arrayBuffer = binaryReq.response
      if (arrayBuffer) {
        const newReplays = await heapFromBytes(arrayBuffer)
        newReplays.sort((a,b) => a.MSL < b.MSL ? 1 : -1)
        window.newReplays = newReplays
        resolve(newReplays)
      }
    }
    binaryReq.send(null)
  })
  return promise
}
