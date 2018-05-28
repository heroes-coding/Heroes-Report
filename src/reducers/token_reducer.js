import { UPDATE_TOKEN } from '../actions'
let defaultToken = {id: "", temppassword: "", vip: false}
let oldToken
if (window.localStorage.hasOwnProperty('reactprefs')) {
  oldToken = window.loadLocal('token')
}

export default function(state = oldToken || {...defaultToken}, action) {
  if (action.type === UPDATE_TOKEN) {
    if (action.token === 'A') state = {...defaultToken}
    else state = {...action.token}
    window.saveLocal(state,'token')
    return state
  }
  return state
}
