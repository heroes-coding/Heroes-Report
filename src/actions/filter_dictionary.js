import axios from 'axios'
import _ from 'lodash'
import asleep from '../helpers/asleep'
import { getRandomString } from '../helpers/smallHelpers'
import timeUnpacker from '../helpers/timeUnpacker'

const GET_HOTS_DATA = 'get_hots_data'

async function getHOTSDictionary() {
  const buildsPromise = axios.get('https://heroes.report/stats/timeframes.json')
  let HOTS = window.loadLocal('HOTS')
  let version = 0
  if (HOTS) {
    const configCheckPromise = axios.get(`https://heroes.report/stats/config.json?${getRandomString()}`)
    // should implement lzstring here
    let configCheck = await configCheckPromise
    if (configCheck.status === 200) {
      configCheck = configCheck.data
      window.configCheck = configCheck
      version = parseFloat(configCheck.version)
    }
  }
  if (!HOTS || HOTS.version < version) {
    HOTS = await axios.get(`https://heroes.report/stats/HOTS.json?${getRandomString()}`)
    HOTS = HOTS.data
    HOTS.version = version
    window.saveLocal(HOTS,'HOTS')
  }

  HOTS.nAwards = _.invert(HOTS.awardN)
  window.buildsData = await buildsPromise
  window.buildsData = window.buildsData.data
  const uniqueKeys = Object.keys(HOTS.unique).map(x => parseInt(x))
  const nUnique = uniqueKeys.length
  HOTS.talentPics = {}
  uniqueKeys.map(x => HOTS.unique[x].map(i => { HOTS.talentPics[i] = x }))
  HOTS.nMapStat = _.invert(HOTS.mapStatN)
  window.HOTS = HOTS
  await asleep(1) // give other processes a chance to move forward
  const heroes = {}
  const hKeys = Object.keys(HOTS.nHeroes).map(x => parseInt(x,10))
  for (let h = 0; h < hKeys.length; h++) {
    const k = hKeys[h]
    heroes[k] = {
      'id': k,
      'name': HOTS.nHeroes[k],
      'role': HOTS.roleN[k],
      'nick': HOTS.nickNames[k],
      'color': HOTS.ColorsDic[k],
      'darkColor': HOTS.darkColors[k],
      'franchise': HOTS.franchiseN[k]
    }
  }
  const mapKeys = Object.keys(HOTS.nMaps)
  const maps = {}
  for (let m=0; m<mapKeys.length; m++) {
    const mapID = mapKeys[m]
    maps[mapID] = {name: HOTS.nMaps[mapID], id: mapID}
  }
  maps[99] = {name: 'All Maps', id: 99}
  window.mapsDic = maps
  const sortedMaps = _.values(maps, 'id')
  const sortedHeroes = _.values(heroes, 'id')
  sortedMaps.sort((x, y) => x.name < y.name ? -1 : 1)
  sortedHeroes.sort((x, y) => x.name < y.name ? -1 : 1)
  const { times, builds, buildsArray } = timeUnpacker(HOTS, window.buildsData)
  console.log(times,builds,buildsArray,'heeya')
  const d = {
    heroes,
    roles: HOTS.roles.map(x => { return {id: x} }),
    times,
    sortedMaps,
    sortedHeroes,
    builds,
    buildsArray
  }
  document.getElementById('loadingWrapper').style.visibility = 'hidden'
  return {
    type: GET_HOTS_DATA,
    payload: d
  }
}

export { GET_HOTS_DATA, getHOTSDictionary }
