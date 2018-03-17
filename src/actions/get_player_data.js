import getPlayerBinary from '../helpers/binary_player_unpacker'
import asleep from '../helpers/asleep'
import axios from 'axios'
import { rehgarDic } from '../helpers/definitions'
import _ from 'lodash'
const GET_PLAYER_DATA = 'get_player_data'
export { GET_PLAYER_DATA, getPlayerData, getYourData }

async function getYourData() {
  let playerInfo = []
  for (let f=0;f<window.fullIDs.length;f++) {
    let fullID = window.fullIDs[f]
    let pInfo
    try {
      const mmrPath = `https://heroes.report/api/mmr/${fullID}`
      pInfo = await axios.get(mmrPath)
      pInfo = pInfo.data
    } catch (e) {
      pInfo = {handle:fullID}
    }
    pInfo.fullID = fullID
    pInfo.bnetID = parseInt(fullID.split('-')[1])
    playerInfo.push(pInfo)
  }
  window.yourPlayerInfo = playerInfo
  return {
    type: GET_PLAYER_DATA,
    playerData: window.yourReplays,
    playerInfo,
    playerMatchups: window.playerMatchups
  }
}

async function getPlayerData(fullID) {
  let playerInfo
  try {
    const mmrPath = `https://heroes.report/api/mmr/${fullID}`
    // console.log(mmrPath)
    // const mmrPath = `https://heroes.report/search/mmr/${fullID.split("-")[1]}`
    playerInfo = await axios.get(mmrPath)
    playerInfo = playerInfo.data
  } catch (e) {
    console.log()
    playerInfo = {handle:fullID}
    console.log(e)
  }
  // console.log(playerInfo)
  playerInfo.fullID = fullID
  playerInfo.bnetID = parseInt(fullID.split('-')[1])
  const repsPromise = getPlayerBinary(fullID)
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
    window.playerData = goodReps
  }
  return {
    type: GET_PLAYER_DATA,
    playerData: goodReps,
    playerInfo
  }
}
