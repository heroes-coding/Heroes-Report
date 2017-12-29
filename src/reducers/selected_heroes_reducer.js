import { GET_HOTS_DATA, FILTER_HEROES } from '../actions'

export default function(state = 'loading', action) {
  switch (action.type) {
    case GET_HOTS_DATA:
      return {...action.payload.heroes}
    case FILTER_HEROES:
      return action.payload
    default:
      return state
  }
}
