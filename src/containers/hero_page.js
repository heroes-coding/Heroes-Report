import ReactTable from 'react-table'
import 'react-table/react-table.css'
import React, { Component } from 'react'
import { connect } from 'react-redux'
import _ from 'lodash'
import Arc from '../components/arc'
import StatBox from '../components/statBox'
import { updateStatCat } from '../actions'
import FilterDropDown from '../containers/filter_drop_down'
import { renderNothing, renderCogs } from '../components/filterComponents'
import { statCatChoices } from '../helpers/definitions'
import DataFiltersBar from '../containers/data_filters_bar'
import HeroFiltersBar from '../containers/hero_filters_bar'

const DEFAULT_N_HEROES = 75 // HANZO
// import { Link } from 'react-router-dom'
const hiddenColumns = [3,4,6,10,11,12,18,19,39,44,30,29,43,40,37,22,29]
const descendingColumns = [5,6,14,40,27]

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
        </div>
      </div>
    )
  }
}

function mapStateToProps({selectedHeroes, main, statCat}, ownProps) {
  return { heroes: selectedHeroes, main, statCat }
}

export default connect(mapStateToProps,{updateStatCat})(StatsTable)
