import { UPDATE_MAIN_DATA } from '../actions'

export default function(state = [], action) {
  if (action.type === UPDATE_MAIN_DATA) {
    document.getElementById('loadingWrapper').style.visibility = 'hidden'
    console.log('UPDATE_MAIN_DATA done')
    return action.payload.dData
  }
  return state
}
