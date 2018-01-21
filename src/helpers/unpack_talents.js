import asleep from './asleep'

function heapFromBytes(response) {
  let promise = new Promise(async function(resolve, reject) {
    const replayTime = response[0]
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
    window.returnedTals=[nTalents,nFull,nPartial,talentCounts,talents,fullBuilds,partialBuilds]
    // getTalentWinrates(allBuilds, nFull, nPartial, nTals,tals)
    /*
    const copyTime = window.performance.now()
    const heap = window.Module.HEAPU8
    const unpackedReplays = heap.slice(replaysPointer,replaysPointer+141*nReplays)
    window.unpackedReplays = unpackedReplays
    console.log(`It took ${Math.round(window.performance.now()*100 - 100*copyTime)/100} ms to copy replay buffer`)

    resolve(unpackedReplays)
    */
  })
  return promise
}

function getTalentWinrates(allBuilds, nFull, nPartial, nTals,tals) {
  let selectTime = window.performance.now()
  let startArray = new Int32Array([].concat.apply(nTals,tals))
  let totalLength = startArray.length+allBuilds.length
  let buildsData = new Int32Array(totalLength)
  buildsData.set(startArray)
  buildsData.set(allBuilds,startArray.length)
  const buf = window.Module._malloc(totalLength*4,4)
  window.Module.HEAP32.set(buildsData,buf >> 2)
  const replaysPointer = window.Module._getTalentWinrates(buf,nFull,nPartial)
  const results = window.Module.HEAPU32.slice(replaysPointer/4,replaysPointer/4+nTals.reduce((x,y) => x+y)*7)
  console.log(`It took ${Math.round(window.performance.now()*100 - 100*selectTime)/100} ms to get talent winrates`)
}

export default async function getPackedTalents(hero) {
  console.log('get packed talents called for ',hero)
  let promise = new Promise(function(resolve, reject) {
    const binaryReq = new window.XMLHttpRequest()
    binaryReq.open("GET", `https://heroes.report/stats/z/61361/0/10/99/${hero}.json`, true)
    
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
      heapFromBytes(response)
    }
    binaryReq.send(null)
  })
  return promise
}
