import { SELECT_TALENT } from '../actions'

export default function(state = null, {type,newState, filteredTalents}) {
  if (type === SELECT_TALENT) {
    return filteredTalents
  }
  return state
}
