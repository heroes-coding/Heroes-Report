import asleep from './asleep'
import { getRandomString } from './smallHelpers'
let talentsUnpacker
function makeTalentUnpacker() {
  if (!talentsUnpacker) {
    talentsUnpacker = new window.Worker('/webworkers/unpack_talents_ww.js')
  }
}
setTimeout(makeTalentUnpacker,500)

/*
function heapFromBytes(response, hero) {
  let promise = new Promise(async function(resolve, reject) {
    const dataTime = new Date(response[0])
    let unpackTime = window.performance.now()
    const data = [].concat.apply([1,2,3,4,5,6,7].map(x => response[x].length), response.slice(1,))
    window.response = response
    window.data = data
    const nBuilds = response.length-8
    // console.log('unpacking talents for... ', hero, nBuilds)
    let realInts = new Int32Array(data)
    window.realInts = realInts
    // console.log(`It took ${Math.round(window.performance.now()*100 - 100*unpackTime)/100} ms to shift talents`)
    while (!window.moduleLoaded) {
      console.log('loading...')
      await asleep(10)
    }
    // console.log('unpack talents called',window.moduleLoaded)
    let buf, error, results
    try {
      // int32_t returneeBuilds [nFull*11+nPartial*9+nTalents*7+7]; // changed to buf
      buf = window.Module._malloc(realInts.length*11*4+400,4) // needs enough space for above call
      window.Module.HEAP32.set(realInts,buf >> 2)
      let decodeTime = window.performance.now()
      const replaysPointer = window.Module._decodeTalents(buf,nBuilds)

      let o = replaysPointer/4
      const nTalents = window.Module.HEAP32[o]
      const nFull = window.Module.HEAP32[o+1]
      const nPartial = window.Module.HEAP32[o+2]
      const talentCounts = [3,4,5,6,7,8,9].map(x => window.Module.HEAP32[o+x])
      o = o+10
      const talents = []
      for (let l=0;l<7;l++) {
        talents.push([])
        for (let c=0;c<talentCounts[l];c++) {
          talents[l].push(window.Module.HEAPU32.slice(o,o+7))
          o += 7
        }
      }
      const fullBuilds = window.Module.HEAP32.slice(o,o+nFull*11)
      const partialBuilds = window.Module.HEAP32.slice(o+nFull*11,o+nFull*11+nPartial*9)
      // console.log(`It took ${Math.round(window.performance.now()*100 - 100*decodeTime)/100} ms to decode talents`)
      window.timings['Talent decoding C++ for ' + hero] = Math.round(window.performance.now()*100 - 100*unpackTime)/100
      results = {nTalents,nFull,nPartial,talentCounts,talents,fullBuilds,partialBuilds,dataTime, hero}
      window.talentResults = results
    } catch (e) {
      error = e
    } finally {
      window.Module._free(buf)
    }
    if (error) throw error
    // window.Module._free(buf)
    resolve(results)
  })
  return promise
}
*/

function getTalentsWithJavascript(response,hero) {
  const dataTime = new Date(response[0])
  const talentList = response.slice(1,8)
  const realTalents = talentList.map(x => x.filter(y => y))
  const levCounts = talentList.map(x => x.length)
  const talentCounts = realTalents.map(x => x.length)
  const nTalents = talentCounts.reduce((x,y) => x+y)
  let partialBuilds = []
  let fullBuilds = []
  const buildKeyDic = [{},{},{},{},{},{},{}]
  const talents = [0,1,2,3,4,5,6].map(l => realTalents[l].map((t,index) => {
    buildKeyDic[l][t] = {index, builds:[]}
    return [t,0,0,0,0,0,0]
  }))
  let nFull = 0
  for (let b=8;b<response.length;b++) {
    const buildKeys = [0,0,0,0,0,0,0,0,0,0,0]
    let [ sum, count, wins ] = response[b]
    let isFullBuild = true
    for (let t=6;t>=0;t--) {
      let mult = levCounts[t]
      let tal = sum%mult
      sum = Math.floor(sum/mult)
      if (talentList[t][tal] === null) isFullBuild=false
      buildKeys[t] = talentList[t][tal]
    }
    buildKeys[7] = wins
    buildKeys[8] = count
    if (isFullBuild) {
      buildKeys.slice(0,7).map((k,i) => {
        buildKeyDic[i][k].builds.push(nFull)
        let index = buildKeyDic[i][k].index
        for (let type=1;type<3;type++) {
          talents[i][index][type*2+1] += wins
          talents[i][index][type*2+2] += count
        }
      })
      buildKeys[9] = wins*1000
      buildKeys[10] = count*1000
      nFull += 1
      fullBuilds.push(buildKeys)
    } else {
      // this if check is to make sure there is a level one talent
      if (buildKeys[0]) partialBuilds.push(buildKeys.slice(0,9))
    }
  }
  const nPartial = partialBuilds.length
  const partialMatches = []
  const partialCounts = []

  for (let p=0;p<nPartial;p++) {
    let startTal = partialBuilds[p][0]
    if (!startTal) continue // level one talent not even selected!
    let { index: indexKey, builds: potentialMatches } = buildKeyDic[0][partialBuilds[p][0]]

    for (let l=0;l<7;l++) {
      let talNum = partialBuilds[p][l]
      if (!talNum) break
      if (l > 0) indexKey = buildKeyDic[l][talNum].index
      talents[l][indexKey][3] += partialBuilds[p][7]
      talents[l][indexKey][4] += partialBuilds[p][8]
      let nPots = potentialMatches.length
      let potMatches = []
      for (let m=0;m<nPots;m++) {
        let fIndex = potentialMatches[m]
        if (fullBuilds[fIndex][l] === talNum) potMatches.push(fIndex)
      }
      potentialMatches = potMatches
    }
    let total = 0
    let nPots = potentialMatches.length
    for (let m=0;m<nPots;m++) total += fullBuilds[potentialMatches[m]][8]
    partialMatches.push(potentialMatches)
    partialCounts.push(total)
  }
  for (let p=0;p<nPartial;p++) {
    let total = partialCounts[p]
    let [ wins, count ] = partialBuilds[p].slice(7,9)
    let potMatches = partialMatches[p]
    let nPots = potMatches.length
    for (let m=0;m<nPots;m++) {
      let bIndex = potMatches[m]
      let percent = fullBuilds[bIndex][8]/total
      fullBuilds[bIndex][9] += 1000*wins*percent
      fullBuilds[bIndex][10] += 1000*count*percent
    }
  }
  for (let b=0;b<nFull;b++) {
    for (let l=0;l<7;l++) {
      let indexKey = buildKeyDic[l][fullBuilds[b][l]].index
      talents[l][indexKey][1] += fullBuilds[b][9]
      talents[l][indexKey][2] += fullBuilds[b][10]
    }
  }

  partialBuilds = new Int32Array([].concat(...partialBuilds))
  fullBuilds = new Int32Array([].concat(...fullBuilds))
  return {nTalents, nFull, nPartial, talentCounts, talents, fullBuilds, partialBuilds, dataTime, hero}

  // {nTalents,nFull,nPartial,talentCounts,talents,fullBuilds,partialBuilds,dataTime, hero}
}


function messageTalentUnpacker(response,hero) {
  let promise = new Promise(function(resolve, reject) {
    if (!talentsUnpacker) {
      talentsUnpacker = new window.Worker('/webworkers/unpack_talents_ww.js')
    }
    let unpackTime = window.performance.now()
    talentsUnpacker.addEventListener('message', function handler(e) {
      talentsUnpacker.removeEventListener('message',handler)
      window.timings['Talent decoding Javascript Webworker for ' + window.HOTS.nHeroes[hero]] = Math.round(window.performance.now()*100 - 100*unpackTime)/100
      resolve(e.data)
    }, false)
    talentsUnpacker.postMessage({response, hero})
  })
  return promise
}

export default async function getPackedTalents(hero, prefs) {
  let promise = new Promise(function(resolve, reject) {
    const binaryReq = new window.XMLHttpRequest()
    const url =`https://heroes.report/stats/z/${prefs.time}/${prefs.mode}/${prefs.mmr}/${prefs.map}/${hero}.json?${getRandomString()}`
    // console.log('downloading ',url)
    binaryReq.open("GET",url, true)
    binaryReq.onload = async function(oEvent) {
      let response = binaryReq.response
      let wwResults
      let unpackTime
      if (response) {
        wwResults = await messageTalentUnpacker(response,hero)
        unpackTime = window.performance.now()
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
      // let cppResult = await heapFromBytes(response,hero) // I don't know why this is broken.  Why is it broken?
      resolve(wwResults)
      /*
      let javascriptResult = getTalentsWithJavascript(response,hero)
      window.timings['Talent decoding Javascript for ' + hero] = Math.round(window.performance.now()*100 - 100*unpackTime)/100
      resolve(javascriptResult)
      */
    }
    binaryReq.send(null)
  })
  return promise
}
