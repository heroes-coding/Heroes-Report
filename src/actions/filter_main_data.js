import axios from 'axios'
import * as d3 from "d3"
import { getRandomString, sortWithIndices, roundedPercent, formatStat, sToM, Around50 } from '../helpers/smallHelpers'
const UPDATE_MAIN_DATA = 'update_main_data'
export { UPDATE_MAIN_DATA, getMainData }

const totalStatsCount = 53

async function getMainData(prefs, rollbackState) {
  document.getElementById('loadingWrapper').style.visibility = 'visible'
  const url = `https://heroes.report/stats/o/${prefs.time}/${prefs.mode}/${prefs.mmr}/${prefs.map}.json?${getRandomString()}`
  let mainData, dData
  try {
    mainData = await axios.get(url)
    dData = filterData(mainData.data,prefs)
  } catch (e) {
    console.log(e)
    document.getElementById('loadingWrapper').style.visibility = 'hidden'
    return rollbackState()
  }
  return {
    type: UPDATE_MAIN_DATA,
    payload: dData
  }
}

function filterData(json,prefs) {
  let dData = {}
  let updatedMins
  if (typeof json[0] ==='number') {
    updatedMins = (new Date() - new Date(json[0]))/60000
    json = json.slice(1,)
  } else {
    updatedMins = undefined
  }
  let maxWR = 0
  let minWR = 1000
  let total = 0
  let nReps10 = 0
  for (let i=0;i<json.length;i++) {
    nReps10 += json[i][1]
  }
  let banRecs = []
  for (let i=0;i<json.length;i++) {
    banRecs.push(json[i][1]/(nReps10/10-json[i][14]-json[i][15])*(json[i][3]-500))
    total += json[i][1]
    maxWR = json[i][3] > maxWR ? json[i][3] : maxWR
    minWR = json[i][3] < minWR ? json[i][3] : minWR
  }
  banRecs = sortWithIndices(banRecs).reverse()
  let WRSpread = maxWR - minWR > 0 ? maxWR - minWR : 1000
  let nHeroes = json.length
  const overall = []
  for (let i=0;i<totalStatsCount;i++) {
    overall.push([])
  }
  for (let i=0;i<nHeroes;i++) {
    let longMatches = json[i][1] - json[i][5] - json[i][7]
    let longWins = json[i][1]*json[i][3]/1000 - json[i][5]*json[i][4]/1000 - json[i][7]*json[i][6]/1000
    let toPush = {
      2: {value: json[i][1]}, // matches
      3: {value: json[i][14]}, // 1st round ban
      4: {value: json[i][15]}, // 2nd round ban
      5: {value: banRecs.indexOf(i) +1}, // ban priority
      6: {value: json[i][2]}, // length in secs
      7: {value: json[i][4] - json[i][3]}, // short match winrate delta * 1000
      8: {value: json[i][6] - json[i][3]}, // medium match winrate delta * 1000
      9: {value: Math.round(1000*longWins/longMatches) - json[i][3]}, // long match winrate * 1000
      10: {value: json[i][8] - json[i][3]}, // 1st to 10 WRDelta
      11: {value: json[i][10] - json[i][3]}, // 1st to 20 WRDelta
      12: {value: json[i][12] - json[i][3]}, // 1st Fort WRDelta
      13: {value: [1,6,0].includes(prefs.mode) ? Math.round(1000*(json[i][1]*json[i][3]/1000 - json[i][16]/2)/(json[i][1]-json[i][16])) : json[i][3]} // winrate * 1000
    }
    const wr = toPush[13].value
    const minutes = toPush[6].value/60
    let count = 14
    for (let e=17;e<json[i].length;e+=2) {
      let wValue = json[i][e+1]
      let lValue = json[i][e]
      toPush[count] = {lValue, wValue, value: Math.round(wValue*wr/1000 + lValue*(1-wr/1000))}
      count += 1
    }
    // overall healing
    toPush[count] = {}
    const healingKeys = ['lValue','wValue','value']
    for (let s=0;s<3;s++) {
      let sum = 0
      const healingKey = healingKeys[s]
      for (let z=0;z<3;z++) {
        sum += toPush[[25,26,46][z]][healingKey]
      }
      toPush[count][healingKey] = sum
    }
    count += 1
    toPush[count] = {
      value: Math.round(100*(toPush[16].value+toPush[17].value)/toPush[14].value),
      lValue: Math.round(100*(toPush[16].lValue+toPush[17].lValue)/toPush[14].lValue),
      wValue: Math.round(100*(toPush[16].wValue+toPush[17].wValue)/toPush[14].wValue)
    }
    for (let v=2;v<count+1;v++) {
      if (v === 52 && json[i][0] === 44) {
        console.log('booya!')
        continue // don't add kda for abathur.  Not fair
      }
      const value = toPush[v].value
      overall[v].push(value)
      if (v>13) {
        toPush[v].perMinute = value/minutes
      }
    }
    dData[json[i][0]] = toPush
  }
  const heroKeys = Object.keys(dData)
  for (let s=2;s<totalStatsCount;s++) {
    const statsArray = overall[s]
    const min = d3.min(statsArray)
    const max = d3.max(statsArray)
    const mean = d3.mean(statsArray)
    const spread = max-min
    const ranks = sortWithIndices(statsArray)
    for (let hero=0;hero<heroKeys.length;hero++) {
      const h = heroKeys[hero]
      dData[h][s].id = s
      const value = dData[h][s].value
      dData[h][s].percent = Math.min((value-min)/spread,1)
      if (s === 5) {
        // ban rec rankings
        dData[h][s].display = value
        dData[h][s].percent = 1 - dData[h][s].percent
      } else if (s === 6) {
        // time
        dData[h][s].display = sToM(value)
      } else if (s < 6) {
        // unchanged
        dData[h][s].display = formatStat(value)
      } else if (s < 14) {
        // percents
        dData[h][s].display = roundedPercent(value)
        if (s === 13 || s < 10) {
          dData[h][s].color = Around50((dData[h][s].percent-0.5)/3*100+50)
        }
      } else {
        // raw stats
        dData[h][s].display = formatStat(value/100)
      }
    }
  }
  return {dData, total, updatedMins}
}

/*
2: 'Matches Played',
3: '1st Round Bans',
4: '2nd Round Bans',
5: 'Ban Priority',
6: 'Avg. Length',
7: 'Short Game Δ',
8: 'Avg. Game Δ',
9: 'Long Game Δ',
10: '1st to 10 Δ',
11: '1st to 20 Δ',
12: 'First Fort Δ',
13: 'Winrate',
*/
