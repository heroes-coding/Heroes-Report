import { dateToDSL, getCounts, roundedPercent, minSinceLaunchToDate, DateToMSL, MSLToDateString } from '../../helpers/smallHelpers'
import getWilson from '../../helpers/wilson'
import convertRustyStats from './convertStats'
const nStats = 19
let roleDic

const fetchAndInstantiate = (url, importObject) => {
  return window.fetch(url).then(response =>
    response.arrayBuffer()
  ).then(bytes =>
    window.WebAssembly.instantiate(bytes, importObject)
  ).then(results =>
    results.instance
  )
}

function copyCStr(module, ptr) {
  let origPtr = ptr
  const collectCString = function * () {
    let memory = new Uint8Array(module.memory.buffer)
    while (memory[ptr] !== 0) {
      if (memory[ptr] === undefined) { throw new Error("Tried to read undef mem") }
      yield memory[ptr]
      ptr += 1
    }
  }
  const bufferAsU8 = new Uint8Array(collectCString())
  const utf8Decoder = new window.TextDecoder("UTF-8")
  const bufferAsUTF8 = utf8Decoder.decode(bufferAsU8)
  module.dealloc_str(origPtr)
  return bufferAsUTF8
}

const setMemoryU32 = (data) => {
  let ptr = window.rustyReplays.alloc(data.length*4)
  let memory = new Uint32Array(window.rustyReplays.memory.buffer)
  memory.set(data, ptr >> 2)
  return ptr
}

const setMemoryU8 = (data) => {
  let ptr = window.rustyReplays.alloc(data.length)
  let memory = new Uint8Array(window.rustyReplays.memory.buffer)
  memory.set(data, ptr >> 0)
  return ptr
}

const loadTalentData = (allyTalents, allyTalentData, nAllies) => {
  for (let a=0;a<nAllies;a++) {
    const allyData = allyTalentData[a]
    let allyTalSpecifics = []
    for (let l=0;l<7;l++) {
      const talKeys = Object.keys(allyData[l])
      const nTals = talKeys.length
      allyTalents.push(nTals)
      for (let t=0;t<nTals;t++) {
        const { builds, slot, lev } = allyData[l][talKeys[t]]
        allyTalSpecifics = allyTalSpecifics.concat([slot, builds.length, ...builds])
      }
    }
    allyTalents = allyTalents.concat(allyTalSpecifics)
  }
  return allyTalents
}

const loadRustyReplays = () => {
  let promise = new Promise(function(resolve, reject) {
    window.rustyReplays = {}
    window.rustyReplays.addBasics = (HOTS) => {
      const nHeroes = HOTS.fullHeroNames.length
      const rolesAndFranchises = Object.values(HOTS.franchiseN).concat(Object.values(HOTS.roleN))
      let ptr = window.rustyReplays.alloc(rolesAndFranchises.length)
      let memory = new Uint8Array(window.rustyReplays.memory.buffer)
      memory.set(rolesAndFranchises, ptr >> 0)
      window.rustyReplays.add_basics(ptr, nHeroes)
      window.rustyReplays.dealloc(ptr,rolesAndFranchises.length)
    }
    window.rustyReplays.addReplays = (replayInts, daysSinceLaunch, mode, density) => {
      const nInts = replayInts.length
      const nReplays = Math.round(nInts/16)
      let ptr = setMemoryU32(replayInts)
      let totalReplays = window.rustyReplays.add_replays(ptr,nReplays,daysSinceLaunch, mode, density)
      window.rustyReplays.dealloc(ptr,nInts*4)
      return totalReplays
    }
    window.rustyReplays.filterData = (props) => {
      // const density = 0 // 1440*30 // 1440 minutes, or rather 1 day, per returned point.  need to add this as an option
      console.time("Filter data")
      const { MMRRange, levelRange, showMirrors, dates, fullRegions, fullMaps, fullModes, filterHeroes, filterTalentHeroes, roles, timeDensity: density } = props
      window.filterTalentHeroes = filterTalentHeroes
      const { startDate, endDate } = dates
      const minMSL = dateToDSL(startDate)*1440
      const maxMSL = (1 + dateToDSL(endDate))*1440
      if (!roleDic) {
        roleDic = {}
        roles.map(x => { roleDic[x.name] = x.id })
      }
      let aRoles = [0,0,0,0,0]
      let aOperators = [6,6,6,6,6]
      let eRoles = [0,0,0,0,0]
      let eOperators = [6,6,6,6,6]
      const allyRoles = {}
      filterHeroes[0].filter(x => isNaN(x)).map(x => { allyRoles[roleDic[x.id]] = x.count })
      Object.keys(allyRoles).map(k => {
        const parts = allyRoles[k].split(" ")
        const operator = parts.length > 1 ? ["","<",">"].indexOf(parts[0]) : 0
        const cnt = parseInt(parts.length > 1 ? parts[1] : parts[0])
        aRoles[k] = cnt
        aOperators[k] = operator
      })
      const enemyRoles = {}
      filterHeroes[1].filter(x => isNaN(x)).map(x => { enemyRoles[roleDic[x.id]] = x.count })
      Object.keys(enemyRoles).map(k => {
        const parts = enemyRoles[k].split(" ")
        const operator = parts.length > 1 ? ["","<",">"].indexOf(parts[0]) : 0
        const cnt = parseInt(parts.length > 1 ? parts[1] : parts[0])
        eRoles[k] = cnt
        eOperators[k] = operator
      })
      const allies = filterHeroes[0].filter(x => !isNaN(x))
      const enemies = filterHeroes[1].filter(x => !isNaN(x))
      let allyTalents = []
      const allyTalentData = filterTalentHeroes[0].filter(x => !x.id).map(x => x.talents)
      let enemyTalents = []
      const enemyTalentData = filterTalentHeroes[1].filter(x => !x.id).map(x => x.talents)
      allyTalents = loadTalentData(allyTalents, allyTalentData, allies.length)
      enemyTalents = loadTalentData(enemyTalents, enemyTalentData, enemies.length)

      const maps = fullMaps.filter(x => x.isActive).map(x => x.id)
      const fModes = fullModes.filter(x => x.isActive).map(x => x.id)
      const fRegions = fullRegions.filter(x => x.isActive).map(x => x.id)
      const aRolesPtr = setMemoryU8(aRoles)
      const eRolesPtr = setMemoryU8(eRoles)
      const aRolesOpsPtr = setMemoryU8(aOperators)
      const eRolesOpsPtr = setMemoryU8(eOperators)
      const aTeamPtr = setMemoryU8(allies)
      const eTeamPtr = setMemoryU8(enemies)
      const mapsPtr = setMemoryU8(maps)
      const modesPtr = setMemoryU8(fModes)
      const regionsPtr = setMemoryU8(fRegions)
      const allyTalentsPtr = setMemoryU8(allyTalents)
      const enemyTalentsPtr = setMemoryU8(enemyTalents)
      const minLevDiff = Math.round(10*levelRange.left)+35
      const maxLevDiff = Math.round(10*levelRange.right)+35
      const mmrRangeMin = Math.round(MMRRange.left)
      const mmrRangeMax = Math.round(MMRRange.right)
      // console.log({aRoles, aOperators, eRoles, eOperators, allies, enemies, maps, fRegions, fModes, minMSL, maxMSL})
      let nBase = window.rustyReplays.filter_replays(
        aRolesPtr,
        eRolesPtr,
        aRolesOpsPtr,
        eRolesOpsPtr,
        aTeamPtr,
        allies.length,
        allyTalentsPtr,
        eTeamPtr,
        enemies.length,
        enemyTalentsPtr,
        mapsPtr,
        maps.length,
        modesPtr,
        fModes.length,
        regionsPtr,
        fRegions.length,
        minMSL,
        maxMSL,
        showMirrors ? 1 : 0,
        minLevDiff,
        maxLevDiff,
        mmrRangeMin,
        mmrRangeMax
      )
      window.rustyReplays.dealloc(aRolesPtr,5)
      window.rustyReplays.dealloc(eRolesPtr,5)
      window.rustyReplays.dealloc(aRolesOpsPtr,5)
      window.rustyReplays.dealloc(eRolesOpsPtr,5)
      window.rustyReplays.dealloc(aTeamPtr,allies.length)
      // window.rustyReplays.dealloc(allyTalentsPtr,allyTalentData.length)
      window.rustyReplays.dealloc(eTeamPtr,enemies.length)
      // window.rustyReplays.dealloc(enemyTalentsPtr,enemyTalentData.length)
      window.rustyReplays.dealloc(mapsPtr,maps.length)
      window.rustyReplays.dealloc(modesPtr,fModes.length)
      window.rustyReplays.dealloc(regionsPtr,fRegions.length)
      const nFiltered = window.rustyReplays.getNFiltered()
      if (!nFiltered) return {stats: [], winrateData: {errorBars: [], labelPoints: [], data: []}}
      return window.rustyReplays.getStats(allies,allies.length, minMSL, maxMSL, density)
    }
    window.rustyReplays.getFilteredMSL = () => {
      let ptr = window.rustyReplays.get_filtered_MSL()
      let nFiltered = new Uint32Array(window.rustyReplays.memory.buffer.slice(ptr,ptr+4))[0]
      ptr = ptr + 4
      return Array.from(new Uint32Array(window.rustyReplays.memory.buffer.slice(ptr,ptr+nFiltered*4)))
    }
    window.rustyReplays.getStats = (allies, nAllies, minMSL, maxMSL, density) => {
      // console.log({allies, nAllies, minMSL, maxMSL, density})
      let alliesUsed = 0 // nAllies
      const aTeamPtr = setMemoryU8(new Uint8Array([])) // setMemoryU8(allies)
      let floatPtr = window.rustyReplays.get_stats(aTeamPtr, alliesUsed, density)
      const nBuilds = new Float32Array(window.rustyReplays.memory.buffer.slice(floatPtr,floatPtr+4))[0]
      floatPtr += 4
      const buildData = Array.from(new Float32Array(window.rustyReplays.memory.buffer.slice(floatPtr,floatPtr+nBuilds*4*3)))
      const builds = Array(nBuilds).fill().map((_,i) => { return [buildData[i*3],buildData[i*3+1],buildData[i*3+2]] })
      floatPtr += nBuilds*4*3
      const nPoints = new Float32Array(window.rustyReplays.memory.buffer.slice(floatPtr,floatPtr+4))[0]
      floatPtr += 4
      const expArray = Array.from(new Float32Array(window.rustyReplays.memory.buffer.slice(floatPtr,floatPtr+nPoints*4)))
      floatPtr += nPoints*4
      const data = Array(nPoints/2).fill().map((_,i) => { return [expArray[i],expArray[i+nPoints/2]] })
      let xArray, minDates
      if (density === 666) {
        minDates = []
        xArray = builds.map(x => {
          minDates.push(x[1])
          return x[2]
        })
      } else if (density > 0) xArray = data.map((_,i) => Math.max(minMSL, maxMSL-i*density)) // data based on minutes-density
      else { // monthly data
        xArray = []
        minDates = []
        let maxDate = minSinceLaunchToDate(maxMSL)
        let minDate = minSinceLaunchToDate(minMSL)
        xArray.push(maxMSL)
        for (let i=0;i<data.length;i++) {
          let m = maxDate.getMonth()
          let y = maxDate.getFullYear()
          let month = (m-i+1)%12
          let upperMonth = new Date((new Date(y, month, 1, 0, 0, 0, 0)) - 60000) // 1 second before end of month
          if (i > 0) { xArray.push(DateToMSL(upperMonth)) }
          if (i < data.length-1) {
            let month = (m-i)%12
            minDates.push(DateToMSL(new Date(y, month, 1, 0, 0, 0, 0)))
          }
        }
        minDates.push(minMSL)
        window.dateStuff = {xArray, minDates}
        density = 1440*30 // hack for minimum date below
      }
      if (density !== 666) {
        xArray.reverse()
        if (minDates) minDates.reverse()
      }
      data.reverse() // reverses in place, now is in proper time order.  A little hacky like the rest of this loop but easier than doing in rust =0
      const errorBars = data.map((y,i) => {
        // console.log({y1: y[1], y1d5: y[1]/5})
        let [ wins, total ] = y
        wins = wins/5
        total = total/5
        return [xArray[i],...getWilson((wins*total)/total, total)]
      })
      const meanTotal = data.map(y => y[1]).reduce((a,b) => a+b)/data.length
      const labelPoints = data.map((y,i) => {
        const [ wins, total ] = y
        const val = roundedPercent(wins/total*1000)
        const MSL = xArray[i]
        let desc = `The allied team won ${val} of ${total/5} matches (95% win rate confidence interval for all matches: ${roundedPercent(errorBars[i][1]*1000)}-${roundedPercent(errorBars[i][2]*1000)}) from ${MSLToDateString(minDates ? minDates[i] : Math.max(MSL-density,minMSL))} to ${MSLToDateString(MSL)}.`
        const buildInfo = window.builds[window.buildDic[builds[i] ? parseInt(builds[i][0]) : 999]]
        if (!buildInfo && density === 666) return null
        if (density === 666 && buildInfo) desc = `${desc} (during build ${buildInfo.name})`
        return {
          name:`Win percent => ${val}`,
          desc,
          size:Math.max(total/meanTotal*5,2.5),
          color:"#ffffff",
          1:wins/total,
          0:MSL
        }
      }).filter(x => x) // this null filter is to make sure all build data is available.  It won't be if the build dictionary was not built properly server side after a patch.
      const lineData = data.map((y,i) => { return [xArray[i],y[0]/y[1]] })

      let offset = (window.HOTS.fullHeroNames.length+1)*nStats*4
      const stats = Array.from(new Float32Array(window.rustyReplays.memory.buffer.slice(floatPtr,floatPtr+offset)))
      // THIS CAUSES ERRORS, NOT SURE WHY BUT LEAVING IT CAUSES A MEMORY LEAK: window.rustyReplays.dealloc(floatPtr, offset)
      return {stats: convertRustyStats(stats), winrateData: {errorBars, labelPoints, data: lineData}}
    }
    window.rustyReplays.printReplay = (replayIndex) => {
      let outptr = window.rustyReplays.print_replay(replayIndex)
      const replayString = copyCStr(window.rustyReplays, outptr)
      console.log(replayString)
    }
    fetchAndInstantiate("/rustyReplays.wasm", imports)
      .then(mod => {
        window.rustyReplays.alloc = mod.exports.alloc
        window.rustyReplays.dealloc = mod.exports.dealloc
        window.rustyReplays.dealloc_str = mod.exports.dealloc_str
        window.rustyReplays.memory = mod.exports.memory
        window.rustyReplays.get_stats = mod.exports.get_stats
        window.rustyReplays.add_basics = mod.exports.add_basics
        window.rustyReplays.add_replays = mod.exports.add_replays
        window.rustyReplays.filter_replays = mod.exports.filter_replays
        window.rustyReplays.print_replay = mod.exports.print_replay
        window.rustyReplays.getNFiltered = mod.exports.get_n_filtered
        window.rustyReplays.get_filtered_MSL = mod.exports.get_filtered_msl
        resolve(true)
      })
  })
  return promise
}

const imports = {
  env: {
    log: function(ptr, number) {
      let str = copyCStr(window.rustyReplays, ptr);
      console.log((str + " -> " + number));
    }
  }
};

export { loadRustyReplays }
