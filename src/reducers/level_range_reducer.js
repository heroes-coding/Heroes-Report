import { UPDATE_LEVEL_RANGE } from '../actions'
const defaultRange = { left: -3.5, right: 3.5 }

export default function(state = defaultRange, action) {
  if (action.type === UPDATE_LEVEL_RANGE) {
    if (action.left==='reset') return defaultRange
    const { left, right } = action
    return { left, right }
  }
  return state
}
