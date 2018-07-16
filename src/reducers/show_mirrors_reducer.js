import { SET_SHOW_MIRRORS_STATE } from '../actions'

export default function(state = false, action) {
  if (action.type === SET_SHOW_MIRRORS_STATE) {
    return action.show
  }
  return state
}
