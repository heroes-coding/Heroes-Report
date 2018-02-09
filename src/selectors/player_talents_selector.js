import { createSelector } from 'reselect'
import playerReplaysSelector from './player_replays_selector'
import makeBuilds from '../helpers/make_builds'
import refilterTalents from '../helpers/refilter_talents'
const selectedHero = state => state.talentHero
const filteredTalents = state => state.filteredTalents
const selectedTalents = state => state.selectedTalents

const getPlayerTalents = (playerReplays, selectedHero) => {
  const replays = playerReplays.playerData
  const nReps = replays.length
  const builds = []
  for (let r=0;r<nReps;r++) {
    const rep = replays[r]
    if (rep.hero===selectedHero) {
      builds.push([rep.Won, ...rep.fullTals])
    }
  }
  const nBuilds = builds.length
  const buildsArray = new Int32Array([].concat(...builds))
  let talentData
  if (nBuilds > 0) {
    talentData = makeBuilds(buildsArray,nBuilds)
  }
  return {selectedHero, buildsArray, nBuilds, talentData}
}

const baseTalentSelector = createSelector(playerReplaysSelector, selectedHero, getPlayerTalents)

const getFinalTalents = (baseData, filteredTalents, selectedTalents) => {
  const {selectedHero, buildsArray, nBuilds, talentData} = baseData
  if (!filteredTalents && talentData) {
    filteredTalents = refilterTalents(talentData,[],[0,0,0,0,0,0,0])
    console.log(filteredTalents)
  }
  return {selectedHero, buildsArray, nBuilds, talentData, filteredTalents, selectedTalents}
}

export default createSelector(baseTalentSelector, filteredTalents, selectedTalents, getFinalTalents)
