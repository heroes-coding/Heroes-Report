import { UPDATE_PREFERENCES, UPDATE_MAIN_DATA } from '../actions'
import { defaultPreferences, brawlMapIDs, allBrawlMapIDs } from '../helpers/definitions'

let oldPreferences
if (window.localStorage.hasOwnProperty('prefs')) {
  oldPreferences = window.loadLocal('reactprefs',defaultPreferences)
}

export default function(state = oldPreferences || {...defaultPreferences}, action) {
  if (action.type === UPDATE_PREFERENCES) {
    state = {...state}
    if (action.prefType==='mode' && action.prefID===5 && !allBrawlMapIDs.includes(state.map)) {
      state.map = 99
    }
    if (action.prefType==='map' && state.mode===5 && !allBrawlMapIDs.includes(action.prefID)) {
      state.mode = 0
    }
    if (action.prefType==='mode' && action.prefID!==5 && brawlMapIDs.includes(state.map)) {
      state.map = 99
    }
    if (action.prefType==='map' && brawlMapIDs.includes(action.prefID)) {
      state.mode = 5
    }
    if (action.prefType === 'sortStats') {
      const { slot, stat } = action.prefID
      state.sortStats = [...state.sortStats]
      state.sortStats[slot] = stat
    } else {
      state[action.prefType] = action.prefID
    }

    window.saveLocal(state,'reactprefs')
    return state
  }
  if (action.type === UPDATE_MAIN_DATA) {
    if (action.reset) {
      console.log('should be resetting...')
      let newState = {...defaultPreferences, bnetID: state.bnetID}
      return newState
    }
  }
  return state
}
