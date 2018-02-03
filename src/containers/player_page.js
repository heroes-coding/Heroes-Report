import React, { Component } from 'react'
import { connect } from 'react-redux'
import DataFiltersBar from './data_filters_bar'
import { ReplayList, PlayerMatchupTable } from './replay_list/replay_list'
import PlayerStats from './stat_list/player_stats'
import StatList from './stat_list/stat_list'
import { getPlayerData } from '../actions'

class PlayerPage extends Component {
  componentDidMount() {
    const {id} = this.props.match.params
    this.props.getPlayerData(id)
  }
  shouldComponentUpdate(nextProps) {
    const oldID = this.props.match.params.id
    const newID = nextProps.match.params.id
    if (oldID !== newID) {
      this.props.getPlayerData(newID)
      console.log('updating...')
    }
    return false
  }

  render() {
    const {id} = this.props.match.params
    return (
      <div className="overall">
        <div className="filtersHolder">
          <DataFiltersBar menu={1} />
        </div>
        <div className="row d-flex justify-content-end" id="playerPageHolder">
          <ReplayList playerID={id} />
          <PlayerStats playerID={id} />
        </div>
      </div>
    )
  }
}

function mapStateToProps(state, ownProps) {
  return ownProps
}

export default connect(mapStateToProps,{getPlayerData})(PlayerPage)
