import { SELECT_TALENT } from '../actions'
const defaultState = [[],[],[],[],[],[],[]]

export default function(state = [...defaultState], {type,newState}) {
  if (type === SELECT_TALENT) {
    return newState
  }
  return state
}
