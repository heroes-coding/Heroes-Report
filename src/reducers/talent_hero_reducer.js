import { UPDATE_TALENT_HERO } from '../actions'

export default function(state = 0, action) {
  if (action.type === UPDATE_TALENT_HERO) {
    return action.hero
  }
  return state
}
