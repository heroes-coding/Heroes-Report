import { GET_HERO_TALENTS } from '../actions'

export default function(state = [], action) {
  if (action.type === GET_HERO_TALENTS) {
    return action.talentData
  }
  return state
}
