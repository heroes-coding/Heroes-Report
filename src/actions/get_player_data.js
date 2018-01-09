import getPlayerBinary from '../helpers/binary_player_unpacker'
import asleep from '../helpers/asleep'

const GET_PLAYER_DATA = 'get_player_data'
export { GET_PLAYER_DATA, getPlayerData }

async function getPlayerData(bnetID) {
  const reps = await getPlayerBinary(bnetID)
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
    rep.fullTals = []
    rep.talPics = []
    rep.build = parseInt(window.buildDic[rep.buildIndex])
    if (!rep.build) {
      console.log('MISSING A BUILD!')
      continue
    }
    // This try catch is fast enough, it seems
    try {
      rep.fullTals = rep.talents.map((x,i) => window.talentDic[rep.build][rep.hero][i][x])
    } catch (e) {
      console.log('Something wrong with replay',rep.build,rep.hero,window.talentDic[rep.build][rep.hero],rep.talents)
      continue
    }
    okayReps.push(rep)
  }
  return {
    type: GET_PLAYER_DATA,
    playerData: reps
  }
}
