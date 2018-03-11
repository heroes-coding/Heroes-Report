import { SEARCH_FOR_COPLAYER } from '../actions'

export default function(state = [], {type,newState, playerSearchResults}) {
  if (type === SEARCH_FOR_COPLAYER) {
    return playerSearchResults
  }
  return state
}
