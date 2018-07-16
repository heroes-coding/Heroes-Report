import { UPDATE_MMR_RANGE } from '../actions'
const defaultRange = { left: 0, right: 100 }

export default function(state = defaultRange, action) {
  if (action.type === UPDATE_MMR_RANGE) {
    if (action.left==='reset') return defaultRange
    const { left, right } = action
    return { left, right }
  }
  return state
}
