import { GET_HOTS_DATA, FILTER_HEROES } from '../actions'

export default function(state = 'loading', action) {
  switch (action.type) {
    case GET_HOTS_DATA:
      const heroes = action.payload.heroes
      const hKeys = Object.keys(heroes)
      const nHeroes = hKeys.length
      for (let h=0;h<nHeroes;h++) {
        heroes[hKeys[h]].visible=true
      }
      return heroes
    case FILTER_HEROES:
      return action.payload
    default:
      return state
  }
}
