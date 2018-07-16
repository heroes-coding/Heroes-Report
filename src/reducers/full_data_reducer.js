import { UPDATE_FULL_DATA_STATUS } from '../actions'
const defaultState = { downloading: false, percent: 0 }

export default function(state = defaultState, action) {
  if (action.type === UPDATE_FULL_DATA_STATUS) {
    const { downloading, percent } = action
    return {downloading, percent}
  }
  return state
}
