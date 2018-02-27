import { UPDATE_FILTER } from '../actions'
const initialFranchiseState = [
  {id: 0, name: 'warcraft', selected: false},
  {id: 1, name: 'diablo', selected: false},
  {id: 2, name: 'starcraft', selected: false},
  {id: 3, name: 'overwatch', selected: false},
  {id: 4, name: 'retro', selected: false}
]

export default function(state = initialFranchiseState.map(a => { return {...a} }), action) {
  if (action.type === UPDATE_FILTER && (action.filterType === 'UNIVERSE' || action.payload === 'A')) {
    if (action.payload === 'A') {
      state = initialFranchiseState.map(a => { return {...a} })
      return state
    }
    return state.map(a => {
      if (a.id === action.payload) {
        return Object.assign({}, a, {
          selected: !a.selected
        })
      }
      return a
    })
  }
  return state
}
