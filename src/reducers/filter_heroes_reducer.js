import { ADD_HERO_FILTER } from '../actions'

export default function(state = [[],[]], action) {
  if (action.type === ADD_HERO_FILTER) {
    let newState = state.map(x => [...x])
    if (action.hero==='A') {
      newState[action.team] = []
    } else if (state[action.team].length===5) {
      return state
    } else {
      newState[action.team].push(action.hero)
    }
    return newState
  }
  return state
}
