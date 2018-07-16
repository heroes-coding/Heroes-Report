import { ADD_HERO_FILTER } from '../actions'

export default function(state = [[],[],[]], action) {
  if (action.type === ADD_HERO_FILTER) {
    let newState = state.map(x => [...x])
    if (action.team===4) { // switch teams
      const team1Data = [...newState[0].map(x => x)]
      newState[0] = [...newState[1].map(x => x)]
      newState[1] = team1Data
    } else if (action.team==='D') {
      const { id, slot } = action.hero
      newState[id].splice(slot,1)
    } else if (action.hero==='A') {
      newState[action.team] = []
    } else if (action.team===2) {
      newState[action.team] = [action.hero]
    } else if (state[action.team].length===5) {
      return state
    } else if (state[action.team].indexOf(action.hero)!==-1 && !isNaN(action.hero)) {
      return state
    } else if (typeof action.hero === 'object') {
      const sameRole = newState[action.team].map((x,i) => [x,i]).filter(x => typeof x[0] === 'object' && x[0].id.includes(action.hero.id))
      if (sameRole.length) newState[action.team][sameRole[0][1]].count = action.hero.count
      else newState[action.team].push(action.hero)
    } else {
      newState[action.team].push(action.hero)
    }
    return newState
  }
  return state
}
