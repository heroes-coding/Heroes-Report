import { createSelector } from 'reselect'
import _ from 'lodash'

const mainDataSelector = state => state.main
const categoriesSelector = state => state.statCat
const roles = state => state.roles
const franchises = state => state.franchises
const HOTS = state => state.HOTS
const mainOrderSelector = state => state.mainOrder

const selectedHeroesFunc = (roles,franchises,HOTS) => {
  let selectedHeroes = 'loading'
  if (HOTS.hasOwnProperty('heroes')) {
    roles = roles.map(x => x.selected)
    const hasRole = roles.some(x => x)
    franchises = franchises.map(x => x.selected)
    const hasFranchise = franchises.some(x => x)
    const oldHeroes = HOTS.heroes
    const heroKeys = Object.keys(oldHeroes)
    const filteredHeroes = {}
    for (let k = 0; k < heroKeys.length; k++) {
      const key = heroKeys[k]
      if ((hasRole && !roles[oldHeroes[key].role]) ||
          (hasFranchise && !franchises[oldHeroes[key].franchise])) {
        filteredHeroes[key] = oldHeroes[key]
        filteredHeroes[key].visible = false
        continue
      }
      filteredHeroes[key] = oldHeroes[key]
      filteredHeroes[key].visible = true
    }
    selectedHeroes = filteredHeroes
  }
  return selectedHeroes
}

let selectedHeroesSelector = createSelector(
  roles,
  franchises,
  HOTS,
  selectedHeroesFunc
)

const getMainData = (main, statCat, selectedHeroes) => {
  // const startTime = window.performance.now()
  // This also receives the right data
  const statCatStats = statCat.stats
  let heroes = _.values(selectedHeroes)

  let nHeroes = Object.keys(main).length || 77
  // console.log(nHeroes)
  if (heroes[0] === 'l') {
    const mrBig = {name: 'Mr. Bigglesworth', id: 666, visible:true,stats:[],prefsID:'MrBig'}
    for (let s = 0;s<statCatStats.length;s++) {
      const id = statCatStats[s]
      mrBig.stats.push({id, value:999, percent:1, display:[14, 40, 27,6].includes(id) ? "☺" : "∞"})
    }
    heroes = [mrBig]
    nHeroes = 1
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
  /*
  while (!window.hasOwnProperty('HOTS')) {
    console.log('sleeping...')
    await asleep(50)
  } */

  const selectedStuff = {rows: heroes, headers: statCat.headers, cat:statCat.cat, updatedMins: main.updatedMins}
  // window.debug(`Reslecting of main data took ${Math.round(window.performance.now()*100 - startTime*100)/100} ms`)
  return selectedStuff
}

let selectedMainData = createSelector(
  mainDataSelector,
  categoriesSelector,
  selectedHeroesSelector,
  getMainData
)

let reorderMainData = (selectedMainData, order) => {
  const heroes = selectedMainData.rows
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
  return {...selectedMainData,rows:heroes, order}
}

export default createSelector(
  selectedMainData,
  mainOrderSelector,
  reorderMainData
)
