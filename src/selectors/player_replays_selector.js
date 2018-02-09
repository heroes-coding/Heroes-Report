import { createSelector } from 'reselect'
import { getCounts, fakeLaunchDate, DateToMSL } from '../helpers/smallHelpers'
import { decoderNumbers, statMults } from '../helpers/binary_defs'
import _ from 'lodash'
const playerHistory = state => state.playerData
const playerInfo = state => state.playerInfo
const talentDictionary = state => state.talentDic
const prefs = state => state.prefs
const franchises = state => state.franchises
const roles = state => state.roles
const replayPage = state => state.replayPage
const filterHeroes = state => state.filterHeroes
const timeRange = state => state.timeRange
const replaysPerPage = 15
const { mapStatID0, mapStatID1, mapStatValues0, mapStatValues1 } = decoderNumbers


let justFlipped = false
let roleDic

const modeDic = {0:[1,2,3,4],1:[1],2:[2],3:[3],4:[4],5:[5],6:[1,2],7:[3,4]}

const getPlayerBaseData = (playerData, playerInfo, talentDic, prefs, franchises, roles, filterHeroes, timeRange) => {
  const playerHero = filterHeroes[2][0]
  const startTime = window.performance.now()
  const nReplays = playerData.length
  const filteredReplays = []
  const allFranchises = Object.keys(franchises).map(x => franchises[x].selected).filter(x => x).length ? false : true
  const allRoles = Object.keys(roles).map(x => roles[x].selected).filter(x => x).length ? false : true
  if (!roleDic) {
    roleDic = {}
    roles.map(x => { roleDic[x.name] = x.id })
  }
  const allyRoles = getCounts(filterHeroes[0].filter(x => isNaN(x)).map(x => roleDic[x]))
  const aRoleKeys = Object.keys(allyRoles)
  const enemyRoles = getCounts(filterHeroes[1].filter(x => isNaN(x)).map(x => roleDic[x]))
  const eRoleKeys = Object.keys(enemyRoles)
  const allies = filterHeroes[0].filter(x => !isNaN(x))
  const aKeys = Object.keys(allies)
  const enemies = filterHeroes[1].filter(x => !isNaN(x))
  const eKeys = Object.keys(enemies)
  const keys = [aRoleKeys,eRoleKeys,aKeys,eKeys]
  const counts = [allyRoles,enemyRoles]
  let missingHeroes = function(rep) {
    const repcounts = [rep.allyRoleCounts, rep.enemyRoleCounts]
    for (let c=0;c<2;c++) {
      const KEYS = keys[c]
      if (!KEYS.length) {
        continue
      }
      const repCount = repcounts[c]
      const count = counts[c]
      for (let k=0;k<KEYS.length;k++) {
        const key = KEYS[k]
        if (repCount[key] < count[key]) {
          return true
        } else if (count[key] > 3) {
          console.log(repCount,count,key,rep)
        }
      }
    }
    for (let a=0;a<allies.length;a++) {
      if (rep.allies.indexOf(allies[a])===-1) {
        return true
      }
    }
    for (let a=0;a<enemies.length;a++) {
      if (rep.enemies.indexOf(enemies[a])===-1) {
        return true
      }
    }
    return false
  }

  let startDate = DateToMSL(new Date())
  let endDate = DateToMSL(new Date())
  for (let r=0;r<nReplays;r++) {
    const rep = playerData[r]
    const MSL = rep.MSL
    startDate = MSL < startDate ? MSL : startDate
    if (
      (timeRange && (MSL < timeRange[0] || MSL > timeRange[1])) ||
      (playerHero && rep.hero !== playerHero) ||
      (prefs.map !== 99 && rep.map !== prefs.map) ||
      (!modeDic[prefs.mode].includes(rep.mode)) ||
      (!allFranchises && !franchises[rep.franchise].selected) ||
      (!allRoles && !roles[rep.role].selected) ||
      missingHeroes(rep)
    ) {
      continue
    } else {
      filteredReplays.push(rep)
    }
  }
  let pageNames = []
  let nFiltered = filteredReplays.length
  for (let n=0;n<Math.ceil(nFiltered/replaysPerPage);n++) {
    pageNames.push({
      name: `Replays ${1+n*replaysPerPage} - ${Math.min((n+1)*replaysPerPage,nFiltered)}`,
      id: n
    })
  }
  let mapSpecificStats = {}

  if (window.HOTS && window.HOTS.nMapStat) {
    Object.keys(window.HOTS.nMapStat).map(k => { mapSpecificStats[k] = [] })
    for (let r=0;r<nFiltered;r++) {
      const { MSL, stats, Won } = filteredReplays[r]
      let ID0 = stats[mapStatID0]
      if (ID0) {
        mapSpecificStats[ID0-1].push([MSL,stats[mapStatValues0]*statMults[ID0-1],Won])
      }
      let ID1 = stats[mapStatID1]
      if (ID1) {
        mapSpecificStats[ID1-1].push([MSL,stats[mapStatValues1]*statMults[ID1-1],Won])
      }
    }
  }
  justFlipped = false
  console.log(`It took ${Math.round(window.performance.now()*100 - 100*startTime)/100} ms to reselect heroes`)
  return {playerData: filteredReplays, talentDic, playerInfo, pageNames, nReplays: nFiltered, mapSpecificStats, startDate, endDate }
}

const basePlayerDataSelector = createSelector(
  playerHistory,
  playerInfo,
  talentDictionary,
  prefs,
  franchises,
  roles,
  filterHeroes,
  timeRange,
  getPlayerBaseData,
)

const getPlayerData = (basePlayerData, page) => {
  if (!justFlipped) {
    page = 0
  }
  justFlipped = true
  return {...basePlayerData, page, replaysPerPage}
}

export default createSelector(basePlayerDataSelector, replayPage, getPlayerData)
