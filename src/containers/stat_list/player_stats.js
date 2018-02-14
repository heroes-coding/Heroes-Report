import React, { Component } from 'react'
import { connect } from 'react-redux'
import PlayerReplaysSelector from '../../selectors/player_replays_selector'
import * as d3 from 'd3'
import StatListTemplate from './stat_list_template'
import KDensity from '../../components/graph/kdensity'
import Graph from '../../components/graph/graph'
import { formatNumber, roundedPercent, MSLToDateString, simplePercent, tinyPercent } from '../../helpers/smallHelpers'
import { decoderNumbers } from '../../helpers/binary_defs'
import { formatPercentile } from '../player_list/player_list'
import { exponentialSmoothing } from '../../helpers/exponential_smoother'
const mmrNames = {q: 'Quick Match', h: 'Hero League', t: 'Team League', u: "Urnk. Draft"}

class PlayerStatList extends Component {
  constructor(props) {
    super(props)
    this.state = { stat: 'winrate', statName: 'Win rate' }
    this.getGraphs = this.getGraphs.bind(this)
    this.changeGraph = this.changeGraph.bind(this)
    this.stat = this.stat.bind(this)
    this.mapStat = this.mapStat.bind(this)
  }
  mapStat(stat,name) {
    let expTime = window.performance.now()
    const stats = stat.map(x => x[1])
    const results = {
      name,
      left: formatNumber(d3.mean(stats)).toString(),
      right: stats.length > 1 ? formatNumber(d3.deviation(stats)).toString() : '----',
      statName: name
    }
    window.timings['Stat calculation (' + name + ')'] = Math.round(window.performance.now()*100 - 100*expTime)/100
    return results
  }
  stat(statName,playerData,providedStats,shortName) {
    let expTime = window.performance.now()
    let stats
    if (!providedStats) {
      const index = decoderNumbers[statName]
      stats = playerData.map(x => x.stats[index] === Infinity ? 20 : x.stats[index])
      if (stats.length === 0) {
        return <div></div>
      }
    } else {
      stats = providedStats
    }
    const mean = formatNumber(d3.mean(stats)).toString()
    const std = `${stats.length > 1 ? formatNumber(d3.deviation(stats)) : '---'}`
    window.timings['Stat calculation (' + statName + ')'] = Math.round(window.performance.now()*100 - 100*expTime)/100
    return {name: shortName || statName, left: mean, right: std, statName}
  }
  percent(statName,playerData) {
    let expTime = window.performance.now()
    const stats = playerData.filter(x => (x[statName] === 1 && x.Won) || (x[statName] === 1 && !x.Won)).map(x => x.Won)
    const negStats = playerData.filter(x => (x[statName] === 0 && x.Won) || (x[statName] === 0 && !x.Won)).map(x => x.Won)
    /*
    if (stats.length === 0) {
      return <div></div>
    }
    */
    const name = statName.replace('To',' To ').replace('Fort',' Fort')
    const allyMean = stats.length > 0 ? roundedPercent(Math.round(d3.mean(stats)*1000)).toString() : '-----'
    const enemyMean = negStats.length > 0 ? roundedPercent(Math.round(d3.mean(negStats)*1000)).toString() : '-----'
    window.timings['Stat calculation (' + statName + ')'] = Math.round(window.performance.now()*100 - 100*expTime)/100
    return {name, left: allyMean, right: enemyMean, statName}
  }
  mmr(mmrType,mmrData) {
    return {name: mmrType, left: mmrData.mmr.toString(), right:`(${formatPercentile(mmrData.percentile)})`}
  }
  changeGraph(stat, statName) {
    this.setState({stat, statName})
  }
  getGraphs() {
    const { playerData, mapSpecificStats } = this.props
    const { stat, statName } = this.state
    let stats, yFormatter
    let showK = true
    if (stat.includes('First')) {
      let expTime = window.performance.now()
      const allyData = playerData.filter(x => (x[stat] === 1 && x.Won) || (x[stat] === 1 && !x.Won)).map(x => { return [x.MSL,x.Won] }).reverse()
      const enemyData = playerData.filter(x => (x[stat] === 0 && x.Won) || (x[stat] === 0 && !x.Won)).map(x => { return [x.MSL,x.Won] }).reverse()
      const timedData = [exponentialSmoothing(allyData),exponentialSmoothing(enemyData)]
      window.timings['Winrate Correlation Data (' + statName + ')'] = Math.round(window.performance.now()*100 - 100*expTime)/100
      const colors = ["#00ff00","#ff0000"]
      const labels = ["Allies","Enemies"]
      return (
        <div className="graphs">
          <Graph
            graphClass="winrateGraph"
            multiLines={timedData}
            colors={colors}
            lineLabels={labels}
            xLabel="Date"
            yLabel="Your win rate"
            title={`${statName} win rates over time`}
            xRatio={500}
            yRatio={290}
            xOff={70}
            yOff={90}
            noArea={true}
            formatter={MSLToDateString}
            yFormatter={simplePercent}
          />
        </div>
      )
    }

    let dataTime = window.performance.now()
    let isMapStat = false
    if (stat==='KDA') {
      stats = playerData.map(x => x.KDA === Infinity ? 20 : x.KDA)
      yFormatter = formatNumber
    } else if (stat==='winrate') {
      stats = playerData.map(x => x.Won)
      yFormatter = simplePercent
      showK = false
    } else if (window.HOTS.mapStatN.hasOwnProperty(stat)) {
      stats = mapSpecificStats[window.HOTS.mapStatN[stat]]
      yFormatter = formatNumber
      isMapStat = true
    } else {
      const index = decoderNumbers[stat]
      stats = playerData.map(x => x.stats[index])
      yFormatter = formatNumber
    }
    window.timings['Data Prep (' + statName + ')'] = Math.round(window.performance.now()*100 - 100*dataTime)/100

    let winrateCorrelationData
    if (showK) {
      if (isMapStat) {
        let expTime = window.performance.now()
        const WRD = stats.map(s => {
          const [ MSL, stat, won ] = s
          return [stat, won]
        })
        WRD.sort((x,y) => x[0] < y[0] ? -1 : 1)
        winrateCorrelationData = exponentialSmoothing(WRD,0,statName)
        window.timings['Winrate correlation Data (' + statName + ')'] = Math.round(window.performance.now()*100 - 100*expTime)/100
      } else {
        let expTime = window.performance.now()
        winrateCorrelationData = exponentialSmoothing(playerData.map((x,i) => { return [stats[i],x.Won] }).sort((x,y) => x[0] < y[0] ? -1 : 1),0,statName)
        window.timings['Winrate ccorrelation Data (' + statName + ')'] = Math.round(window.performance.now()*100 - 100*expTime)/100
      }
    }
    let expTime = window.performance.now()
    let data
    if (isMapStat) {
      data = stats.map(s => {
        const [ MSL, stat, won ] = s
        return [ MSL, stat ]
      })
      data.sort((x,y) => x[0] < y[0] ? -1 : 1)
      stats = stats.map(x => x[1])
    } else {
      data = playerData.map((x,i) => { return [x.MSL,stats[i]] }).reverse()
    }
    const timedData = exponentialSmoothing(data,1,statName)
    window.timings['Winrate Over time Data'] = Math.round(window.performance.now()*100 - 100*expTime)/100
    return (
      <div className="graphs">
        <Graph
          graphClass="winrateGraph"
          linePoints={timedData}
          xLabel="Date"
          yLabel={statName}
          title={`${statName} over time`}
          xRatio={500}
          yRatio={290}
          xOff={70}
          yOff={90}
          noArea={true}
          formatter={MSLToDateString}
          yFormatter={yFormatter}
        />
        {showK&&winrateCorrelationData.length&&<Graph
          graphClass="winrateGraph"
          linePoints={winrateCorrelationData}
          xLabel={statName}
          yLabel="Win rate"
          title={`Win rate by ${statName}`}
          xRatio={500}
          yRatio={290}
          xOff={70}
          yOff={90}
          noArea={true}
          formatter={yFormatter}
          yFormatter={simplePercent}
        />}
        {showK&&<KDensity
          graphClass="winrateGraph"
          X={stats}
          xLabel={statName}
          title={`${statName} Distribution Plot`}
          xRatio={500}
          yRatio={280}
          xOff={70}
          yOff={70}
          formatter={yFormatter}
          yFormatter={tinyPercent}
        />}
      </div>
    )
  }
  render() {
    const { playerData, mapSpecificStats } = this.props
    const { mmr, stat, percent, mapStat } = this
    if (playerData.length === 0) {
      return <div></div>
    }
    const { h, q, u, t, handle } = this.props.playerInfo
    const outcomes = playerData.map(x => x.Won)
    const mmrData = [h&&mmr(mmrNames.h,h),q&&mmr(mmrNames.q,q),t&&mmr(mmrNames.t,t),u&&mmr(mmrNames.u,u)].filter(x => x)
    return (
      <div className='stat_item_container row'>
        <StatListTemplate
          clickFunction={this.changeGraph}
          title={handle}
          subTitle={`Won ${roundedPercent(Math.round(d3.mean(outcomes)*1000))} (${d3.sum(outcomes)}/${outcomes.length}  matches)`}
          graphs={this.getGraphs()}
          data={[
            {category: 'Event & Win %',
              left:'Ally',
              right: 'Enemy',
              hasGraphs: true,
              stats:['FirstTo10','FirstTo20','FirstFort'].map(s => { return percent(s,playerData) })
            },
            {category: 'Overall Stats',
              left:'Mean',
              right: 'Sigma',
              hasGraphs: true,
              stats:[
                ...[['Length','Match Length'],['Votes Received',null],['Globes',null],['Experience',null],['Player Town Kills','Town Kills'],['Team Town Kills','Team T.Kills'],['Mercs Captured','Mercs'],['Team Merc Captures','Team Mercs'],['Time on Fire',null],['Escapes',null]].map(s => { return stat(s[0],playerData,null,s[1]) })
              ]},
            {category: 'Map Stats',
              left:'Mean',
              right: 'Sigma',
              hasGraphs: true,
              stats:[
                ...[0,8,1,16,2,3,4,14,5,6,7,15,9,10,11,12,13,17].filter(s => mapSpecificStats[s].length).map(s => mapStat(mapSpecificStats[s], window.HOTS.nMapStat[s]))
              ]}
          ]}
        />
        <StatListTemplate
          clickFunction={this.changeGraph}
          data={[
            {category: 'Death Stats',
              left:'Mean',
              right: 'Sigma',
              hasGraphs: true,
              stats:[
                stat('KDA',playerData,playerData.map(x => x.KDA === Infinity ? 20 : x.KDA)),
                ...[['Kills',null],['Deaths',null],['Outnumbered Deaths','Out#d Deaths'],['Assists',null],['Dead Time','Dead Time'],['Vengeances',null]].map(s => { return stat(s[0],playerData,null,s[1]) })
              ]},
            {category: 'Sustain Stats',
              left:'Mean',
              right: 'Sigma',
              hasGraphs: true,
              stats:[
                ...[['Teamfight Damage Taken','TF Dam.Rec.'],['Healing',null],['Self Healing','Self Healing'],['Protection Given','Protection']].map(s => { return stat(s[0],playerData,null,s[1]) })
              ]},
            {category: 'Damage Stats',
              left:'Mean',
              right: 'Sigma',
              hasGraphs: true,
              stats:[
                ...[['Hero Damage',null],['Teamfight Hero Damage','TF Hero Dam.'],['Structure Damage','Build. Dam.'],['Minion Damage','Minion Dam.'],['Siege Damage','Siege Dam.']].map(s => { return stat(s[0],playerData,null,s[1]) })
              ]},
            {category: 'CC Stats',
              left:'Mean',
              right: 'Sigma',
              hasGraphs: true,
              stats:[
                ...[['Crowd Control Time','CC Seconds'],['Stun Time','Stun Seconds'],['Root Time','Root Time'],['Silence Time','Silence Time']].map(s => { return stat(s[0],playerData,null,s[1]) })
              ]},
            {category: 'MMR Type',
              left:'MMR',
              right: 'Perc.',
              hasGraphs: false,
              stats: mmrData
            },
          ]}
        />
      </div>
    )
  }
}

function mapStateToProps(state, ownProps) {
  return PlayerReplaysSelector(state)
}

export default connect(mapStateToProps)(PlayerStatList)
