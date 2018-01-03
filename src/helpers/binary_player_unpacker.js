function replayIntArraysFromBytes(buffer) {
  const dataview = new DataView(buffer)
  const nReplays = Math.floor(dataview.byteLength/52)
  const replayIntArrays = []
  for (let r=0;r<nReplays;r++) {
    // all player replays have one baker's dozen of 32 bit / 4 byte unsigned integers.  This is hard coded and partial bit packed (with theoretically possible overflows) to save a crazy amount of space
    const replayIntArray = []
    for (let n=0;n<13;n++) {
      replayIntArray.push(dataview.getUint32(r*52+n*4))
    }
    replayIntArrays.push(replayIntArray)
  }
  return replayIntArrays
}

/*
export const fakeLaunchDate = (new Date(2015, 5, 1, 20, 0, 0, 0)).getTime()
export const minSinceLaunchToDate = function(minSinceLaunch) {
  return new Date(fakeLaunchDate + minSinceLaunch*60000)
}
*/

export default async function getPlayerBinary(bnetID) {
  let promise = new Promise(function(resolve, reject) {
    const binaryReq = new window.XMLHttpRequest()
    binaryReq.open("GET", `https://heroes.report/stats/players/${bnetID}`, true)
    binaryReq.responseType = "arraybuffer"
    binaryReq.onload = function(oEvent) {
      const startTime = window.performance.now()
      const arrayBuffer = binaryReq.response
      if (arrayBuffer) {
        const replayIntArrays = replayIntArraysFromBytes(arrayBuffer)
        const newReplays = []
        for (let r=0;r<replayIntArrays.length;r++) {
          try {
            newReplays.push(unpackReplay(replayIntArrays[r]))
          } catch (e) {
            console.log(e)
          }
        }
        console.log(`It took ${Math.round(window.performance.now()*100 - 100*startTime)/100} ms to unpack binary data`)
        window.newReplays = newReplays
        resolve(newReplays)
      }
    }
    binaryReq.send(null)
  })
  return promise
}

const unpackData = function(total, max, descaler) {
  const value = total%max*descaler
  return [Math.floor(total/max), value]
}

const replayVals = [
  [['buildIndex',321,1], ['map',35,1], ['length', 2520, 1], ['hero0',147,1]],
  [['MSL',5843492,1], ['mode',5,1], ['hero1',147,1]],
  [['hero2',147,1],['hero3',147,1],['hero4',147,1], ['hero5',147,1], ['firstTo10',2,1], ['winners',2,1]],
  [['hero6',147,1],['hero7',147,1],['hero8',147,1], ['hero9',147,1], ['firstTo20',2,1], ['firstFort',2,1]],
  [['Vengeances',23,1], ['Kills',57,1], ['mapStatID0',40,1], ['talent0',5,1], ['talent1',5,1], ['talent2',5,1], ['talent3',5,1], ['talent4',5,1], ['talent5',5,1], ['talent6',5,1]],
  [['SelfHealing',168,2000],['MercenaryCampCaptures',34,1],['WatchTowerCaptures',70,1], ['ExperienceContribution',100,960], ['Assists',99,1]],
  [['mapStatID1',40,1], ['SecondsSpentDead',1100,1.5], ['SiegeDamage',100,10000], ['Team0End',30,1], ['Team1End',30,1]],
  [['SecondsofRoots', 250,1.5], ['HighestKillStreak',72,1], ['HeroDamage',500,1000], ['StructureDamage',230,1000], ['Feeder',2,1]],
  [['TeamfightDamageTaken',1000,1000], ['Healing',1000,1000], ['SecondsofSilence', 1050, 1.5], ['BigTalker',2,1], ['Pinger',2,1]],
  [['RegenGlobesCollected',313,1],['Escapes',27,1], ['SecondsonFire',185,10], ['TeamfightHeroDamage',265,1000]],
  [['Award',40,1], ['Deaths',40,1], ['mapStatValues1',500,1], ['mapStatValues0',500,1], ['slot', 10, 1]],
  [['SecondsofCrowdControl',2500,4],['SecondsofStuns',268,1], ['ProtectionGiventoAllies',160,1000], ['OutnumberedDeaths',38,1]],
  [['teamMercCaptures',88,1], ['votesReceived',11,1],['MinionDamage',80,10000], ['heroTownKills',6,1], ['teamTownKills',12,1], ['teamTownKills',12,1], ['WetNoodle',2,1], ['DangerousNurse',2,1], ['VotedFor',3,1], ['parseVersion',3,1]]
]

replayVals.map(x => x.reverse()) // returns reversed array but also reverses in place, needed for bit unpacking

function unpackReplay(replayInts) {
  // replayInts are the important condensed data from the entire replay
  if (replayInts.length !== replayVals.length) {
    const e = new Error('Corrupt replay error')
    throw e
  }
  const replayData = {}
  const heroes = []
  const talents = []
  for (let v=0;v<replayVals.length;v++) {
    let repInt = replayInts[v]
    const replayKeys = replayVals[v]
    for (let k=0;k<replayKeys.length;k++) {
      const [ term, max, multiplier ] = replayKeys[k]
      const [ remainingInt, value ] = unpackData(repInt, max, multiplier)
      repInt = remainingInt
      if (term.length===5 && term.includes('hero')) {
        heroes[parseInt(term[4])] = value
      } else if (term.includes('talent')) {
        talents[parseInt(term[6])] = value
      } else {
        replayData[term] = value
      }
    }
  }
  replayData.heroes = heroes
  replayData.talents = talents
  return replayData
}
