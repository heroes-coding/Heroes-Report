const fullToPartial = function(replay, bnetID, HOTS) {
  const rep = {}
  const [minSinceLaunch, build, region, gameLength, mapName, gameMode, firstTo10, firstTo20, firstFort,winners] = replay.r
  const first10= firstTo10 && (firstTo10[0]===0 || firstTo10[0]) ? firstTo10[0] : 2
  const first20 = firstTo20 && (firstTo20[0]===0 || firstTo20[0]) ? firstTo20[0] : 2
  const firstF = firstFort && (firstFort[0]===0 || firstFort[0]) ? firstFort[0] : 2
  const slot = replay.bnetIDs.indexOf(bnetID)
  if (slot === -1) {
    return null
  }
  const team = Math.floor(slot/5)
  rep.FirstTo10 = first10 === 2 ? 2 : first10 === team ? 1 : 0
  rep.FirstTo20 = first20 === 2 ? 2 : first20 === team ? 1 : 0
  rep.FirstFort = firstF === 2 ? 2 : firstF === team ? 1 : 0
  rep.MSL = minSinceLaunch
  rep.winners = winners
  rep.Won = team === winners ? 1 : 0
  rep.build = build
  rep.bnetIDs = replay.bnetIDs
  rep.h = replay.h
  rep.heroes = [0,1,2,3,4,5,6,7,8,9].map(h => replay.h[h][0])
  const levels = replay.e.l.map(x => x.length)
  rep.ends = [levels[1-team],levels[team]]
  rep.hero = replay.h[slot][0]
  rep.role = HOTS.roleN[rep.hero]
  rep.franchise = HOTS.franchiseN[rep.hero]
  rep.fullTals = [30,32,34,36,38,40,42].map(x => replay.h[slot][x])
  rep.mode = gameMode
  rep.map = mapName
  rep.allies = [rep.hero]
  rep.enemies = []
  rep.allyRoleCounts = {0:0,1:0,2:0,3:0}
  rep.enemyRoleCounts = {0:0,1:0,2:0,3:0}
  rep.handles = [[null],[]]
  rep.order = []
  if (replay.e.po.length) {
    const firstPickers = replay.e.po[0]
  }
  for (let h=0;h<10;h++) {
    const thisTeam = Math.floor(h/5)
    const hInfo = replay.h[h]
    if (thisTeam === team) {
      rep.allyRoleCounts[HOTS.roleN[rep.heroes[h]]] += 1
      if (h === slot) {
        rep.handles[0][0] = `${hInfo[3]}#${hInfo[4]}`
        continue
      }
      rep.handles[0].push(`${hInfo[3]}#${hInfo[4]}`)
      rep.allies.push(rep.heroes[h])
    } else {
      rep.enemyRoleCounts[HOTS.roleN[rep.heroes[h]]] += 1
      rep.handles[5+rep.enemies.length] = `${hInfo[3]}#${hInfo[4]}`
      rep.handles[1].push(`${hInfo[3]}#${hInfo[4]}`)
      rep.enemies.push(rep.heroes[h])
    }
  }
  const y = replay.h[slot]
  const mapStatIDs = [null,null]
  const mapStats = [null,null]
  Object.keys(y[60]).map((x,i) => {
    mapStatIDs[i] = parseInt(x)
    mapStats[i] = y[60][x]
  })

  // eslint-disable-next-line no-unused-vars
  const [ hero, hslot, stat2, stat3, stat4, Award, Deaths, stat7, stat8, Kills, Assists, HighestKillStreak, HeroLevel, Experience, HeroDamage, DamageTaken, StructureDamage, SiegeDamage, Healing, SelfHealing, DeadTime, CrowdControlTime, CreepDamage, SummonDamage, Mercs, WatchTowerCaptures, MinionDamage, Globes, Silenced, statID1, statValue1, statID2, statValue2, statID3, statValue3, statID4, statValue4, statID5, statValue5, statID6, statValue6, statID7, statValue7, TeamfightDamageTaken, TeamfightEscapes, SecondsofSilence, ClutchHeals, OutnumberedDeaths, Escapes, SecondsofStuns, Vengeances, TeamfightHeroDamage, RootTime, ProtectionGiventoAllies, stat54, NumberofPings, NumberofChatCharactersTyped, stat57, Votedfor, SecondsonFire, mStats ] = y
  rep.KDA = Deaths === 0 ? 20 : (Kills + Assists)/Deaths
  const heroTownKills = Array(10).fill(0)
  const teamMercCaptures = [0,0]
  const teamDeaths = [0,0]
  const teamDamage = [0,0]
  const teamTownKills = [0,0]
  const votesReceived = Array(10).fill(0);
  [0,1,2,3,4,5,6,7,8,9].map(h => {
    const votee = replay.h[h][58]
    const mercs = replay.h[h][24]
    const damage = replay.h[h][14]
    const team = Math.floor(h/5)
    const deaths = replay.h[h][6]
    if (deaths) {
      teamDeaths[team] += deaths
    }
    if (damage) {
      teamDamage[team] += damage
    }
    if (mercs) {
      teamMercCaptures[team] += mercs
    }
    if (votee) {
      votesReceived[votee] += 1
    }
  })

  try {
    for (let t=0;t<replay.e.t.length;t++) {
      const [ time, x, y, p ] = replay.e.t[t]
      teamTownKills[ x < 128 ? 1 : 0 ] += 1
      if (p < 10) {
        heroTownKills[p] += 1
      }
    }
  } catch (e) {
    // do nothing.  Missing team data is okay.
  }

  rep.stats = [gameLength, mapName, -1, gameMode, minSinceLaunch, mapStatIDs[0], Kills, Vengeances, Assists, Experience, mapStatIDs[1], Mercs, SiegeDamage, rep.ends[1], rep.ends[0], SelfHealing, DeadTime, RootTime, NumberofChatCharactersTyped > 50 ? 1 : 0, SecondsonFire, TeamfightDamageTaken, Deaths >= (teamDeaths[team] - Deaths)/2 ? 1 : 0, StructureDamage, HeroDamage, TeamfightHeroDamage, SecondsofSilence, Healing, Escapes, Globes, mapStats[0], mapStats[1], Deaths, Award, NumberofPings > 42 ? 1 : 0, OutnumberedDeaths, ProtectionGiventoAllies, SecondsofStuns, CrowdControlTime, Votedfor ? (Math.floor(Votedfor/5) === team ? 0 : 1) : 2, (rep.role === 1 && HeroDamage > (teamDamage[team] - HeroDamage)/4) ? 1 : 0, HeroDamage < 0.1*(teamDamage[team] - HeroDamage) ? 1 : 0, teamTownKills[team], heroTownKills[slot], MinionDamage, votesReceived[slot], teamMercCaptures[team]]
  rep.stats = rep.stats.map(x => x || 0)
  return rep
}

exports.fullToPartial = fullToPartial
