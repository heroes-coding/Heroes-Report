import unpackTalents from '../helpers/unpack_talents'
const GET_HERO_TALENTS = 'get_hero_talents'
export { GET_HERO_TALENTS, getHeroTalents }

async function getHeroTalents(hero, prefs) {
  const talentData = await unpackTalents(hero, prefs)
  talentData.wrongDates = talentData.talents.map(x => x.map(y => y[4] < 10))
  return {
    type: GET_HERO_TALENTS,
    talentData
  }
}
