import 'react-table/react-table.css'
import React, { Component } from 'react'
import { connect } from 'react-redux'
import { updateStatCat } from '../actions'
import DataFiltersBar from '../containers/data_filters_bar'

class StatsTable extends Component {
  componentDidMount() {
    const {id} = this.props.match.params
    console.log(id)
  }
  render() {
    return (
      <div className="overall">
        <div className="filtersHolder">
          <DataFiltersBar />
          HEROES, BABY
        </div>
      </div>
    )
  }
}

function mapStateToProps({selectedHeroes, main, statCat}, ownProps) {
  return { heroes: selectedHeroes, main, statCat }
}

export default connect(mapStateToProps,{updateStatCat})(StatsTable)
