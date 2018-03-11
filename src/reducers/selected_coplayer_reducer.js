import { SELECT_COPLAYER } from '../actions'

export default function(state = null, {type,newState, coplayerData}) {
  if (type === SELECT_COPLAYER) {
    return coplayerData
  }
  return state
}
