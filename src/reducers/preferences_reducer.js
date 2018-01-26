import { UPDATE_PREFERENCES, UPDATE_MAIN_DATA } from '../actions'
import { defaultPreferences } from '../helpers/definitions'

let oldPreferences
if (window.localStorage.hasOwnProperty('prefs')) {
  oldPreferences = window.loadLocal('prefs')
}
const brawlMapIDs = [11, 13, 15, 16, 18]
export default function(state = oldPreferences || {...defaultPreferences}, action) {
  if (action.type === UPDATE_PREFERENCES) {
    state = {...state}
    if (action.prefType === 'sortStats') {
      const { slot, stat } = action.prefID
      state.sortStats = [...state.sortStats]
      state.sortStats[slot] = stat
    } else {
      state[action.prefType] = action.prefID
    }
    if (action.prefType==='map' && brawlMapIDs.includes(parseInt(action.prefID,10))) {
      state.mode = 5 // make brawl selections less frustrating
    }
    window.saveLocal(state,'prefs')
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
