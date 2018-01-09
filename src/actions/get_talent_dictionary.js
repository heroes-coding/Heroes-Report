import axios from 'axios'
import { getRandomString } from '../helpers/smallHelpers'
import asleep from '../helpers/asleep'
import _ from 'lodash'
const UPDATE_TALENT_DIC = 'update_talent_dic'
export { UPDATE_TALENT_DIC, getTalentDic }

async function getTalentDic() {
  while (!window.configCheck) {
    await asleep(30)
  }
  let talentDic
  let version = parseFloat(window.configCheck.talentDicVersion)
  let needNew = true
  if (window.localStorage.hasOwnProperty('talentDic')) {
    talentDic = JSON.parse(window.localStorage.talentDic)
    if (talentDic.version === version) {
      needNew = false
    }
  }
  if (needNew) {
    talentDic = await axios.get(`https://heroes.report/stats/talentDic.json?${getRandomString()}`)
    talentDic = talentDic.data
    talentDic.builds = _.invert(talentDic.builds)
    talentDic.version = version
    window.localStorage.talentDic = JSON.stringify(talentDic)
  }
  window.talentDic = talentDic
  window.buildDic = talentDic.builds
  console.log(talentDic)
  return {
    type: UPDATE_TALENT_DIC,
    talentDic
  }
}
