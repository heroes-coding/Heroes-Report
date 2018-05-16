import 'react-table/react-table.css'
import React, { Component } from 'react'
import { connect } from 'react-redux'
// import { getHeroTalents } from '../../actions'
import DataFiltersBar from '../../containers/data_filters_bar'
import AdvancedTable from './advanced_table'

class Advanced extends Component {
  render() {
    let heroID = this.props.match.params.id
    if (!window.HOTS) {
      return (
        <div className="overall">
          <div className="filtersHolder">
            <DataFiltersBar menu={2} />
          </div>
        </div>
      )
    } else {
      if (isNaN(heroID)) {
        heroID = window.HOTS.heroDic[heroID]
      }
    }
    return (
      <div className="overall">
        <div className="filtersHolder">
          <DataFiltersBar menu={3} />
        </div>
        <div className="row d-flex justify-content-end" id="playerPageHolder">
          <div className="container-fluid col-12 col-md-12 col-lg-12 order-lg-last" id="talentBox">
            <AdvancedTable />
          </div>
        </div>
      </div>
    )
  }
}

function mapStateToProps(state, ownProps) {
  return {ownProps, HOTS:state.HOTS}
}

export default connect(mapStateToProps)(Advanced)
