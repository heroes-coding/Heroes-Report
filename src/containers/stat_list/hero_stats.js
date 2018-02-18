import React, { Component } from 'react'
import { connect } from 'react-redux'
import { getTimedData, getHOTSDictionary } from '../../actions'
import { heroStatToKey } from '../../helpers/unpack_hero_time_data'
import TimedDataSelector from '../../selectors/timed_data_selector'
import * as d3 from 'd3'
import StatListTemplate from './stat_list_template'
import Graph from '../../components/graph/graph'
import { formatNumber, roundedPercent, roundedPercentPercent, MSLToDateString, formatStatNumber, sToM, formatDate, DateToMSL, statSToM } from '../../helpers/smallHelpers'
import getWilson from '../../helpers/wilson'
import PicHolder from '../customTable/picHolder'
import NameHolder from '../customTable/nameHolder'
import CustomTable from '../customTable/data_table'

class HeroStatList extends Component {
  componentDidMount() {
    this.props.getTimedData(this.props.prefs,this.props.curHero)
  }
  constructor(props) {
    super(props)
    this.state = {stat: "Win rate", statID: 12}
    this.getGraphs = this.getGraphs.bind(this)
    this.changeGraph = this.changeGraph.bind(this)
    this.stat = this.stat.bind(this)
  }
  stat(statName,lastBuild, allBuilds) {
    const index = heroStatToKey[statName]
    let formatter = formatNumber
    if (statName.includes("Time")) {
      formatter = sToM
    }
    const stat = formatter(lastBuild[index][2]/100).toString()
    const stats = allBuilds.map(x => x[index][2]/100)
    const std = stats.length > 1 ? formatter(d3.deviation(stats)).toString() : '---'
    return {name:statName, left: stat, right: std, statName}
  }
  oStat(statName,lastBuild, allBuilds, formatter) {
    const index = heroStatToKey[statName]
    const stat = formatter(lastBuild[index]).toString()
    const stats = allBuilds.map(x => x[index])
    const std = stats.length > 1 ? formatter(d3.deviation(stats)).toString() : '---'
    return {name:statName === 'winrate' ? 'Win rate' : statName, left: stat, right: std, statName}
  }
  percent(statName,lastBuild, allBuilds) {
    const index = heroStatToKey[statName]
    const stat = roundedPercent(lastBuild[index]).toString()
    const stats = allBuilds.map(x => x[index])
    const std = stats.length > 1 ? roundedPercent(d3.deviation(stats)).toString() : '---'
    return {name:statName, left: stat, right: std, statName}
  }
  changeGraph(stat, statName) {
    this.setState({stat: stat==='winrate' ? 'Win rate': stat, statID:heroStatToKey[stat]})
  }
  getGraphs() {
    const buildData = this.props[0].builds
    const { stat, statID } = this.state
    let stats, yFormatter
    if (stat==='KDA') {
      stats = buildData.map(x => {
        const [ K, A, D ] = x.slice(14,17).map(x => x[2])
        return D === 0 ? 0 : (K+A)/D
      })
      yFormatter = formatNumber
    } else if (statID < 13) {
      stats = buildData.map(x => x[statID])
      yFormatter = statID === 12 || stat.includes("Δ") ? roundedPercent : formatNumber
    } else {
      stats = buildData.map(x => x[statID][2])
      yFormatter = formatStatNumber
    }
    if (stat.includes("Time")) {
      yFormatter = statSToM
    } else if (statID === 5) {
      yFormatter = sToM
    }
    let data
    buildData.sort((x,y) => x[1] < y[1] ? -1 : 1)

    try {
      data = buildData.map((x,i) => { return [DateToMSL(window.builds[x[1]].dates[2]),stats[i],i,x[2]] })
    } catch (e) {
      console.log(e)
      return <div></div>
    }
    data = data.filter(x => x[1])
    const color = window.HOTS.ColorsDic[this.props.curHero]
    let labelPoints = data.map(x => {
      const [ MSL, s, index ] = x
      const val = yFormatter(s)
      const { name, id, dates } = window.builds[buildData[index][1]]
      return {
        name:`${stat} => ${val}`,
        desc:`${this.hero} had an average ${val} ${stat} over ${buildData[index][2]} matches during build ${id} (${name}), from ${formatDate(dates[0])} until ${formatDate(dates[1])}`,
        size:4,
        color:color,
        1:s,
        0:MSL
      }
    })
    let errorBars = null
    if (statID===12) {
      errorBars = data.map(x => [x[0],...getWilson(x[3]*x[1]/1000,x[3]).map(x => x*1000)])
    }
    return (
      <div className="graphs">
        <Graph
          key={statID}
          errorBars={errorBars}
          graphClass="heroStat winrateGraph"
          linePoints={data}
          labelPoints={labelPoints}
          xLabel="Date"
          yLabel={stat}
          title={`${stat} over time`}
          xRatio={500}
          yRatio={290}
          xOff={70}
          yOff={90}
          noArea={true}
          formatter={MSLToDateString}
          yFormatter={yFormatter}
        />
      </div>
    )
  }
  render() {
    if (!this.props[0] || !this.props.HOTS) {
      return <div></div>
    }
    let hero = this.props.curHero
    hero = window.HOTS ? window.HOTS.nHeroes[hero] : hero
    this.hero = hero
    const buildData = this.props[0].builds
    const buildTimeFrame = this.props.prefs.time
    if (!this.props[0].dict.hasOwnProperty(buildTimeFrame)) {
      return <div></div>
    }
    const [ buildType, buildIndex ] = this.props[0].dict[buildTimeFrame]
    const lastBuild = this.props[0][buildType][buildIndex]
    const [ Kills, Assists, Deaths ] = lastBuild.slice(14,17)
    const winRate = lastBuild[12]
    const matches = lastBuild[2]
    const KDA = Deaths[2] ? (Kills[2]+Assists[2])/Deaths[2] : Kills[2] + Assists[2] === 0 ? 0 : Infinity
    const KDAstat = formatNumber(KDA).toString()
    const KDAstats = buildData.map(x => {
      const [ Kills, Assists, Deaths ] = x.slice(14,17)
      return Deaths[2] ? (Kills[2]+Assists[2])/Deaths[2] : Kills[2] + Assists[2] === 0
    })
    const KDAstd = KDAstats.length > 1 ? formatNumber(d3.deviation(KDAstats)).toString() : '---'
    return (
      <div className='flex statsList col-12 col-sm 6 col-lg-3 order-lg-first'>
        <div className='stat_item_container row'>
          <StatListTemplate
            clickFunction={this.changeGraph}
            title={`Stats for ${hero}`}
            graphs={this.getGraphs()}
            subTitle={`Won ${roundedPercent(lastBuild[12])} (${Math.round(matches*winRate/1000)}/${matches}  matches)`}
            data={[
              {category: 'Overall Stats',
                left:'Patch',
                right: 'Sigma',
                hasGraphs: true,
                stats:[
                  ...[['Matches',formatNumber], ['winrate',roundedPercent], ['Match Length',sToM],["1st Rd. Bans",formatNumber],["2nd Rd. Bans",formatNumber]].map(s => { return this.oStat(s[0],lastBuild, buildData,s[1]) }),
                  ...['Experience', 'Mercs', 'Globes', "Time on Fire", "Level Avg", "Pings"].map(s => { return this.stat(s,lastBuild, buildData) })
                ]},
              {category: 'CC Stats',
                left:'Mean',
                right: 'Sigma',
                hasGraphs: true,
                stats:[
                  ...["CC' Time", "Stun Time", "Silence Time", "Root Time"].map(s => { return this.stat(s,lastBuild, buildData) })
                ]},
            ]}
          />
          <StatListTemplate
            clickFunction={this.changeGraph}
            data={[
              {category: 'Win % Deltas',
                left:'Patch',
                right: 'Sigma',
                rightLabel: 'One standard deviation for this stat across all patches',
                hasGraphs: true,
                stats:['1st To 10 Δ','1st To 20 Δ', '1st Fort Δ', "Short Game Δ","Norm. Game Δ","Long Game Δ"].map(s => { return this.percent(s,lastBuild, buildData) })
              },
              {category: 'Death Stats',
                left:'Mean',
                right: 'Sigma',
                hasGraphs: true,
                stats:[
                  {name:'KDA', left: KDAstat, right: KDAstd, statName: 'KDA'},
                  ...["Deaths", "Out#d Deaths", "Dead Time", "Kills", "Vengeances", "Kill Streak", "Assists", "Escapes","TF Escapes"].map(s => { return this.stat(s,lastBuild, buildData) })
                ]},
              {category: 'Sustain Stats',
                left:'Mean',
                right: 'Sigma',
                hasGraphs: true,
                stats:[
                  ...["Heal & Shld","Damage Taken","TF Dam Taken", "Healing", "Self Healing", "Protection", "Clutch Heals"].map(s => { return this.stat(s,lastBuild, buildData) })
                ]},
              {category: 'Damage Stats',
                left:'Mean',
                right: 'Sigma',
                hasGraphs: true,
                stats:[
                  ...["Hero Damage", "TF Hero Dam", "Building Dam", "Siege Dam", "Minion Dam", "Creep Dam", "Summon Dam"].map(s => { return this.stat(s,lastBuild, buildData) })
                ]},
            ]}
          />
        </div>
      </div>
    )
  }
}

class MatchupTable extends Component {
  constructor(props) {
    super(props)
    this.renderInfo = this.renderInfo.bind(this)
    this.nameRenderer = this.nameRenderer.bind(this)
    this.picRenderer = this.picRenderer.bind(this)
    this.reorder = this.reorder.bind(this)
    this.showGraphs = this.showGraphs.bind(this)
    this.getGraphs = this.getGraphs.bind(this)
    this.state = {
      orderColumn: 'Matches vs',
      orderID: 2,
      desc: true,
      graphHero: null
    }
  }
  getGraphs() {
    if (!window.HOTS) {
      return <div />
    }
    const {id,name,color} = this.state.graphHero
    let hero = window.HOTS.nHeroes[this.props.curHero]
    const matchupData = !this.props[0] || !window.HOTS ? [] : this.props[0].builds
    matchupData.sort((x,y) => x[1] < y[1] ? -1 : 1)
    const data1 = []
    const labelPoints1 = []
    const data2 = []
    const labelPoints2 = []
    matchupData.map((x,i) => {
      const heroData = x.heroes[id]
      if (!heroData) {
        return
      }
      const [ winsW, matchesW, winsA, matchesA ] = x.heroes[id]
      const build = x[1]
      const buildName = window.builds[build].name
      const [ startTime, endTime, midTime ] = window.builds[build].dates
      let MSL = DateToMSL(midTime)
      const buildString = `${name} over ${matchesW} matches during build ${build} (${buildName}), from ${formatDate(startTime)} until ${formatDate(endTime)}`
      if (matchesW) {
        let wrW = 1-winsW/matchesW
        // let result = getWilson(winsW,matchesW)
        const wrWS = roundedPercent(wrW*1000)
        data1.push([MSL, wrW])
        labelPoints1.push({
          name:`${wrWS} win rate with ${name}`,
          desc:`${hero} had a win rate of ${wrWS} with ${buildString}`,
          size:4,
          color:color,
          1:wrW,
          0:MSL
        })
      }
      if (matchesA) {
        let wrA = 1-winsA/matchesA
        // let result = getWilson(winsW,matchesW)
        const wrAS = roundedPercent(wrA*1000)
        data2.push([MSL, wrA])
        labelPoints2.push({
          name:`${wrAS} win rate vs. ${name}`,
          desc:`${hero} had a win rate of ${wrAS} against ${buildString}`,
          size:4,
          color:color,
          1:wrA,
          0:MSL
        })
      }
    })
    return (
      <div className="matchupGraphs">
        <Graph
          graphClass="matchupsWith winrateGraph"
          linePoints={data1}
          labelPoints={labelPoints1}
          xLabel="Date"
          yLabel='Win rate'
          title={`Win % with ${name} over time`}
          xRatio={500}
          yRatio={290}
          xOff={70}
          yOff={90}
          noArea={true}
          formatter={MSLToDateString}
          yFormatter={roundedPercentPercent}
        />
        <Graph
          graphClass="matchupsAgainst winrateGraph"
          linePoints={data2}
          labelPoints={labelPoints2}
          xLabel="Date"
          yLabel='Win rate'
          title={`Win % vs ${name} over time`}
          xRatio={500}
          yRatio={290}
          xOff={70}
          yOff={90}
          noArea={true}
          formatter={MSLToDateString}
          yFormatter={roundedPercentPercent}
        />
      </div>
    )
  }
  reorder(name,id) {
    this.setState({
      ...this.state,
      desc: this.state.orderColumn === name ? !this.state.desc : true,
      orderColumn: name,
      orderID: id
    })
  }
  renderInfo(value, id) {
    let display
    if (id%2) {
      display=roundedPercent(value*1000)
    } else {
      display=formatNumber(value)
    }

    return (
      <div key={id} className="rt-td statBoxHolder">
        {display}
      </div>
    )
  }
  showGraphs(id,name,color) {
    this.setState({
      ...this.state,
      graphHero: {id,name,color}
    })
  }
  nameRenderer(id,name,color) {
    return (
      <NameHolder
        id={id}
        name={name}
        color={color}
        updateFunction={this.showGraphs}
      />
    )
  }
  picRenderer(id,color) {
    return (
      <PicHolder
        baseLink = 'https://heroes.report/squareHeroes/'
        id={id}
        color={color}
      />
    )
  }
  render() {
    let heroID = parseInt(this.props.curHero)
    let hero
    let ready = true
    let color = "white"
    if (!this.props[0] || !this.props.HOTS || !window.HOTS) {
      ready = false
      return <div></div>
    } else {
      color = window.HOTS ? window.HOTS.ColorsDic[hero] : "white"
      hero = window.HOTS ? window.HOTS.nHeroes[heroID] : heroID
    }
    const build = this.props.prefs.time
    if (!this.props[0].dict.hasOwnProperty(build)) {
      return <div></div>
    }
    const [ buildType, buildIndex ] = this.props[0].dict[build]
    const buildData = this.props[0][buildType][buildIndex]
    const matchupData = !ready ? [] : buildData.heroes.map((x,i) => {
      const [ winsW, matchesW, winsA, matchesA ] = x
      return {
        name: window.HOTS.nHeroes[i],
        id: i,
        color: window.HOTS.ColorsDic[i],
        stats: [
          { value:matchesW, id: 0 },
          { value:matchesW === 0 ? 0 : 1-winsW/matchesW, id:1 },
          { value:matchesA, id: 2 },
          { value:matchesA === 0 ? 0 : 1-winsA/matchesA, id: 3 }
        ]
      }
    }).filter(x => x.stats[0] || x.stats[2]).filter(x => x.id !== heroID)
    const { orderID, desc } = this.state
    matchupData.sort((x,y) => {
      if (isNaN(orderID)) {
        return x[orderID] < y[orderID] ? 1 : -1
      } else {
        return x.stats[orderID].value < y.stats[orderID].value ? 1 : -1
      }
    })
    if (!desc) {
      matchupData.reverse()
    }
    matchupData.map((x,i) => {
      matchupData[i].rowClass = `rt-tr-group ${i%2 ? '-odd' : '-even'}`
    })

    return (
      <div className='matchupHolder'>
        <div className='stat_item_container row'>
          <div className='statItem col-12 col-sm-12 col-lg-12'>
            <div className="matchupTitle" >
              Hero matchups for <span style={{color}}>{hero}</span>
            </div>
            {this.state.graphHero&&this.getGraphs()}
            <CustomTable
              headers = {[
                {name:'Hero', id:'name'},
                {name:'Matches w/', id:0},
                {name:'Win rate w/', id:1},
                {name:'Matches vs', id:2},
                {name:'Win rate vs', id:3},
              ]}
              rows = {matchupData}
              cellRenderer = {this.renderInfo}
              nameRenderer = {this.nameRenderer}
              picRenderer = {this.picRenderer}
              reorder = {this.reorder}
              orderID = {this.state.orderID}
              orderColumn = {this.state.orderColumn}
              desc = {this.state.desc}
              rowsPerPage = {10}
            />
          </div>
        </div>
      </div>
    )
  }
}

function mapStateToProps(state, ownProps) {
  const {prefs, HOTS} = state
  return {...TimedDataSelector(state), prefs, HOTS, ...ownProps}
}

const connectedHSL = connect(mapStateToProps,{getTimedData, getHOTSDictionary})(HeroStatList)
const connectedMUT = connect(mapStateToProps,{getTimedData, getHOTSDictionary})(MatchupTable)

export { connectedHSL as HeroStatList, connectedMUT as MatchupTable }
