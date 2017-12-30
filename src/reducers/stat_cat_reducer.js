import { UPDATE_STAT_CAT } from '../actions'
import { statCatStats, statNames } from '../helpers/definitions'
const defaultHeaders = []
for (let s=0;s<statCatStats.Meta.length;s++) {
  defaultHeaders.push({'name':statNames[statCatStats.Meta[s]],'id':statCatStats.Meta[s]})
}

export default function(state = {cat: 'Meta', stats: statCatStats.Meta, headers: defaultHeaders}, action) {
  if (action.type === UPDATE_STAT_CAT) {
    const stats = statCatStats[action.payload]
    const headers = []
    for (let s=0;s<stats.length;s++) {
      headers.push({'name':(statNames[stats[s]]),'id':stats[s]})
    }
    state = {cat: action.payload, stats, headers}
    return state
  }
  return state
}
