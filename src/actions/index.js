import axios from 'axios'
import refilterTalents from '../helpers/refilter_talents'
import Fuse from 'fuse.js'
import { max } from 'd3'
let fuse

export const GET_TALENT_DATA = 'get_talent_data'
export const UPDATE_FILTER = 'update_filter'
export const UPDATE_PREFERENCES = 'update_preferences'
export const ROLLBACK_PREFERENCES = 'rollback_prefences'
export const SEARCH_FOR_PLAYER = 'search_for_player'
export const UPDATE_MAIN_SORTING = 'update_main_sorting'
export const UPDATE_STAT_CAT = 'update_stat_cat'
export const UPDATE_REPLAY_PAGE = 'update_replay_page'
export const ADD_HERO_FILTER = 'add_hero_filter'
export const SELECT_TALENT = 'select_talent'
export const HERO_SEARCH = 'hero_search'
export const UPDATE_TIME = 'update_time'
export const UPDATE_TALENT_HERO = 'update_talent_hero'
export const TEST_URL = 'https://heroes.report/stats/o/52351/3/10/99.json'
export * from './filter_heroes'
export * from './filter_dictionary'
export * from './filter_main_data'
export * from './get_player_data'
export * from './get_talent_dictionary'
export * from './get_hero_data'
export * from './get_hero_timed_data'

export function updateMainSorting(id) {
  return {
    type: UPDATE_MAIN_SORTING,
    id
  }
}

export function heroSearch(term) {
  let heroSearchTerm = null
  if (!window.HOTS) {
    return {
      type: HERO_SEARCH,
      heroSearchTerm: null
    }
  }
  if (!window.HOTS.searchDic) {
    window.HOTS.searchDic = []
    const heroNames = []
    for (let h=0;h<window.HOTS.fullHeroNames.length;h++) {
      const invis = window.HOTS.invisText[h].split(" ")
      const [role, franchise] = invis
      const nick = window.HOTS.nickNames[h]
      window.HOTS.searchDic.push({id: h, role, franchise, nick})
      heroNames.push([])
    }
    const heroKeys = Object.keys(window.HOTS.heroDic)
    heroKeys.map(k => {
      const hero = window.HOTS.heroDic[k]
      heroNames[hero].push(k)
    })
    const maxNames = max(heroNames.map(x => x.length))
    window.HOTS.fullHeroNames.map((h,i) => {
      for (let n=0;n<maxNames;n++) {
        window.HOTS.searchDic[i][n] = ""
      }
    })
    heroNames.map((names,i) => {
      names.map((name,j) => {
        window.HOTS.searchDic[i][j] = name
      })
    })
    const ids = Array.from({length:maxNames},(v,k) => (k).toString())
    const keys = [].concat(["role","franchise","nick"],ids)
    const options = {
      shouldSort: true,
      threshold: 0.25,
      location: 0,
      distance: 100,
      maxPatternLength: 32,
      minMatchCharLength: 1,
      keys
    }
    fuse = new Fuse(window.HOTS.searchDic, options)
  }
  const result = fuse.search(term)
  if (result.length > 0) {
    heroSearchTerm = result.map(x => x.id)
  }
  return {
    type: HERO_SEARCH,
    heroSearchTerm
  }
}

export function updateTalentHero(hero) {
  return {
    type: UPDATE_TALENT_HERO,
    hero
  }
}

export function updateTime(startMSL,endMSL) {
  return {
    type: UPDATE_TIME,
    startMSL,
    endMSL
  }
}

export function selectTalent(lev, tal, state, talentData) {
  // moving state manipulation here so I can do some async stuff... a little messy
  let newState
  let ignoreStuff = true
  if (lev==='reset') {
    newState = [[],[],[],[],[],[],[]]
    ignoreStuff = false
  } else if (state[lev].includes(tal)) {
    newState = [...state]
    newState[lev].splice(newState[lev].indexOf(tal),1)
  } else {
    newState = [...state]
    newState[lev] = [...newState[lev], tal]
    state = newState
  }
  const toIgnore = []
  const ignoreCounts = []
  for (let l=0;l<7;l++) {
    let c = 0
    if (newState[l].length) {
      for (let t=0;t<talentData.talentCounts[l];t++) {
        const tal = talentData.talents[l][t][0]
        if (!newState[l].includes(tal)) {
          toIgnore.push(tal)
          c++
        }
      }
    }
    ignoreCounts.push(c)
  }
  let filteredTalents = null
  if (ignoreStuff) {
    filteredTalents = refilterTalents(talentData,toIgnore,ignoreCounts)
  }
  return {
    type: SELECT_TALENT,
    newState,
    filteredTalents
  }
}

export function addHeroFilter(team,hero) {
  return {
    type: ADD_HERO_FILTER,
    team,
    hero
  }
}

export function getTalentData() {
  const request = axios.get(TEST_URL)
  return {
    type: GET_TALENT_DATA,
    payload: request
  }
}

export function updateReplayPage(page) {
  return {
    type: UPDATE_REPLAY_PAGE,
    page
  }
}

export function dispatchPlayerSearch(playerID) {
  let request
  if (playerID !== '' && playerID.length > 2) {
    request = axios.get(`https://heroes.report/api/players/${playerID.replace('#','_')}`)
  } else if (playerID.length < 3) {
    request = {data:{status:400}}
  } else {
    request = {data:[]}
  }
  return {
    type: SEARCH_FOR_PLAYER,
    payload: request
  }
}

export function updateStatCat(newCat) {
  return {
    type: UPDATE_STAT_CAT,
    payload: newCat
  }
}

export function rollbackState() {
  console.log('rollback state called')
  return {
    type: ROLLBACK_PREFERENCES,
    payload: null
  }
}

export function updatePreferences(prefType, prefID) {
  return {
    type: UPDATE_PREFERENCES,
    prefID: isNaN(prefID) ? prefID : parseInt(prefID),
    prefType
  }
}

export function updateFilter(id, filterType) {
  return {
    type: UPDATE_FILTER,
    payload: id,
    filterType
  }
}
