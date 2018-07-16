import { UPDATE_DATE_RANGE } from '../actions'
import moment from 'moment'

const initialDateRange = {
  startDate: moment().subtract(14, "days"),
  endDate:moment()
}

export default function(state = initialDateRange, action) {
  if (action.type === UPDATE_DATE_RANGE) {
    state = {...state, [action.rangeType]: action.payload}
  }
  return state
}
