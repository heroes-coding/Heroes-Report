import { UPDATE_MAIN_DATA } from '../actions'

export default async function(state = [], action) {
  if (action.type === UPDATE_MAIN_DATA) {
    state = {gotMain: true, lastUpdated: action.payload.updatedMins, total: action.payload.total/10}
    document.getElementById('loadingWrapper').style.visibility = 'hidden'
    return state
  }
  return state
}
