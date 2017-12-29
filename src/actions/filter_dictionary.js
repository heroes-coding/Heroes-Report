import axios from 'axios'
import _ from 'lodash'
import { getRandomString } from '../helpers/smallHelpers'
import timeUnpacker from '../helpers/timeUnpacker'

const GET_HOTS_DATA = 'get_hots_data'

async function getHOTSDictionary() {
  const buildsPromise = await axios.get('https://heroes.report/stats/timeframes.json')
  let HOTS, configCheck
  let version = 0
  if (window.localStorage.hasOwnProperty('HOTS')) {
    const configCheckPromise = axios.get(`https://heroes.report/stats/config.json?${getRandomString()}`)
    // should implement lzstring here
    HOTS = window.localStorage.HOTS
    configCheck = await configCheckPromise
    if (configCheck.status === 200) {
      version = parseFloat(configCheck.data.version)
    }
  }

  if (!HOTS || HOTS.version < version) {
    HOTS = await axios.get(`https://heroes.report/stats/HOTS.json?${getRandomString()}`)
    HOTS = HOTS.data
    HOTS.version = version
    window.localStorage.HOTS = JSON.stringify(HOTS)
  } else {
    HOTS = JSON.parse(HOTS)
  }
  window.HOTS = HOTS
  window.buildsData = buildsPromise.data

  const heroes = {}
  const hKeys = Object.keys(HOTS.nHeroes).map(x => parseInt(x))
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
  sortedMaps.sort((x, y) => x.name < y.name ? -1 : 1)
  const times = timeUnpacker(HOTS, window.buildsData)
  const d = {
    heroes,
    roles: HOTS.roles.map(x => { return {id: x} }),
    times,
    sortedMaps
  }
  return {
    type: GET_HOTS_DATA,
    payload: d
  }
}

export { GET_HOTS_DATA, getHOTSDictionary }
