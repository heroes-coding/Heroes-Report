import { FILTER_HEROES } from '../actions'

export default function(state = 'loading', action) {
  switch (action.type) {
    case FILTER_HEROES:
      return action.payload
    default:
      return state
  }
}
