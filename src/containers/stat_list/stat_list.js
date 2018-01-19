import React, { Component } from 'react'
import { connect } from 'react-redux'
import PlayerReplaysSelector from '../../selectors/player_replays_selector'
import * as d3 from 'd3'
import { formatNumber, roundedPercent } from '../../helpers/smallHelpers'
import { decoderNumbers } from '../../helpers/binary_defs'
import { formatPercentile } from '../player_list/player_list'
const mmrNames = {q: 'Quick Match', h: 'Hero League', t: 'Team League', u: "Urnk. Draft"}
const spacesLeft = 18
const spacesMiddle = 7
let statTime

let getSpace = function(spaces) {
  if (spaces<0) {
    return ""
  }
  return Array(spaces).fill('\u00A0').join("")
}

let stat = (statName,playerData,providedStats,shortName) => {
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
  const mean = formatNumber(d3.mean(stats))
  const std = stats.length > 1 ? formatNumber(d3.deviation(stats)) : '---'
  statName = shortName ? shortName : statName
  const spaceLeft = spacesLeft - statName.length - mean.toString().length
  const spaceMiddle = spacesMiddle-std.toString().length
  return (
    <div className='statBarHolder' key={statName}>
      <span className="statName">{statName}:</span>{getSpace(spaceLeft)}<span className="statValue">{mean}</span>{getSpace(spaceMiddle)}(<span className="stdValue">{std}</span>)
    </div>
  )
}

let percent = (statName,playerData) => {
  const startTime = window.performance.now()
  const stats = playerData.filter(x => (x[statName] === 1 && x.Won) || (x[statName] === 1 && !x.Won)).map(x => x.Won)
  const negStats = playerData.filter(x => (x[statName] === 0 && x.Won) || (x[statName] === 0 && !x.Won)).map(x => x.Won)
  if (stats.length === 0) {
    return <div></div>
  }
  statName = statName.replace('To',' To ').replace('Fort',' Fort')
  const allyMean = stats.length > 0 ? roundedPercent(Math.round(d3.mean(stats)*1000)) : '-----'
  const enemyMean = negStats.length > 0 ? roundedPercent(Math.round(d3.mean(negStats)*1000)) : '-----'
  statTime += window.performance.now() - startTime
  const spaceLeft = spacesLeft - statName.length - allyMean.toString().length + 2
  const spaceMiddle = spacesMiddle-enemyMean.toString().length
  return (
    <div className='statBarHolder' key={statName}>
      <span className="statName">{statName}:</span>{getSpace(spaceLeft)}<span className="statValue">{allyMean}</span>{getSpace(spaceMiddle)}<span className="stdValue">{enemyMean}</span>
    </div>
  )
}

let mmr = (mmrType,mmrData) => {
  const spaceLeft = spacesLeft - mmrType.length - mmrData.mmr.toString().length
  const spaceMiddle = spacesMiddle-mmrData.percentile.toString().length
  return (
    <div className='statBarHolder' key={mmrType}>
      <span className="statName">{mmrType}:</span>{getSpace(spaceLeft)}<span className="statValue">{mmrData.mmr}</span>{getSpace(spaceMiddle)}<span className="stdValue">{formatPercentile(mmrData.percentile)}</span>
    </div>
  )
}

let percentStat = (statName,playerData) => {
  const startTime = window.performance.now()
  const stats = playerData.map(x => x[statName])
  if (stats.length === 0) {
    return <div></div>
  }
  const mean = formatNumber(d3.mean(stats))
  const std = stats.length > 1 ? formatNumber(d3.deviation(stats)) : '---'
  statTime += window.performance.now() - startTime
  const spaceLeft = spacesLeft - statName.length - mean.toString().length
  const spaceMiddle = spacesMiddle-std.toString().length
  return (
    <div className='statBarHolder' key={statName}>
      <span className="statName">{statName}:</span>{getSpace(spaceLeft)}<span className="statValue">{mean}</span>{getSpace(spaceMiddle)}(<span className="stdValue">{std}</span>)
    </div>
  )
}

class StatList extends Component {
  constructor(props) {
    super(props)
  }
  render() {
    if (this.props.playerData.length === 0) {
      return <div></div>
    }
    const { h, q, u, t, handle } = this.props.playerInfo
    const outcomes = this.props.playerData.map(x => x.Won)
    return (
      <div className='container-fluid statsList col-12 col-md 6 col-lg-3 order-lg-first'>
        <div className='stat_item_container row'>
          <div className='statItem col-12 col-sm-6 col-lg-12'>
            <div className='handleHolder statBarHolder statBarTitle'>
              {handle}
              <br />
              {(statTime = 0)}
              <span id="winrate">Won {roundedPercent(Math.round(d3.mean(outcomes)*1000))} ({d3.sum(outcomes)}/{outcomes.length}  matches)</span>
            </div>
            <div className='statBarHolder statBarTitle'>
              Event{getSpace(spacesLeft-6)}Ally{getSpace(spacesMiddle-5)}Enemy
            </div>

            {percent('FirstTo10', this.props.playerData)}
            {percent('FirstTo20', this.props.playerData)}
            {percent('FirstFort', this.props.playerData)}
            <div className='statBarHolder statBarTitle'>
              Stat{getSpace(spacesLeft-7)}Mean{getSpace(spacesMiddle-3)}Sigma
            </div>
            {stat('KDA',this.props.playerData,this.props.playerData.map(x => x.KDA === Infinity ? 20 : x.KDA))}
            {stat('Kills',this.props.playerData)}
            {stat('Deaths',this.props.playerData)}
            {stat('Assists',this.props.playerData)}
            {stat('Globes',this.props.playerData)}
            {stat('Experience',this.props.playerData)}
            {stat('MercenaryCampCaptures',this.props.playerData,null,'Mercs')}
            {stat('SiegeDamage',this.props.playerData,null,'Siege Dam.')}
            {stat('StructureDamage',this.props.playerData,null,'Build. Dam.')}
            {stat('SecondsSpentDead',this.props.playerData,null,'DeadTime')}
            {stat('Vengeances',this.props.playerData)}
            {stat('SecondsofRoots',this.props.playerData,null,'Root Time')}
            <div className='statBarHolder statBarTitle'>
              MMR Type{getSpace(spacesLeft-11)}MMR{getSpace(spacesMiddle-2)}Perc.
            </div>
            {h&&mmr(mmrNames.h,h)}
            {q&&mmr(mmrNames.q,q)}
            {t&&mmr(mmrNames.t,t)}
            {u&&mmr(mmrNames.u,u)}
          </div>

        </div>
      </div>
    )
  }
}

function mapStateToProps(state, ownProps) {
  return PlayerReplaysSelector(state)
}

export default connect(mapStateToProps)(StatList)
