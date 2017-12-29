import _ from 'lodash'

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
export const statCatChoices = statCats.map((x,i) => { return { name: x, id: x }})

export const modeChoices = [
  {"name":"All except brawl","id":0},
  {"name":"Quick Match","id":1},
  {"name":"Unranked Draft","id":3},
  {"name":"Hero League","id":4},
  {"name":"Team League","id":2},
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
