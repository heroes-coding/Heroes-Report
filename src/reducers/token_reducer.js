import { UPDATE_TOKEN } from '../actions'
let defaultToken = {id: "", temppassword: "", vip: false}
let oldToken
if (window.localStorage.hasOwnProperty('token')) {
  oldToken = window.loadLocal('token')
}

export default function(state = oldToken || {...defaultToken}, action) {
  if (action.type === UPDATE_TOKEN) {
    if (action.token === 'A') state = {...defaultToken}
    else state = {...action.token}
    console.log({newToken:state})
    window.saveLocal(state,'token')
    return state
  }
  return state
}
