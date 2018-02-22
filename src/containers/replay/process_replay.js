import awardProcessor from '../../helpers/awardProcessor'
import { getWheelData } from './process_death'
import * as d3 from 'd3'

export default function processReplay(replay, bnetID) {
  window.replay = replay
  let { h, e, b, bnetIDs, r } = replay
  const heroes = [0,1,2,3,4,5,6,7,8,9].map(x => h[x])
  const partyData = e.p
  let parties = [0,0,0,0,0,0,0,0,0,0]
  if (partyData) {
    const firstParties = d3.max(partyData.slice(0,5))
    for (let t=0;t<10;t++) {
      const party = partyData[t]
      if (party) {
        const partyTeam = Math.floor(t/5)
        parties[t] = party + (partyTeam ? firstParties : 0)
      }
    }
  }
  const handles = heroes.map(x => `${x[3]}#${x[4]}`)
  const slot = bnetIDs.indexOf(bnetID)
  const team = Math.floor(slot/5)
  const [MSL, build, region, gameLength, mapName, gameMode, firstTo10, firstTo20, firstFort,winners] = r
  const wheelData = getWheelData(team,slot,heroes, replay.e.d)
  const allies = [0,1,2,3,4].map(x => x + team*5).filter(x => x !== slot)
  const enemies = [0,1,2,3,4].map(x => x + (1-team)*5)
  const players = [slot, ...allies, ...enemies]
  const colors = [0,1,2,3,4,5,6,7,8,9].map(p => window.HOTS.ColorsDic[heroes[p][0]])
  const heroNames = [0,1,2,3,4,5,6,7,8,9].map(p => window.HOTS.nHeroes[heroes[p][0]])
  const globes = [0,1,2,3,4,5,6,7,8,9].map(p => replay.e.g[p].map((t,i) => [t/60,i+1]))
  let ___ = [0,1,2,3,4,5,6,7,8,9].map(p => { globes[p].unshift([0,0]) })
  const maxGlobes = d3.max([].concat(...globes).map(g => g[1]))
  const towns = [[],[]]
  const mercs = [[],[]]
  const bans = [[],[]]
  const levels = [[],[]]
  for (let t=0;t<2;t++) {
    const tempTeam = t === team ? 0 : 1
    towns[tempTeam] = replay.e.t.filter(x => (x[3] === 10+t || (t*5 <= x[3] && x[3] < t*5 + 5)) || false)
    mercs[tempTeam] = replay.e.j[t].slice(0,)
    bans[tempTeam] = replay.b[t].map(b => isNaN(b) ? null : b)
    levels[tempTeam] = replay.e.l[t].map((c,i) => [c < 0 ? 0 : c/60, i+1])
    towns[tempTeam].unshift([0,0,0,0])
    mercs[tempTeam].unshift([0,0])
  }
  const levelMax = d3.max(levels.map(x => x.length))+1 // used for both levels graph and rescaling of experience numbers
  window.towns = towns
  const stackedXP = [ [ [],[],[],[],[] ] , [ [],[],[],[],[] ] ]
  const XPOrder = [2,5,3,6,4]
  const nXP = replay.e.x.length
  const maxTime = gameLength/60
  const maxXP = Math.max(d3.sum(replay.e.x[nXP-1].slice(2,)),d3.sum(replay.e.x[nXP-2].slice(2,)))
  const XPMult = levelMax/maxXP*0.8
  for (let x=2;x<replay.e.x.length;x++) {
    const xp = replay.e.x[x]
    const t= xp[1] === team ? 0 : 1
    let yOff = 0
    for (var xi=0;xi<5;xi++) {
      const yDelta = xp[XPOrder[xi]]*XPMult
      stackedXP[t][xi].push({'x':Math.ceil((x-1)/2)+(t === 0 ? -1 : 1)*0.125,'y0':yOff,'y1':yOff+yDelta})
      yOff += yDelta
    }
  }
  const mapStats = Object.keys(heroes[0][60]).map(x => parseInt(x))
  const stats = players.map(p => {
    const [ hero, slot, stat2, stat3, stat4, Award, Deaths, TownKills, Takedowns, Kills, Assists, KillStreak, Level, Experience, HeroDam, DamTaken, BuildingDam, SiegeDam, Healing, SelfHealing, DeadTime, CCTime, CreepDam, SummonDam, Mercs, WatchTowers, MinionDam, Globes, Silenced, statID1, statValue1, statID2, statValue2, statID3, statValue3, statID4, statValue4, statID5, statValue5, statID6, statValue6, statID7, statValue7, TFDamTaken, TFEscapes, SilenceTime, ClutchHeals, OutnmbdDeaths, Escapes, StunTime, Vengeances, TFHeroDam, RootTime, Protection, stat54, Pings, TypedChars, Votes, Votedfor, FireTime, mStats ] = replay.h[p]
    const pStats = { hero, slot, stat2, stat3, stat4, Award, Deaths, TownKills, Takedowns, Kills, Assists, KillStreak, Level, Experience, HeroDam, DamTaken, BuildingDam, SiegeDam, Healing, SelfHealing, DeadTime, CCTime, CreepDam, SummonDam, Mercs, WatchTowers, MinionDam, Globes, Silenced, statID1, statValue1, statID2, statValue2, statID3, statValue3, statID4, statValue4, statID5, statValue5, statID6, statValue6, statID7, statValue7, TFDamTaken, TFEscapes, SilenceTime, ClutchHeals, OutnmbdDeaths, Escapes, StunTime, Vengeances, TFHeroDam, RootTime, Protection, stat54, Pings, TypedChars, Votes, Votedfor, FireTime, mStats }
    mapStats.map(k => { pStats[k] = mStats[k] })
    return pStats
  })
  // derived stats
  players.map(p => {
    const { Deaths, Kills, Assists } = stats[p]
    stats[p].KDA = Deaths ? (Kills+Assists)/Deaths : Kills || Assists ? Infinity : 0
  })
  bnetIDs = players.map(p => bnetIDs[p])
  let awards
  if (window.HOTS.nAwards) {
    awards = [0,1,2,3,4,5,6,7,8,9].map(x => {
      let award = heroes[x][5] ? heroes[x][5] : null
      award = award && window.HOTS.nAwards.hasOwnProperty(award) ? window.HOTS.awardDic[window.HOTS.nAwards[award]] : null
      award = award ? [(Math.floor(x/5) === team ? 'Blue ' : 'Red ') + award[0],award[1]] : null
      const pAwards = awardProcessor(heroes,heroes[x])
      if (award) {
        pAwards.unshift(award)
      }
      return pAwards
    })
  }
  const repData = { heroes, handles, slot, team, gameMode, allies, enemies, players, colors, heroNames, globes, maxGlobes, towns, mercs, bans, levels, levelMax, stackedXP, maxTime, XPMult, bnetIDs, stats, awards, wheelData, MSL, mapStats, parties, region }
  return repData
}
