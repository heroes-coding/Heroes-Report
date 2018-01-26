import React, { Component } from 'react'
import { connect } from 'react-redux'
import PlayerReplaysSelector from '../../selectors/player_replays_selector'
import * as d3 from 'd3'
import StatListTemplate from './stat_list_template'
import KDensity from '../../components/graph/kdensity'
import Graph from '../../components/graph/graph'
import { formatNumber, roundedPercent, MSLToDateString, simplePercent } from '../../helpers/smallHelpers'
import { decoderNumbers } from '../../helpers/binary_defs'
import { formatPercentile } from '../player_list/player_list'
import { exponentialSmoothing } from '../../helpers/exponential_smoother'
window.exponentialSmoothing = exponentialSmoothing
const mmrNames = {q: 'Quick Match', h: 'Hero League', t: 'Team League', u: "Urnk. Draft"}

class PlayerStatList extends Component {
  constructor(props) {
    super(props)
    this.state = { stat: 'winrate', statName: 'Win rate' }
    this.getGraphs = this.getGraphs.bind(this)
    this.changeGraph = this.changeGraph.bind(this)
    this.stat = this.stat.bind(this)
  }
  stat(statName,playerData,providedStats,shortName) {
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
    return {name: shortName || statName, left: mean, right: std, statName}
  }
  percent(statName,playerData) {
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
    return {name, left: allyMean, right: enemyMean, statName}
  }
  mmr(mmrType,mmrData) {
    return {name: mmrType, left: mmrData.mmr.toString(), right:`(${mmrData.percentile})`}
  }
  changeGraph(stat, statName) {
    this.setState({stat, statName})
  }
  getGraphs() {
    const { playerData } = this.props
    const { stat, statName } = this.state
    let stats, yFormatter
    let showK = true
    if (stat.includes('First')) {
      let expTime = window.performance.now()
      const allyData = playerData.filter(x => (x[stat] === 1 && x.Won) || (x[stat] === 1 && !x.Won)).map(x => { return [x.MSL,x.Won] }).reverse()
      const enemyData = playerData.filter(x => (x[stat] === 0 && x.Won) || (x[stat] === 0 && !x.Won)).map(x => { return [x.MSL,x.Won] }).reverse()
      const timedData = [exponentialSmoothing(allyData),exponentialSmoothing(enemyData)]
      console.log(`It took ${Math.round(window.performance.now()*100 - 100*expTime)/100} ms to calculate exponentially smoothed line`)
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
    if (stat==='KDA') {
      stats = playerData.map(x => x.KDA === Infinity ? 20 : x.KDA)
      yFormatter = formatNumber
    } else if (stat==='winrate') {
      stats = playerData.map(x => x.Won)
      yFormatter = simplePercent
      showK = false
    } else {
      const index = decoderNumbers[stat]
      stats = playerData.map(x => x.stats[index])
      yFormatter = formatNumber
    }
    let data = playerData.map((x,i) => { return [x.MSL,stats[i]] }).reverse()
    let expTime = window.performance.now()
    const timedData = exponentialSmoothing(data)
    console.log(`It took ${Math.round(window.performance.now()*100 - 100*expTime)/100} ms to calculate exponentially smoothed line`)
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
        />}
      </div>
    )
  }
  render() {
    const { playerData } = this.props
    const { mmr, stat, percent } = this
    if (playerData.length === 0) {
      return <div></div>
    }
    const { h, q, u, t, handle } = this.props.playerInfo
    const outcomes = playerData.map(x => x.Won)
    const mmrData = [h&&mmr(mmrNames.h,h),q&&mmr(mmrNames.q,q),t&&mmr(mmrNames.t,t),u&&mmr(mmrNames.u,u)].filter(x => x)
    return (
      <div className='container-fluid statsList col-12 col-md 6 col-lg-3 order-lg-first'>
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
              stats:['FirstTo10','FirstTo20'].map(s => { return percent(s,playerData) })
            },
            {category: 'Overall Stats',
              left:'Mean',
              right: 'Sigma',
              hasGraphs: true,
              stats:[
                stat('KDA',playerData,playerData.map(x => x.KDA === Infinity ? 20 : x.KDA)),
                ...[['Globes',null],['Experience',null],['Player Town Kills','Town Kills'],['Team Town Kills','Team T.Kills'],['Mercs Captured','Mercs'],['Team Merc Captures','Team Mercs'],['Length','Match Length'],['Time on Fire',null],['Escapes',null]].map(s => { return stat(s[0],playerData,null,s[1]) })
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
                stat('KDA',playerData,playerData.map(x => x.KDA === Infinity ? 20 : x.KDA)),
                ...[['Hero Damage',null],['Teamfight Hero Damage','TF Hero Dam.'],['Structure Damage','Build. Dam.'],['Minion Damage','Minion Dam.'],['Siege Damage','Siege Dam.']].map(s => { return stat(s[0],playerData,null,s[1]) })
              ]},
            {category: 'CC Stats',
              left:'Mean',
              right: 'Sigma',
              hasGraphs: true,
              stats:[
                stat('KDA',playerData,playerData.map(x => x.KDA === Infinity ? 20 : x.KDA)),
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
