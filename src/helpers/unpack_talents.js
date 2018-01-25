import asleep from './asleep'
import { getRandomString } from './smallHelpers'

function heapFromBytes(response, hero) {
  let promise = new Promise(async function(resolve, reject) {
    const dataTime = new Date(response[0])
    let unpackTime = window.performance.now()
    const data = [].concat.apply([1,2,3,4,5,6,7].map(x => response[x].length), response.slice(1,))
    window.response = response
    window.data = data
    const nBuilds = response.length-8
    let realInts = new Int32Array(data)
    window.realInts = realInts
    console.log(`It took ${Math.round(window.performance.now()*100 - 100*unpackTime)/100} ms to shift talents`)
    while (!window.moduleLoaded) {
      console.log('loading...')
      await asleep(10)
    }

    const buf = window.Module._malloc(realInts.length*4,4)
    window.Module.HEAP32.set(realInts,buf >> 2)
    let decodeTime = window.performance.now()
    const replaysPointer = window.Module._decodeTalents(buf,nBuilds)

    let o = replaysPointer/4
    const nTalents = window.Module.HEAPU32[o]
    const nFull = window.Module.HEAPU32[o+1]
    const nPartial = window.Module.HEAPU32[o+2]
    const talentCounts = [3,4,5,6,7,8,9].map(x => window.Module.HEAPU32[o+x])
    o = o+10
    const talents = []
    for (let l=0;l<7;l++) {
      talents.push([])
      for (let c=0;c<talentCounts[l];c++) {
        talents[l].push(window.Module.HEAPU32.slice(o,o+7))
        o += 7
      }
    }
    const fullBuilds = window.Module.HEAPU32.slice(o,o+nFull*11)
    const partialBuilds = window.Module.HEAPU32.slice(o+nFull*11,o+nFull*11+nPartial*9)
    console.log(`It took ${Math.round(window.performance.now()*100 - 100*decodeTime)/100} ms to decode talents`)
    const results = {nTalents,nFull,nPartial,talentCounts,talents,fullBuilds,partialBuilds,dataTime, hero}
    window.talentResults = results
    resolve(results)
  })
  return promise
}

export default async function getPackedTalents(hero, prefs) {
  let promise = new Promise(function(resolve, reject) {
    const binaryReq = new window.XMLHttpRequest()
    const url =`https://heroes.report/stats/z/${prefs.time}/${prefs.mode}/${prefs.mmr}/${prefs.map}/${hero}.json?${getRandomString()}`
    console.log('downloading ',url)
    binaryReq.open("GET",url, true)
    binaryReq.onload = async function(oEvent) {
      let response = binaryReq.response
      if (response) {
        response = JSON.parse(response)
        if (hero===20) {
          for (let t=1;t<8;t++) {
            const index = response[t].indexOf(0)
            if (index !== -1) {
              response[t][index] = 1998
            }
          }
        }
      }
      resolve(await heapFromBytes(response,hero))
    }
    binaryReq.send(null)
  })
  return promise
}
