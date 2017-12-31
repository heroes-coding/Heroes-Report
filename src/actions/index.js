import axios from 'axios'

export const GET_TALENT_DATA = 'get_talent_data'
export const UPDATE_FILTER = 'update_filter'
export const UPDATE_PREFERENCES = 'update_preferences'
export const ROLLBACK_PREFERENCES = 'rollback_prefences'
export const UPDATE_MAIN_SORTING = 'update_main_sorting'
export const UPDATE_STAT_CAT = 'update_stat_cat'
export const TEST_URL = 'https://heroes.report/stats/o/52351/3/10/99.json'
export * from './filter_heroes'
export * from './filter_dictionary'
export * from './filter_main_data'

export function updateMainSorting(id) {
  return {
    type: UPDATE_MAIN_SORTING,
    id
  }
}

export function getTalentData() {
  const request = axios.get(TEST_URL)
  return {
    type: GET_TALENT_DATA,
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
    prefID,
    prefType
  }
}

export function updateFilter(id, filterType) {
  console.log(id,filterType)
  return {
    type: UPDATE_FILTER,
    payload: id,
    filterType
  }
}
