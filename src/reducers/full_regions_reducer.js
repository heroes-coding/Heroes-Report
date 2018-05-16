import { UPDATE_FULL_REGIONS } from '../actions'
const initialModeState = [
  {id: 1, name: 'Americas', isActive: true},
  {id: 2, name: 'Europe', isActive: true},
  {id: 3, name: 'Asia', isActive: true},
  {id: 5, name: 'China', isActive: true}
]

export default function(state = initialModeState.map(a => { return {...a} }), action) {
  if (action.type === UPDATE_FULL_REGIONS) {
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
