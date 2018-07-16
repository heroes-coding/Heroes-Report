import axios from 'axios'
import { getRandomString } from '../helpers/smallHelpers'
import _ from 'lodash'

export const visibleDic = {
  'ccescapes': [0,1,32, 33, 34, 35, 36, 37],
  'damage': [0,1,18, 22, 23, 24, 25, 26],
  'death': [0,1,16, 43, 44, 14, 15, 45, 46],
  'extra': [0,1,38, 39, 40, 41, 42],
  'meta':[0,1,2,3,4,5,6,13],
  'overall': [0,1,14, 15, 16, 17, 18, 19, 20, 21],
  'sustain': [0,1,27, 28, 29, 30, 20, 31],
  'timing': [0,1,7,8,9,10,11,12,13]
}

export const statCatsNames = {
  'meta': ['Matches','1st Round Bans','Second Round Bans','Suggested Ban Priority','Average Game Length','Win rate'],
  'timing': ["Short Game Win % &#916;","Normal Game Win % &#916;","Long Game Win % &#916;","1st to 10 Win % &#916;","1st to 20 Win % &#916;","First Fort Win % &#916;",'Win rate'],
  'sustain': ['Healing', 'Self Healing', 'Protection Given To Allies', 'Clutch Heals', 'Teamfight Damage Taken', 'Damage Taken'],
  'death': ['Deaths', 'Outnumbered Deaths', 'Seconds Spent Dead', 'Solo Kills', 'Assists', 'Highest Kill Streak', 'Vengeances'],
  'damage': ['Hero Damage', 'Teamfight Hero Damage', 'Structure Damage', 'Minion Damage', 'Creep Damage', 'Summon Damage'],
  'overall': ['Solo Kills', 'Assists', 'Deaths', 'Siege Damage', 'Hero Damage', 'Healing and Shielding', 'Teamfight Damage Taken', 'Experience Contribution'],
  'ccescapes': ["Seconds CC'ing Enemy Heroes", 'Seconds Silencing Enemy Heroes', 'Seconds Stunning Enemy Heroes', 'Seconds Rooting Enemy Heroes', 'Escapes', 'Teamfight Escapes'],
  'extra': ['Merc Camp Captures', 'Regen Globes', 'Seconds on Fire', 'Level Avg.', 'Pings']
}

export const heroStatToKey = {
  "Matches": 2,
  "1st Rd. Bans": 3,
  "2nd Rd. Bans": 4,
  "Match Length": 5,
  "Short Game Δ": 6,
  "Norm. Game Δ": 7,
  "Long Game Δ": 8,
  "1st To 10 Δ": 9,
  "1st To 20 Δ": 10,
  "1st Fort Δ": 11,
  "winrate": 12,
  "Kills": 14,
  "Assists": 15,
  "Deaths": 16,
  "Siege Dam": 17,
  "Hero Damage": 18,
  "Heal & Shld": 19,
  "TF Dam Taken": 20,
  "Experience": 21,
  "TF Hero Dam": 22,
  "Building Dam": 23,
  "Minion Dam": 24,
  "Creep Dam": 25,
  "Summon Dam": 26,
  "Healing": 27,
  "Self Healing": 28,
  "Protection": 29,
  "Clutch Heals": 30,
  "Damage Taken": 31,
  "CC' Time": 32,
  "Silence Time": 33,
  "Stun Time": 34,
  "Root Time": 35,
  "Escapes": 36,
  "TF Escapes": 37,
  "Mercs": 38,
  "Globes": 39,
  "Time on Fire": 40,
  "Level Avg": 41,
  "Pings": 42,
  "Out#d Deaths": 43,
  "Dead Time": 44,
  "Kill Streak": 45,
  "Vengeances": 46
}
const keyToHeroStat = {}
Object.keys(heroStatToKey).map(x => { keyToHeroStat[heroStatToKey[x]] = x })
export { keyToHeroStat }
window.heroStat = heroStatToKey

export async function getHeroTimeData(prefs,hero) {
  let promise = new Promise(async function(resolve, reject) {
    const url = `https://heroes.report/stats/h/${hero}/${prefs.mode}/${prefs.mmr}/${prefs.map}.json`
    const response = await axios.get(url)
    const dat = response.data
    const startTime = window.performance.now()
    window.heroData = dat
    let minBuild = 999999
    let total = 0
    let repWins = 0
    let maxBuildReplays = 0
    let gData = {'seasons':[],'builds':[],'All':[],'timeframes':[], 'dict':{}}
    let buildKeys = Object.keys(dat)
    for (let i=0;i<buildKeys.length;i++) {
      let build = buildKeys[i]
      if (!isNaN(build) && parseInt(build) < minBuild && parseInt(build) > 1000) {
        minBuild = build
      }
      if (!isNaN(build) && parseInt(build) > 1000) {
        let picks = dat[build][0]
        maxBuildReplays = picks > maxBuildReplays ? picks : maxBuildReplays
      }
      total += dat[build][0]
      repWins += dat[build][0]*dat[build][2]/1000
      let d = [build].concat(dat[build])
      let longMatches = d[1] - d[5] - d[7]
      let longWins = d[1]*d[3]/1000 - d[5]*d[4]/1000 - d[7]*d[6]/1000
      const winRate = [1,6,0].includes(prefs.mode) ? Math.round(1000*(d[1]*d[3]/1000 - d[16]/2)/(d[1]-d[16])) : d[3] // winrate * 1000
      let sData = [
        parseInt(hero),
        d[0], // build
        d[1], // matches
        d[14], // 1st round ban
        d[15], // 2nd round ban
        d[2], // length in secs
        d[4] - d[3], // short match winrate delta * 1000
        d[6] - d[3], // medium match winrate delta * 1000
        Math.round(1000*longWins/longMatches) - d[3], // long match winrate * 1000
        d[8] - d[3], // 1st to 10 WRDelta
        d[10] - d[3], // 1st to 20 WRDelta
        d[12] - d[3], // 1st Fort WRDelta
        [1,6,0].includes(prefs.mode) ? Math.round(1000*(d[1]*d[3]/1000 - d[16]/2)/(d[1]-d[16])) : d[3] // winrate * 1000
      ]
      for (let e=17;e<90;e+=2) {
        sData.push([d[e+1],d[e], Math.round(d[e+1]*sData[12]/1000 + d[e]*(1-sData[12]/1000))])
      }
      let toPush = []
      let statCats = {
        'overall':[2,3,0,10,7,[11,12,32],22,6],
        'damage':[7,30,9,19,15,16],
        'sustain':[11,12,32,25,22,8],
        'ccescapes':[14,24,28,31,27,23],
        'extra':[17,20,36,5,34],
        'death':[0,26,13,2,3,4,29]
      }
      for (let f=0;f<13;f++) {
        toPush.push(sData[f])
      }
      let catKeys = Object.keys(statCats)
      for (let c=0;c<catKeys.length;c++) {
        let idsToAdd = statCats[catKeys[c]]
        for (let x=0;x<idsToAdd.length;x++) {
          let statID = idsToAdd[x] + 13
          if (isNaN(statID)) {
            let sums = [0,0,0]
            for (let s=0;s<3;s++) {
              sums[0] += sData[[24,25,45][s]][0]
              sums[1] += sData[[24,25,45][s]][1]
              sums[2] += sData[[24,25,45][s]][2]
            }
            toPush[19] = sums
          } else {
            toPush[visibleDic[catKeys[c]][x+2]] = sData[statID]
          }
        }
      }
      toPush.heroes = []
      let dLength = d.length
      const heroData = d.slice(91,)
      const nHeroes = heroData.length/4
      const half = nHeroes*2
      for (let h=0;h<nHeroes;h++) {
        toPush.heroes.push([
          heroData[h*2],
          heroData[h*2+1],
          heroData[h*2+half],
          heroData[h*2+half+1],
        ])
      }
      toPush.shortWins = d[5]
      toPush.mediumWins = d[7]
      toPush.longWins = Math.round(longWins)
      toPush.longMatches = longMatches
      toPush.firstTo10Wins = d[9]
      toPush.firstTo20Wins = d[11]
      toPush.firstFortWins = d[13]
      const buildType = build === 'All' ? 'All' : (isNaN(build) ? 'seasons' : (parseInt(build) < 1000 ? 'timeframes' : 'builds'))
      gData.dict[build] = [buildType,gData[buildType].length]
      gData[buildType].push(toPush)
    }
    let avgWinrate = repWins/total*100
    // NEW FILTERING
    let nBuilds = gData.builds.length
    let mean = total/nBuilds
    let minimumMultiplier = 10
    let counter = 0
    gData.builds = gData.builds.filter((x,i) => {
      if (!window.builds.hasOwnProperty(x[1])) return false
      const passed = x[2]*minimumMultiplier > mean || (x[2]*minimumMultiplier*10 > mean && i > nBuilds-10)
      if (passed) {
        gData.dict[x[1]] = ['builds',counter++]
        return true
      } else return false
    })
    // NEW FILTERING END
    resolve([gData,gData.builds[gData.builds.length-1],avgWinrate,maxBuildReplays,parseInt(minBuild)])
  })
  return promise
}
