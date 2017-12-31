import { UPDATE_MAIN_SORTING } from '../actions'
const defaultSort = {id: 13, desc: true}
const ascendingColumns = [5,6,14,40,27]

export default function(state = defaultSort, action) {
  if (action.type === UPDATE_MAIN_SORTING) {
    if (state.id === action.id) {
      return {id: action.id, desc: !state.desc}
    }
    return {id: action.id, desc: !ascendingColumns.includes(action.id)}
  }
  return state
}
