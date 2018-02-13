import getPlayerBinary from '../helpers/binary_player_unpacker'
import asleep from '../helpers/asleep'
import axios from 'axios'
import { rehgarDic } from '../helpers/definitions'
import _ from 'lodash'
const GET_PLAYER_DATA = 'get_player_data'
export { GET_PLAYER_DATA, getPlayerData }

async function getPlayerData(bnetID) {
  const repsPromise = getPlayerBinary(bnetID)
  // const saveName = `player${bnetID}`
  let playerInfo
  try {
    playerInfo = await axios.get(`https://heroes.report/search/mmr/${bnetID}`)
    playerInfo = playerInfo.data
  } catch (e) {
    playerInfo = {handle:bnetID}
    console.log(e)
  }
  playerInfo.bnetID = parseInt(bnetID)
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
    rep.fullTals = Array(7).fill(null)
    try {
      rep.talents.map((x,i) => {
        // Need to fix this somewhere else
        let tal = window.talentDic[rep.build][rep.hero][i][x]
        if (tal && isNaN(tal)) {
          if (!window.HOTS.talentsN) {
            window.HOTS.talentsN = _.invert(window.HOTS.nTalents)
            window.HOTS.talentsN = {...window.HOTS.talentsN, ...rehgarDic}
          }
          tal = parseInt(window.HOTS.talentsN[tal])
          window.talentDic[rep.build][rep.hero][i][x] = tal
        }
        rep.fullTals[i] = tal
      })
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
