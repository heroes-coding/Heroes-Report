import _ from 'lodash'

export const hiddenColumns = [3,4,6,10,11,12,18,19,39,44,30,29,43,40,37,22,29]

export const defaultPreferences = {
  mode: 0,
  mmr: 10,
  time: 7,
  map: 99,
  hero: 8,
  bnetID: null,
  fullID: null,
  sortStats: ['KDA','Experience', 'Globes']
}

export const rehgarDic = {
  // why are the devs messing around with already established talent names?
  'rehgarlightningshieldearthshield': 1029,
  'rehgarearthbindtotemearthgrasptotem': 1036,
  'rehgarearthbindtotemcolossaltotem': 1030,
  'rehgarwolfrun': 1037,
  'rehgarferalheart': 1025,
  'rehgarancestralhealing': 1038,
  'rehgarbloodandthunder': 1027,
  'rehgarancestralhealingfarseersblessing': 1039,
  'rehgarhealingtotem': 1018,
  'rehgarlightningshieldelectriccharge': 1020,
  'rehgarlightningshieldrisingstorm': 1033,
  'rehgarlightningshieldstormcaller': 1019,
  'rehgarbloodlust': 1026,
  'rehgarfarsight': 1024
}

export const brawlMapIDs = [11, 13, 15, 16, 18]
export const allBrawlMapIDs = [11, 13, 15, 16, 18, 0, 8, 3]

export const statCatStats = {
  'Meta': [2, 52, 3, 4, 5, 6, 13],
  'Overall': [16, 17, 14, 24, 21, 51, 36, 20],
  'Death': [14, 40, 27, 16, 17, 18, 43],
  'Damage': [21, 44, 23, 33, 29, 30],
  'Sustain': [25, 26, 46, 39, 36, 22],
  'CC & Escapes': [28, 38, 42, 45, 41, 37],
  'Timing': [7, 8, 9, 10, 11, 12, 13],
  'Extra': [31, 34, 50, 19, 48]
}
export const statCats = Object.keys(statCatStats)
export const statCatChoices = statCats.map((x,i) => { return { name: x, id: x } })

export const modeChoices = [
  {"name":"All except brawl","id":0},
  {"name":"Quick Match","id":1},
  {"name":"Unranked Draft","id":2},
  {"name":"Hero League","id":3},
  {"name":"Team League","id":4},
  {"name":"Brawl","id":5},
  {"name":"Casual (QM & UD)","id":6},
  {"name":"Ranked (HL & TL)","id":7}
]
export const modeDic = _.keyBy(modeChoices, 'id')

export const mmrChoices = []
export const mmrData = {stars:[[0,1,2,3,4],[0],[1],[2],[3],[4],[0,1],[1,2],[2,3],[3,4],[1,2,3]],ids:[10,0,1,2,3,4,5,6,7,8,9],names:['All Ranks','Top 20%','Upper 20%','Middle 20%','Lower 20%','Bottom 20%','Top 40%','Upper Middle 40%','Lower Middle 40%','Bottom 40%','Middle 60%']}
for (let m=0;m<mmrData.names.length;m++) {
  mmrChoices.push({stars:mmrData.stars[m],name:mmrData.names[m],id:mmrData.ids[m]})
}
export const mmrDic = _.keyBy(mmrChoices, 'id')

export const statNames = {
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
  14: 'Deaths',
  16: 'Solo Kill',
  17: 'Assists',
  18: 'Kill Streak',
  19: 'Level',
  20: 'Experience',
  21: 'Hero Damage',
  22: 'Damage Taken',
  23: 'Structure Damage',
  24: 'Siege Damage',
  25: 'Healing',
  26: 'Self Healing',
  27: 'Time Spent Dead',
  28: "Time CC'd Enemies",
  29: 'Creep Damage',
  30: 'Summon Damage',
  31: 'Merc Captures',
  33: 'Minion Damage',
  34: 'Regen Globes',
  36: 'TF Damage Taken',
  37: 'TF Escapes',
  38: 'Silenced Enemies',
  39: 'Clutch Heals',
  40: 'Outnumbered Deaths',
  41: 'Escapes',
  42: 'Stunned Enemies',
  43: 'Vengeances',
  44: 'TF Hero Damage',
  45: 'Rooted Enemies',
  46: 'Protection Given',
  48: 'Pings',
  50: 'Time on Fire',
  51: 'Healing & Shielding',
  52: 'KDA'
}
