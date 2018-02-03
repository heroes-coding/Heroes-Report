import { getHeroTimeData } from '../helpers/unpack_hero_time_data'
const GET_HERO_TIMED_DATA = 'get_hero_timed_data'
export { GET_HERO_TIMED_DATA, getTimedData }

async function getTimedData(prefs, hero) {
  const timedData = await getHeroTimeData(prefs,hero)
  return {
    type: GET_HERO_TIMED_DATA,
    timedData
  }
}
