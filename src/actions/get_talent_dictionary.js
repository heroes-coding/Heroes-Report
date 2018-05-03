import axios from 'axios'
import { getRandomString } from '../helpers/smallHelpers'
import asleep from '../helpers/asleep'
import _ from 'lodash'
const UPDATE_TALENT_DIC = 'update_talent_dic'
export { UPDATE_TALENT_DIC, getTalentDic }

const unpackTalentBuilder = (talentBuilder) => {
  const talentDic = {builds: talentBuilder.builds}
  const builds = Object.keys(talentBuilder.builds).map(x => parseInt(x))
  const heroes = Object.keys(talentBuilder).filter(x => !isNaN(x)).map(x => parseInt(x))
  const buildIndexes = {}
  for (let b=0;b<builds.length;b++) {
    const build = builds[b]
    talentDic[build] = {}
    buildIndexes[parseInt(talentBuilder.builds[build])] = build
  }
  const minBuilds = {}
  const changes = {}
  for (let h=0;h<heroes.length;h++) {
    const hero = heroes[h]
    minBuilds[hero] = buildIndexes[talentBuilder[hero][0]]
    changes[hero] = {}
    for (let t=0;t<7;t++) {
      const tKeys = Object.keys(talentBuilder[hero][t+1])
      for (let k=0;k<tKeys.length;k++) {
        const tKey = tKeys[k]
        const tChanges = talentBuilder[hero][t+1][tKey]
        for (let c=0;c<tChanges.length;c++) {
          const [ buildN, tal ] = talentBuilder[hero][t+1][tKey][c]
          if (!changes[hero].hasOwnProperty(buildN)) changes[hero][buildN] = []
          changes[hero][buildN].push([t, tKey, tal])
        }
      }
    }
  }
  let previousBuild
  for (let b=0;b<builds.length;b++) {
    const build = parseInt(builds[b])
    const buildN = talentBuilder.builds[build]
    for (let h=0;h<heroes.length;h++) {
      const hero = heroes[h]
      const minBuild = minBuilds[hero]
      if (minBuild > build) continue
      if (minBuild === build) talentDic[build][hero] = [{0:null},{0:null},{0:null},{0:null},{0:null},{0:null},{0:null}]
      if (previousBuild && minBuild < build) talentDic[build][hero] = JSON.parse(JSON.stringify(talentDic[previousBuild][hero]))
      if (changes[hero].hasOwnProperty(buildN)) {
        const talChanges = changes[hero][buildN]
        for (let t=0;t<talChanges.length;t++) {
          const [ talent, bracket, number ] = talChanges[t]
          talentDic[build][hero][talent][bracket] = number
        }
      }
    }
    previousBuild = build
  }
  return talentDic
}

async function getTalentDic() {
  while (!window.configCheck) {
    await asleep(30)
  }
  let talentDic
  let version = parseFloat(window.configCheck.talentDicVersion)
  let needNew = true
  if (window.localStorage.hasOwnProperty('talentDic')) {
    talentDic = window.loadLocal('talentDic')
    if (talentDic.version === version) {
      needNew = false
    }
  }
  needNew = true
  if (needNew) {
    const talentBuilder = await axios.get(`https://heroes.report/local/talentBuilder.json?${getRandomString()}`)
    talentDic = unpackTalentBuilder(talentBuilder.data)
    /*
    talentDic = await axios.get(`https://heroes.report/local/talentDic.json?${getRandomString()}`)
    talentDic = talentDic.data
    */
    talentDic.builds = _.invert(talentDic.builds)
    talentDic.version = version
    window.saveLocal(talentDic,'talentDic')
  }
  window.talentDic = talentDic
  window.buildDic = talentDic.builds
  return {
    type: UPDATE_TALENT_DIC,
    talentDic
  }
}
