import { UPDATE_TIME_DENSITY } from '../actions'
const initialModeState = 1440*7

export default function(state = initialModeState, action) {
  if (action.type === UPDATE_TIME_DENSITY) return action.payload
  return state
}
