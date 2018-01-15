import React, { Component } from 'react'
import { connect } from 'react-redux'
import DataFiltersBar from './data_filters_bar'
import _ from 'lodash'
import ReplayList from './replay_list/replay_list'
import StatList from './stat_list/stat_list'
import { getPlayerData } from '../actions'

class PlayerPage extends Component {
  componentDidMount() {
    const {id} = this.props.match.params
    this.props.getPlayerData(id)
  }
  render() {
    return (
      <div className="overall">
        <div className="filtersHolder">
          <DataFiltersBar menu={1} />
        </div>
        <div className="row" id="playerPageHolder">
          <StatList />
          <ReplayList />
        </div>
      </div>
    )
  }
}

function mapStateToProps(state, ownProps) {
  return ownProps
}

export default connect(mapStateToProps,{getPlayerData})(PlayerPage)
