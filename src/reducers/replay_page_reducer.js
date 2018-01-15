import { UPDATE_REPLAY_PAGE } from '../actions'

export default function(state = 0, action) {
  if (action.type === UPDATE_REPLAY_PAGE) {
    return action.page
  }
  return state
}
