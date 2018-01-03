import { GET_PLAYER_DATA } from '../actions'

export default function(state = [], action) {
  if (action.type === GET_PLAYER_DATA) {
    return action.playerData
  }
  return state
}
