import { SELECT_YOUR_ACCOUNT } from '../actions'

export default function(state = null, {type,newState,account}) {
  if (type === SELECT_YOUR_ACCOUNT) {
    if (account==='All') return null
    return account
  }
  return state
}
