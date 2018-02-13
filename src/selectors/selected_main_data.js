import { createSelector } from 'reselect'
import _ from 'lodash'

const mainDataSelector = state => state.main
const categoriesSelector = state => state.statCat
const selectedHeroesSelector = state => state.selectedHeroes
const mainOrderSelector = state => state.mainOrder

const getMainData = (main, statCat, selectedHeroes, order) => {
  const startTime = window.performance.now()
  // This also receives the right data
  const statCatStats = statCat.stats
  let heroes = _.values(selectedHeroes)
  let nHeroes = Object.keys(main).length || 77
  // console.log(nHeroes)
  if (heroes[0] === 'l') {
    nHeroes = (window.configCheck && window.configCheck.heroCount) || 76
    heroes = []
    for (let h = 0; h < nHeroes; h++) {
      heroes.push({name: '', id: h})
    }
  } else {
    nHeroes = heroes.length
  }
  const gotAll = Object.keys(main).length > 0 && heroes !== 'loading' && heroes[0].id !== 666

  let visibleCount = 0
  if (gotAll) {
    const newHeroes = []
    for (let h = 0; h < nHeroes; h++) {
      const heroID = heroes[h].id
      if (!main.hasOwnProperty(heroID)) {
        continue
      }
      const heroDic = heroes[h]
      if (!heroDic.hasOwnProperty('visible')) {
        heroDic.visible = true
      }
      if (heroDic.visible) {
        visibleCount += 1
      }
      heroDic.stats = []
      for (let s = 0;s<statCatStats.length;s++) {
        const stat = statCatStats[s]
        const value = main[heroID][stat]
        heroDic.stats.push(value)
        heroDic[stat] = value.value
      }

      // THIS IS MY HACKY SOLUTION TO NOT BEING ABLE TO RECONCILE THE UPDATE TIMES OF GET MAIN DATA AND GET HOTS DATA
      heroDic.prefsID = main[heroID].prefsID
      heroDic.name = main[heroID].name
      heroDic.color = main[heroID].color
      newHeroes.push(heroDic)
    }
    heroes = newHeroes
    nHeroes = heroes.length
  }
  if (order.id==='names') {
    heroes.sort((a,b) => a.name < b.name ? -1 : 1)
    if (!order.desc) {
      heroes.reverse()
    }
  } else {
    heroes.sort((a,b) => a[order.id] < b[order.id] ? -1 : 1)
    if (order.desc) {
      heroes.reverse()
    }
  }
  /*
  while (!window.hasOwnProperty('HOTS')) {
    console.log('sleeping...')
    await asleep(50)
  } */

  if (visibleCount === 0) {
    const mrBig = {name: 'Mr. Bigglesworth', id: 666, visible:true,stats:[],prefsID:'MrBig'}
    for (let s = 0;s<statCatStats.length;s++) {
      const id = statCatStats[s]
      mrBig.stats.push({id, value:999, percent:1, display:[14, 40, 27,6].includes(id) ? "☺" : "∞"})
    }
    heroes.push(mrBig)
  }
  const selectedStuff = {rows: heroes, headers: statCat.headers, cat:statCat.cat, order, updatedMins: main.updatedMins}
  // window.debug(`Reslecting of main data took ${Math.round(window.performance.now()*100 - startTime*100)/100} ms`)
  return selectedStuff
}

export default createSelector(
  mainDataSelector,
  categoriesSelector,
  selectedHeroesSelector,
  mainOrderSelector,
  getMainData
)
