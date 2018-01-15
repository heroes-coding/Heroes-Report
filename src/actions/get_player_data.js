import getPlayerBinary from '../helpers/binary_player_unpacker'
import asleep from '../helpers/asleep'
import { getCounts } from '../helpers/smallHelpers'
import axios from 'axios'
const GET_PLAYER_DATA = 'get_player_data'
export { GET_PLAYER_DATA, getPlayerData }

async function getPlayerData(bnetID) {
  const repsPromise = getPlayerBinary(bnetID)
  const saveName = `player${bnetID}`
  let playerInfo = await axios.get(`https://heroes.report/search/mmr/${bnetID}`)
  playerInfo = playerInfo.data
  window.saveLocal(playerInfo,saveName)
  window.playerInfo = playerInfo
  const reps = await repsPromise
  while (!window.HOTS || !window.buildDic) {
    await asleep(10)
  }
  const nReps = reps.length
  const okayReps = []
  for (let b=0;b<nReps;b++) {
    const rep = reps[b]
    rep.hero = rep.heroes[rep.slot]
    rep.role = window.HOTS.roleN[rep.hero]
    rep.franchise = window.HOTS.franchiseN[rep.hero]
    rep.allies = [...rep.heroes.slice(rep.Team*5,5+rep.Team*5)]
    rep.enemies = [...rep.heroes.slice(Math.abs(1-rep.Team)*5,5+Math.abs(1-rep.Team)*5)]
    rep.allyRoleCounts = getCounts(rep.allies.map(x => window.HOTS.roleN[x]).filter(x => x<4))
    rep.enemyRoleCounts = getCounts(rep.enemies.map(x => window.HOTS.roleN[x]).filter(x => x<4))
    rep.allyCounts = getCounts(rep.allies)
    rep.enemyCounts = getCounts(rep.enemies)
    rep.fullTals = []
    rep.talPics = []
    // you need to keep this in until you fix your mistake by completely wiping all player histories.  You encoded the latest build as 0
    if (rep.buildIndex===0 && rep.MSL > 1000000) {
      rep.build = 61129
    } else {
      rep.build = parseInt(window.buildDic[rep.buildIndex])
    }
    if (!rep.build) {
      console.log('MISSING A BUILD!')
      continue
    }
    // This try catch is fast enough, it seems
    try {
      rep.fullTals = rep.talents.map((x,i) => window.talentDic[rep.build][rep.hero][i][x])
    } catch (e) {
      console.log('Something wrong with replay',rep.build,rep.hero,window.talentDic[rep.build][rep.hero],rep.talents,rep)
      rep.fullTals = Array(7).fill(null)
      continue
    }
    okayReps.push(rep)
  }
  return {
    type: GET_PLAYER_DATA,
    playerData: reps,
    playerInfo
  }
}
