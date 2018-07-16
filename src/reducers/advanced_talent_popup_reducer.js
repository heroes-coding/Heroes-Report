import { UPDATE_TALENT_POPUP_VISIBILITY } from '../actions'

export default function(state = false, {type, talentPopupOpen}) {
  if (type === UPDATE_TALENT_POPUP_VISIBILITY) {
    return talentPopupOpen
  }
  return state
}
