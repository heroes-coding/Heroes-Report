import { createSelector } from 'reselect'

// description:  this is the selector for the menu talents for the ADVANCED screen when selecting individual heroes

// need to implement this - activated by pressing plus button on hero in advanced tab
const advancedTalentHero = state => state.advancedTalentHero
const filterTalentHeroes = state => state.filterTalentHeroes
const dates = state => state.dates

const buildTalentOptions = (data, menuHeroes, dates) => {
  if (!data) return {talentList: null}
  const { hero, talents, team, index } = data
  const startDate = dates.startDate._d
  const endDate = dates.endDate._d
  const talentList = [{},{},{},{},{},{},{}]
  const talentPopupData = [[],[],[],[],[],[],[]]
  // 1) go through all builds from start date to end date
  // 2) if new talent at build, add with start build as that build plus
  // 3) else if talent exists, add to there are any new talents at that level
  for (let b=0; b < window.recentBuildList.length;b++) {
    const build = window.recentBuildList[b]
    if (!(window.builds.hasOwnProperty(build) && startDate < window.builds[build].dates[1] && endDate > window.builds[build].dates[0])) continue
    const buildIndex = window.talentDic.buildIndexes[build]
    let allTals = window.talentDic[build][hero]
    if (!allTals) continue
    for (let t = 0; t < 7; t++) {
      let slot = 1
      while (true) {
        let talent = allTals[t][slot]
        if (!talent) break
        if (talents[t].hasOwnProperty(talent)) {slot++; continue}
        if (talentList[t].hasOwnProperty(talent) && talentList[t][talent].slot === slot) {
          talentList[t][talent].builds.push(buildIndex)
        } else if (window.HOTS.cTalents[hero] && window.HOTS.cTalents[hero].hasOwnProperty(talent)) {
          talentList[t][talent] = { builds: [buildIndex], slot }
          const [ name, desc ] = window.HOTS.cTalents[hero][talent]
          talentPopupData[t].push({talent, name, desc, pic: window.HOTS.talentPics[talent] })
        }
        slot++
      }
    }
  }
  return {talentList, talentPopupData, hero, team, index}
}

export default createSelector(
  advancedTalentHero,
  filterTalentHeroes,
  dates,
  buildTalentOptions
)
