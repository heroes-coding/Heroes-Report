import { UPDATE_FILTER } from '../actions'
const initialRoleState = [
  {id: 0, name: 'Warrior', selected: false},
  {id: 1, name: 'Support', selected: false},
  {id: 2, name: 'Specialist', selected: false},
  {id: 3, name: 'Assassin', selected: false},
  {id: 4, name: 'Multiclass', selected: false}
]

export default function(state = initialRoleState.map(a => { return {...a} }), action) {
  if (action.type === UPDATE_FILTER && action.filterType === 'ROLE') {
    if (action.payload === 'A') {
      return initialRoleState.map(a => { return {...a} })
    }
    const newRoleState = state.map(a => { return {...a} })
    newRoleState[action.payload].selected = !newRoleState[action.payload].selected
    return newRoleState
  }
  return state
}
