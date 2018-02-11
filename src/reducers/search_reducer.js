import { HERO_SEARCH } from '../actions'

export default function(state = null, action) {
  switch (action.type) {
    case HERO_SEARCH:
      return action.heroSearchTerm
    default:
      return state
  }
}
