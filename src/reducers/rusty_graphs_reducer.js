import { UPDATE_RUSTY_GRAPHS } from '../actions'

export default function(state = null, action) {
  switch (action.type) {
    case UPDATE_RUSTY_GRAPHS:
      return action.payload
    default:
      return state
  }
}
