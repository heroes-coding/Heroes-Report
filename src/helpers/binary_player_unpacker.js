import asleep from './asleep'
import { replayVals, replayDecoder, indexes, replayDecoderLengths, slotIndex, heroIndexes, decoderDictionary, talentIndexes, firsts, decoderIndex, nPredefined, winners, specialLocations, decoderNumbers } from './binary_defs'
window.binaryStuff = { replayVals, replayDecoder, indexes, replayDecoderLengths, slotIndex, heroIndexes, decoderDictionary, talentIndexes, firsts, decoderIndex, nPredefined, winners, specialLocations, decoderNumbers }


function replayIntArraysFromBytes(buffer) {
  const dataview = new DataView(buffer)
  const nReplays = Math.floor(dataview.byteLength/50)
  const replayIntArrays = []
  for (let r=0;r<nReplays;r++) {
    // all player replays have one baker's dozen of 32 bit / 4 byte unsigned integers.  This is hard coded and partial bit packed (with theoretically possible overflows) to save a crazy amount of space
    const replayIntArray = []
    for (let n=0;n<13;n++) {
      if (n===0) {
        const headerInt = dataview.getUint16(r*50)
        replayIntArray.push(headerInt)
      } else {
        replayIntArray.push(dataview.getUint32(r*50+(n-1)*4+2))
      }
    }
    replayIntArrays.push(replayIntArray)
  }
  return replayIntArrays
}

function heapFromBytes(buffer) {
  const startTime = window.performance.now()
  const dataview = new DataView(buffer)
  const nReplays = Math.floor(dataview.byteLength/50)
  const nHeroes = window.HOTS.fullHeroNames.length
  const offset = specialLocations.length+nHeroes
  let intsArray = new Uint32Array(offset + nReplays*13)
  intsArray.set(specialLocations.concat(Object.values(window.HOTS.roleN)))
  for (let r=0;r<nReplays;r++) {
    // all player replays have one baker's dozen of 32 bit / 4 byte unsigned integers.  This is hard coded and partial bit packed (with theoretically possible overflows) to save a crazy amount of space
    for (let n=0;n<13;n++) {
      let int
      if (n===0) {
        int = dataview.getUint16(r*50)
      } else {
        int = dataview.getUint32(r*50+(n-1)*4+2)
      }
      intsArray[offset+r*13+n] = int
    }
  }
  const buf = window.Module._malloc(offset + nReplays*13,4)
  window.Module.HEAP32.set(intsArray,buf >> 2)
  console.log(`It took ${Math.round(window.performance.now()*100 - 100*startTime)/100} ms to unpack binary data into buffer`)

  let startTime5 = window.performance.now()
  const replaysPointer = window.Module._decodeReplays(buf, replayDecoderLengths.length, replayDecoder.length/2, nReplays, nPredefined, decoderIndex, nHeroes)
  console.log(`It took ${Math.round(window.performance.now()*100 - 100*startTime5)/100} ms to DECODE REPLAYS`)
  console.log(replaysPointer,'pointer')


  const heap = window.Module.HEAPU32
  const startTime7 = window.performance.now()
  const replays = heap.slice(replaysPointer/4,replaysPointer/4+nReplays*decoderIndex)
  /* THIS IS TOO SLOW!
  for (let r=0;r<nReplays;r++) {
    const off = r*decoderIndex +replaysPointer/4
    replays.push(heap.slice(off, off+decoderIndex))
    /*
    const rep = [
      heap[off], // you
      heap[off+28], // won,
      heap.slice(off+33,off+40), // talents
      heap.slice(off+nPredefined,off+decoderIndex), // other stats
      heap[off+29], // winners,
      heap.slice(off+30,off+33), // firsts
      heap.slice(off,off+10), // heroes
      heap.slice(off+10,off+15), // allies
      heap.slice(off+15,off+20), // enemies
      heap.slice(off+20,off+24), // ally role counts
      heap.slice(off+24,off+28) // enemy role counts
    ]
    replays.push(rep)

  }*/
  console.log(`It took ${Math.round(window.performance.now()*100 - 100*startTime7)/100} ms to unpack returned data`)

  window.decoderReplays = replays

}

export default async function getPlayerBinary(bnetID) {
  let promise = new Promise(function(resolve, reject) {
    const binaryReq = new window.XMLHttpRequest()
    binaryReq.open("GET", `https://heroes.report/stats/players/${bnetID}`, true)
    binaryReq.responseType = "arraybuffer"
    binaryReq.onload = async function(oEvent) {
      const startTime = window.performance.now()
      const arrayBuffer = binaryReq.response
      if (arrayBuffer) {
        const startTime1 = window.performance.now()
        const replayIntArrays = replayIntArraysFromBytes(arrayBuffer)
        console.log(`It took ${Math.round(window.performance.now()*100 - 100*startTime1)/100} ms to unpack binary data normally`)
        while (!window.HOTS) {
          // need to get access to some stuff from the dictionary to proceed
          await asleep (20)
        }
        heapFromBytes(arrayBuffer)
        const newReplays = []
        const startTime3 = window.performance.now()
        for (let r=0;r<replayIntArrays.length;r++) {
          try {
            newReplays.push(unpackReplay(replayIntArrays[r]))
          } catch (e) {
            console.log(e)
          }
        }
        console.log(`It took ${Math.round(window.performance.now()*100 - 100*startTime3)/100} ms to unpack binary data`)
        console.log(newReplays[0])
        newReplays.sort((a,b) => a.MSL < b.MSL ? 1 : -1)
        window.newReplays = newReplays
        resolve(newReplays)
      }
    }
    binaryReq.send(null)
  })
  return promise
}

const unpackData = function(total, max, descaler) {
  const value = total%max*descaler
  return [Math.floor(total/max), value]
}

function unpackReplay(replayInts) {
  // replayInts are the important condensed data from the entire replay
  if (replayInts.length !== replayVals.length) {
    const e = new Error('Corrupt replay error')
    throw e
  }
  const replayData = {}
  const heroes = []
  const talents = []
  for (let v=0;v<replayVals.length;v++) {
    let repInt = replayInts[v]
    const replayKeys = replayVals[v]
    for (let k=0;k<replayKeys.length;k++) {
      const [ term, max, multiplier ] = replayKeys[k]
      const [ remainingInt, value ] = unpackData(repInt, max, multiplier)
      repInt = remainingInt
      if (term.length===5 && term.includes('hero')) {
        heroes[parseInt(term[4])] = value
      } else if (term.includes('talent')) {
        talents[parseInt(term[6])] = value
      } else {
        replayData[term] = value
      }
    }
  }
  replayData.Team = Math.floor(replayData.slot/5)
  replayData.Won = replayData.Team === replayData.winners ? 1 : 0
  replayData.KDA = replayData.Kills + replayData.Assists === 0 ? 0 : replayData.Deaths === 0 ? Infinity : (replayData.Kills + replayData.Assists) / replayData.Deaths
  replayData.heroes = heroes
  replayData.talents = talents
  return replayData
}
