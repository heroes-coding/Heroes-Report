import { UPDATE_TALENT_DIC } from '../actions'

export default function(state = {}, action) {
  if (action.type === UPDATE_TALENT_DIC) {
    return action.talentDic
  }
  return state
}
