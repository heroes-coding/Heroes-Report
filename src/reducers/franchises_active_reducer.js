import { UPDATE_FILTER } from '../actions'
const initialFranchiseState = [
  {id: 0, name: 'starcraft', selected: false},
  {id: 1, name: 'warcraft', selected: false},
  {id: 2, name: 'overwatch', selected: false},
  {id: 3, name: 'retro', selected: false},
  {id: 4, name: 'diablo', selected: false}
]

export default function(state = initialFranchiseState.map(a => { return {...a} }), action) {
  if (action.type === UPDATE_FILTER && action.filterType === 'UNIVERSE') {
    if (action.payload === 'A') {
      state = initialFranchiseState.map(a => { return {...a} })
      return state
    }
    state = state.map(a => { return {...a} })
    state[action.payload].selected = !state[action.payload].selected
    return state
  }
  return state
}
