import { UPDATE_TIME } from '../actions'

export default function(state = null, action) {
  if (action.type === UPDATE_TIME) {
    if (action.startMSL === 'reset') {
      return null
    }
    return action.startMSL
  }
  return state
}
