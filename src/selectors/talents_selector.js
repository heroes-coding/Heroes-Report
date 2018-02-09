import { createSelector } from 'reselect'
const talentData = state => state.talentData
const selectedTalents = state => state.selectedTalents
const filteredTalents = state => state.filteredTalents

const getPlayerTalentData = (talentData,selectedTalents,filteredTalents) => {
  if (filteredTalents) {
    talentData.filteredTalents = filteredTalents
  } else {
    talentData.filteredTalents = talentData.talents
  }
  return {talentData, selectedTalents}
}

export default createSelector(
  talentData,
  selectedTalents,
  filteredTalents,
  getPlayerTalentData
)
