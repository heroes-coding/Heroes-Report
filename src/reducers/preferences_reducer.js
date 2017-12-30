import { UPDATE_PREFERENCES, ROLLBACK_PREFERENCES } from '../actions'
const defaultPreferences = {
  mode: 0,
  mmr: 10,
  time: 7,
  map: 99
}
const brawlMapIDs = [11, 13, 15, 16, 18]
let previousState

export default function(state = {...defaultPreferences}, action) {
  if (action.type === UPDATE_PREFERENCES) {
    state = {...state}
    previousState = {...state}
    state[action.prefType] = action.prefID
    if (action.prefType==='map' && brawlMapIDs.includes(parseInt(action.prefID,10))) {
      state.mode = 5 // make brawl selections less frustrating
    }
    return state
  }
  if (action.type === ROLLBACK_PREFERENCES) {
    return previousState
  }
  return state
}
