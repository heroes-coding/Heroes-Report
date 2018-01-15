import { replayVals } from './binary_defs'

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

/*
export const fakeLaunchDate = (new Date(2015, 5, 1, 20, 0, 0, 0)).getTime()
export const minSinceLaunchToDate = function(minSinceLaunch) {
  return new Date(fakeLaunchDate + minSinceLaunch*60000)
}
*/

export default async function getPlayerBinary(bnetID) {
  let promise = new Promise(function(resolve, reject) {
    const binaryReq = new window.XMLHttpRequest()
    binaryReq.open("GET", `https://heroes.report/stats/players/${bnetID}`, true)
    binaryReq.responseType = "arraybuffer"
    binaryReq.onload = function(oEvent) {
      const startTime = window.performance.now()
      const arrayBuffer = binaryReq.response
      if (arrayBuffer) {
        const replayIntArrays = replayIntArraysFromBytes(arrayBuffer)
        const newReplays = []
        for (let r=0;r<replayIntArrays.length;r++) {
          try {
            newReplays.push(unpackReplay(replayIntArrays[r]))
          } catch (e) {
            console.log(e)
          }
        }
        console.log(`It took ${Math.round(window.performance.now()*100 - 100*startTime)/100} ms to unpack binary data`)
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


replayVals.map(x => x.reverse()) // returns reversed array but also reverses in place, needed for bit unpacking

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
