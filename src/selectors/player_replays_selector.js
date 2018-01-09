import { createSelector } from 'reselect'

const playerHistory = state => state.playerData
const talentDictionary = state => state.talentDic
const prefs = state => state.prefs
const franchises = state => state.franchises
const roles = state => state.roles
const modeDic = {0:[1,2,3,5],1:[1],2:[2],3:[3],4:[5],5:[4],6:[1,2],7:[3,5]}

const getPlayerData = (playerData, talentDic, prefs, franchises, roles) => {
  const nReplays = playerData.length
  const filteredReplays = []
  const allFranchises = Object.keys(franchises).map(x => franchises[x].selected).filter(x => x).length ? false : true
  const allRoles = Object.keys(roles).map(x => roles[x].selected).filter(x => x).length ? false : true
  for (let r=0;r<nReplays;r++) {
    const rep = playerData[r]
    if (
      (prefs.map !== 99 && rep.map !== prefs.map) ||
      (!modeDic[prefs.mode].includes(rep.mode)) ||
      (!allFranchises && !franchises[rep.franchise].selected) ||
      (!allRoles && !roles[rep.role].selected)
    ) {
      continue
    } else {
      filteredReplays.push(rep)
    }
  }
  return {playerData: filteredReplays, talentDic}
}

export default createSelector(
  playerHistory,
  talentDictionary,
  prefs,
  franchises,
  roles,
  getPlayerData
)
