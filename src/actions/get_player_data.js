import getPlayerBinary from '../helpers/binary_player_unpacker'
import asleep from '../helpers/asleep'
import axios from 'axios'
const GET_PLAYER_DATA = 'get_player_data'
export { GET_PLAYER_DATA, getPlayerData }

async function getPlayerData(bnetID) {
  const repsPromise = getPlayerBinary(bnetID)
  // const saveName = `player${bnetID}`
  let playerInfo = await axios.get(`https://heroes.report/search/mmr/${bnetID}`)
  playerInfo = playerInfo.data
  // window.saveLocal(playerInfo,saveName)
  window.playerInfo = playerInfo
  const reps = await repsPromise
  const goodReps = []
  while (!window.HOTS || !window.buildDic) {
    await asleep(10)
  }
  let nReps = reps.length
  for (let r=0;r<nReps;r++) {
    let rep = reps[r]
    rep.build = parseInt(window.buildDic[rep.buildIndex])
    if (!rep.build) {
      console.log('MISSING A BUILD!')
      continue
    }
    try {
      rep.fullTals = rep.talents.map((x,i) => window.talentDic[rep.build][rep.hero][i][x])
    } catch (e) {
      console.log('Something wrong with replay',rep.build,rep.hero,window.talentDic[rep.build][rep.hero],rep.talents,rep)
      rep.fullTals = Array(7).fill(null)
      continue
    }
    goodReps.push(rep)
  }
  return {
    type: GET_PLAYER_DATA,
    playerData: goodReps,
    playerInfo
  }
}
