import { GET_HOTS_DATA } from '../actions'

export default function(state = {}, action) {
  switch (action.type) {
    case GET_HOTS_DATA:
      console.log('GET_HOTS_DATA done')
      return action.payload
    default:
      return state
  }
}
