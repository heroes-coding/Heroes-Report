import { SEARCH_FOR_PLAYER } from '../actions'

export default function(state = [], action) {
  if (action.type === SEARCH_FOR_PLAYER) {
    return action.payload.data
  }
  return state
}
