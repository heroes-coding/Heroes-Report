import { UPDATE_MAIN_DATA } from '../actions'

export default function(state = [], action) {
  if (action.type === UPDATE_MAIN_DATA) {
    document.getElementById('loadingWrapper').style.visibility = 'hidden'
    const dData = action.payload.dData
    dData.updatedMins = action.payload.updatedMins
    return dData
  }
  return state
}
