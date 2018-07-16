import { UPDATE_ADVANCED_TALENT_HERO } from '../actions'

export default function(state = null, action) {
  if (action.type === UPDATE_ADVANCED_TALENT_HERO) {
    return action.hero
  }
  return state
}
