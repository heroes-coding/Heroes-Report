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
    window.rustyReplays.addReplays = (replayInts, daysSinceLaunch, mode) => {
      const nInts = replayInts.length
      const nReplays = Math.round(nInts/16)
      let ptr = setMemoryU32(replayInts)
      let totalReplays = window.rustyReplays.add_replays(ptr,nReplays,daysSinceLaunch, mode)
      window.rustyReplays.dealloc(ptr,nInts*4)
      return totalReplays
    }
    window.rustyReplays.filterData = (props) => {
      // const density = 0 // 1440*30 // 1440 minutes, or rather 1 day, per returned point.  need to add this as an option
      console.time("Filter data")
      const { dates, fullRegions, fullMaps, fullModes, filterHeroes, roles, timeDensity: density } = props
      const { startDate, endDate } = dates
      const minMSL = dateToDSL(startDate)*1440
      const maxMSL = (1 + dateToDSL(endDate))*1440
      if (!roleDic) {
        roleDic = {}
        roles.map(x => { roleDic[x.name] = x.id })
      }
      let aRoles = [0,0,0,0,0]
      let eRoles = [0,0,0,0,0]
      const allyRoles = getCounts(filterHeroes[0].filter(x => isNaN(x)).map(x => roleDic[x]))
      Object.keys(allyRoles).map(k => { aRoles[k] = allyRoles[k] })
      const enemyRoles = getCounts(filterHeroes[1].filter(x => isNaN(x)).map(x => roleDic[x]))
      Object.keys(enemyRoles).map(k => { eRoles[k] = enemyRoles[k] })
      const maps = fullMaps.filter(x => x.isActive).map(x => x.id)
      const allies = filterHeroes[0].filter(x => !isNaN(x))
      const enemies = filterHeroes[1].filter(x => !isNaN(x))
      const fModes = fullModes.filter(x => x.isActive).map(x => x.id)
      const fRegions = fullRegions.filter(x => x.isActive).map(x => x.id)
      const aRolesPtr = setMemoryU8(aRoles)
      const eRolesPtr = setMemoryU8(eRoles)
      const aTeamPtr = setMemoryU8(allies)
      const eTeamPtr = setMemoryU8(enemies)
      const mapsPtr = setMemoryU8(maps)
      const modesPtr = setMemoryU8(fModes)
      console.log({fModes, minMSL, maxMSL})
      const regionsPtr = setMemoryU8(fRegions)
      let nBase = window.rustyReplays.filter_replays(
        aRolesPtr,
        eRolesPtr,
        aTeamPtr,
        allies.length,
        eTeamPtr,
        enemies.length,
        mapsPtr,
        maps.length,
        modesPtr,
        fModes.length,
        regionsPtr,
        fRegions.length,
        minMSL,
        maxMSL
      )
      window.rustyReplays.dealloc(aRolesPtr,5)
      window.rustyReplays.dealloc(eRolesPtr,5)
      window.rustyReplays.dealloc(aTeamPtr,allies.length)
      window.rustyReplays.dealloc(eTeamPtr,enemies.length)
      window.rustyReplays.dealloc(mapsPtr,maps.length)
      window.rustyReplays.dealloc(modesPtr,fModes.length)
      window.rustyReplays.dealloc(regionsPtr,fRegions.length)
      const nFiltered = window.rustyReplays.getNFiltered()
      console.log({nBase, nFiltered})
      if (!nFiltered) return {stats: [], winrateData: {errorBars: [], labelPoints: [], data: []}}
      console.timeEnd("Filter data")
      return window.rustyReplays.getStats(allies,allies.length, minMSL, maxMSL, density)
    }
    window.rustyReplays.addManyReplays = (replayInts, days, modes) => {
      // this is no faster.  In fact it is slower
      days = new Uint32Array(days)
      modes = new Uint32Array(modes)
      let intCohorts = replayInts.map(x => x.length)
      let nreps = new Uint32Array(intCohorts.map(x => x/16))
      const nCohorts = replayInts.length
      const nInts = intCohorts.reduce((a,b) => a + b)
      const newBuffer = new Uint32Array(nInts)
      let offset = 0
      for (let c=0;c<nCohorts;c++) {
        newBuffer.set(replayInts[c],offset)
        offset += intCohorts[c]
      }
      console.log('newBufferLength',newBuffer.length)
      let iptr = setMemoryU32(newBuffer)
      let nptr = setMemoryU32(nreps)
      let dptr = setMemoryU32(days)
      let mptr = setMemoryU32(modes)
      let totalReplays = window.rustyReplays.add_many_replays(iptr,nptr,mptr,dptr,nCohorts)
      window.rustyReplays.dealloc(iptr,nInts*4)
      window.rustyReplays.dealloc(nptr,nCohorts*4)
      window.rustyReplays.dealloc(mptr,nCohorts*4)
      window.rustyReplays.dealloc(dptr,nCohorts*4)
      return totalReplays
    }
    // add_many_replays(data: *mut u32, n_replays_array: *mut u32, days_since_launch_array: *mut u32, cohorts: u32) -> u32 {
    window.rustyReplays.getFilteredMSL = () => {
      let ptr = window.rustyReplays.get_filtered_MSL()
      let nFiltered = new Uint32Array(window.rustyReplays.memory.buffer.slice(ptr,ptr+4))[0]
      ptr = ptr + 4
      console.log({nFiltered,ptr})
      return Array.from(new Uint32Array(window.rustyReplays.memory.buffer.slice(ptr,ptr+nFiltered*4)))
    }
    window.rustyReplays.getStats = (allies, nAllies, minMSL, maxMSL, density) => {
      let alliesUsed = 0 // nAllies
      console.timeEnd("Get stats")
      const aTeamPtr = setMemoryU8(new Uint8Array([])) // setMemoryU8(allies)
      let floatPtr = window.rustyReplays.get_stats(aTeamPtr, alliesUsed, density)
      // Get overall data, will modify this to also return lines for more than one hero soon
      const nPoints = new Float32Array(window.rustyReplays.memory.buffer.slice(floatPtr,floatPtr+4))[0]
      floatPtr += 4
      console.log({nPoints})
      const expArray = Array.from(new Float32Array(window.rustyReplays.memory.buffer.slice(floatPtr,floatPtr+nPoints*4)))
      console.log({expArray})
      floatPtr += nPoints*4
      const data = Array(nPoints/2).fill().map((_,i) => { return [expArray[i],expArray[i+nPoints/2]] })
      let xArray, minDates
      if (density > 0) xArray = data.map((_,i) => Math.max(minMSL, maxMSL-i*density)) // data based on minutes-density
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
      data.reverse() // reverses in place, now is in proper time order.  A little hacky like the rest of this loop but easier than doing in rust =0
      xArray.reverse()
      if (minDates) minDates.reverse()
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
        return {
          name:`Win percent => ${val}`,
          desc:`The allied team won ${val} of ${total/5} matches (95% win rate confidence interval for all matches: ${roundedPercent(errorBars[i][1]*1000)}-${roundedPercent(errorBars[i][2]*1000)}) from ${MSLToDateString(minDates ? minDates[i] : Math.max(MSL-density,minMSL))} to ${MSLToDateString(MSL)}.`,
          size:Math.max(total/meanTotal*5,2.5),
          color:"#ffffff",
          1:wins/total,
          0:MSL
        }
      })
      console.log({data})
      const lineData = data.map((y,i) => { return [xArray[i],y[0]/y[1]] })

      let offset = (window.HOTS.fullHeroNames.length+1)*nStats*4
      const stats = Array.from(new Float32Array(window.rustyReplays.memory.buffer.slice(floatPtr,floatPtr+offset)))
      // THIS CAUSES ERRORS, NOT SURE WHY BUT LEAVING IT CAUSES A MEMORY LEAK: window.rustyReplays.dealloc(floatPtr, offset)
      console.timeEnd("Get stats")
      console.log({errorBars, labelPoints, lineData})
      return {stats: convertRustyStats(stats), winrateData: {errorBars, labelPoints, data: lineData}}
    }
    window.rustyReplays.printReplay = (replayIndex) => {
      let outptr = window.rustyReplays.print_replay(replayIndex)
      const replayString = copyCStr(window.rustyReplays, outptr)
      console.log(replayString)
    }
    fetchAndInstantiate("/rustyReplays.wasm", {})
      .then(mod => {
        console.log({exports: mod.exports})
        window.rustyReplays.alloc = mod.exports.alloc
        window.rustyReplays.dealloc = mod.exports.dealloc
        window.rustyReplays.dealloc_str = mod.exports.dealloc_str
        window.rustyReplays.memory = mod.exports.memory
        window.rustyReplays.get_stats = mod.exports.get_stats
        window.rustyReplays.add_basics = mod.exports.add_basics
        window.rustyReplays.add_replays = mod.exports.add_replays
        window.rustyReplays.filter_replays = mod.exports.filter_replays
        window.rustyReplays.add_many_replays = mod.exports.add_many_replays
        window.rustyReplays.print_replay = mod.exports.print_replay
        window.rustyReplays.getNFiltered = mod.exports.get_n_filtered
        window.rustyReplays.get_filtered_MSL = mod.exports.get_filtered_msl
        resolve(true)
      })
  })
  return promise
}

export { loadRustyReplays }
