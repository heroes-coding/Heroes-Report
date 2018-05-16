import { UPDATE_FULL_MAPS } from '../actions'
const initialModeState = Array(30).fill().map((x,i) => { return {id: i, isActive: false} })

export default function(state = initialModeState.map(a => { return {...a} }), action) {
  if (action.type === UPDATE_FULL_MAPS) {
    if (action.payload === 'A') {
      return initialModeState.map(a => { return {...a} })
    }
    return state.map(a => {
      if (a.id === action.payload) return {...a, isActive:!a.isActive}
      return {...a}
    })
  }
  return state
}
