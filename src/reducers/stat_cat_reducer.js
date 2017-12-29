import { UPDATE_STAT_CAT } from '../actions'
import { statCatStats } from '../helpers/definitions'

export default function(state = {cat: 'Meta', stats: statCatStats.Meta}, action) {
  if (action.type === UPDATE_STAT_CAT) {
    state = {cat: action.payload, stats: statCatStats[action.payload]}
    return state
  }
  return state
}
