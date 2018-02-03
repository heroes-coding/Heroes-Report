import { GET_HERO_TIMED_DATA } from '../actions'

export default function(state = null, action) {
  if (action.type === GET_HERO_TIMED_DATA) {
    return action.timedData
  }
  return state
}
