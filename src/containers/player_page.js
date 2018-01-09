import React, { Component } from 'react'
import { connect } from 'react-redux'
import DataFiltersBar from './data_filters_bar'
import _ from 'lodash'
import ReplayList from './replay_list/replay_list'
import StatList from './stat_list/stat_list'

class PlayerPage extends Component {
  componentDidMount() {
    console.log('Player page mounted?',this.props.playerData)
  }
  render() {
    return (
      <div className="overall">
        <div className="filtersHolder">
          <DataFiltersBar hideSome={true} />
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
  return {}
}

export default connect(mapStateToProps)(PlayerPage)
