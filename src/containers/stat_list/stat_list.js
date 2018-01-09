import React, { Component } from 'react'
import { connect } from 'react-redux'
import PlayerReplaysSelector from '../../selectors/player_replays_selector'
import * as d3 from 'd3'
import { formatNumber } from '../../helpers/smallHelpers'
const spacesLeft = 18
const spacesMiddle = 7

let getSpace = function(spaces) {
  return Array(spaces).fill('\u00A0').join("")
}

let stat = (statName,playerData) => {
  const stats = playerData.map(x => x[statName] === Infinity ? 20 : x[statName])
  if (stats.length === 0) {
    return <div></div>
  }
  const mean = formatNumber(d3.mean(stats))
  const std = stats.length > 1 ? formatNumber(d3.deviation(stats)) : '---'
  const spaceLeft = spacesLeft - statName.length - mean.toString().length
  const spaceMiddle = spacesMiddle-std.toString().length
  return (
    <div className='statBarHolder' key={statName}>
      <span className="statName">{statName}:</span>{getSpace(spaceLeft)}<span className="statValue">{mean}</span>{getSpace(spaceMiddle)}(<span className="stdValue">{std}</span>)
    </div>
  )
}

let percentStat = (statName,playerData) => {
  const stats = playerData.map(x => x[statName])
  if (stats.length === 0) {
    return <div></div>
  }
  const mean = formatNumber(d3.mean(stats))
  const std = stats.length > 1 ? formatNumber(d3.deviation(stats)) : '---'
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
    console.log(this.props)
    return (
      <div className='container-fluid statsList col-12 col-md 6 col-lg-3'>
        <div className='stat_item_container row'>
          <div className='statItem col-12 col-sm-6 col-lg-12'>
            <div className='statBarHolder statBarTitle'>
              Stat{getSpace(spacesLeft-7)}Mean{getSpace(spacesMiddle-3)}Sigma
            </div>
            {stat('KDA',this.props.playerData)}
            {stat('Won',this.props.playerData)}
            {stat('Kills',this.props.playerData)}
            {stat('Deaths',this.props.playerData)}
            {stat('Assists',this.props.playerData)}
            {stat('Globes',this.props.playerData)}
            {stat('Experience',this.props.playerData)}
          </div>
          <div className='statItem col-12 col-sm-6 col-lg-12'>
            <div className='statBarHolder statBarTitle'>
              Stat{getSpace(spacesLeft-7)}Mean{getSpace(spacesMiddle-3)}Sigma
            </div>
            {stat('KDA',this.props.playerData)}
            {stat('Won',this.props.playerData)}
            {stat('Kills',this.props.playerData)}
            {stat('Deaths',this.props.playerData)}
            {stat('Assists',this.props.playerData)}
            {stat('Globes',this.props.playerData)}
            {stat('Experience',this.props.playerData)}
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
