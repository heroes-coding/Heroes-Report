import { UPDATE_RUSTY_STATS } from '../actions'

export default function(state = [], action) {
  switch (action.type) {
    case UPDATE_RUSTY_STATS:
      return action.payload
    default:
      return state
  }
}
