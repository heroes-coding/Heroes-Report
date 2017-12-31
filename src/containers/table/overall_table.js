import ReactTable from 'react-table'
import 'react-table/react-table.css'
import React, { Component } from 'react'
import { connect } from 'react-redux'
import _ from 'lodash'
import Arc from '../../components/arc'
import StatBox from '../../components/statBox'
import { updateStatCat } from '../../actions'
import FilterDropDown from '../filter_drop_down'
import { renderNothing, renderCogs } from '../../components/filterComponents'
import { statCatChoices } from '../../helpers/definitions'
import DataFiltersBar from '../data_filters_bar'
import HeroFiltersBar from '../hero_filters_bar'
import DataTable from './data_table'


const DEFAULT_N_HEROES = 75 // HANZO
// import { Link } from 'react-router-dom'
const hiddenColumns = [3,4,6,10,11,12,18,19,39,44,30,29,43,40,37,22,29]
const descendingColumns = [5,6,14,40,27]

class StatsTable extends Component {
  render() {
    const statCatStats = this.props.statCat.stats
    let heroes = _.values(this.props.heroes)
    let nHeroes
    if (this.props.heroes === 'loading') {
      nHeroes = DEFAULT_N_HEROES
      heroes = []
      for (let h = 0; h < nHeroes; h++) {
        heroes.push({name: '', id: h})
      }
    } else if (heroes.length === 0) {
      nHeroes = 1
      heroes.push({name: 'Mr. Bigglesworth', id: 666})
    } else {
      nHeroes = heroes.length
    }
    const gotAll = Object.keys(this.props.main).length > 0 && this.props.heroes !== 'loading' && heroes[0].id !== 666
    if (gotAll) {
      const newHeroes = []
      for (let h = 0; h < nHeroes; h++) {
        const heroID = heroes[h].id
        if (!this.props.main.hasOwnProperty(heroID)) {
          continue
        }
        const heroDic = {...heroes[h]}
        heroDic.stats = []
        for (let s = 0;s<statCatStats.length;s++) {
          let stat = statCatStats[s]
          heroDic.stats.push(this.props.main[heroID][stat])
          heroDic[stat] = this.props.main[heroID][stat]
        }
        newHeroes.push(heroDic)
      }
      heroes = newHeroes
      nHeroes = heroes.length
    }
    const columns = [
      {
        Header: '',
        sortable: false,
        accessor: 'id',
        maxWidth: 55,
        maxHeight: 38,
        Cell: row => (
          <div className="roundedPort">
            <img
              className='roundedPort'
              alt={row.original.name}
              src={`https://heroes.report/squareHeroes/${row.value}.jpg`}
            />
            <Arc
              color={row.original.color}
              source={`https://heroes.report/squareHeroes/${row.value}.jpg`}
              id={row.value}
            />
          </div>
        )
      },
      {
        Header: 'Header',
        className: 'd-none d-md-block',
        headerClassName: 'd-none d-md-block',
        accessor: 'name',
        Cell: row => {
          const style = {'color': row.original.color}
          return (
            <span
              className='heroName'
              style={style}
            >{row.value}</span>
          )
        },
        minWidth: 30
      }
    ]
    if (gotAll) {
      for (let s = 0;s<statCatStats.length;s++) {
        let stat = heroes[0][statCatStats[s]]
        let hideWhenSmall
        if (this.props.statCat.cat==='Overall') {
          hideWhenSmall = [14,16,17].includes(stat.id) ? 'd-none d-sm-block' : ''
        } else {
          hideWhenSmall = hiddenColumns.includes(stat.id) ? 'd-none d-sm-block' : ''
        }
        columns.push({
          Header: stat.name,
          accessor: stat.id.toString(),
          defaultSortDesc: !descendingColumns.includes(stat.id),
          className: hideWhenSmall,
          headerClassName: hideWhenSmall,
          Cell: row => (
            <StatBox
              display={row.value.display}
              color={row.value.color}
              barColor={row.row._original.color}
              percent={row.value.percent}
              id={stat.id}
            />
          ),
          minWidth: 20,
          sortMethod: (a, b) => {
            return a.value > b.value ? 1 : -1
          }
        })
      }
    }
    const prefsID = `${Object.values(this.props.prefs).join("-")}-${this.props.statCat.cat}`
    return (
      <div className="overall">
        <div className="filtersHolder">
          <DataFiltersBar />
          <HeroFiltersBar />
        </div>
        {gotAll && <DataTable rows={heroes} headers={this.props.statCat.headers} prefsID={prefsID}/>}
      </div>
    )
  }
}

function mapStateToProps({selectedHeroes, main, statCat, prefs}, ownProps) {
  return { heroes: selectedHeroes, main, statCat, prefs }
}

export default connect(mapStateToProps,{updateStatCat})(StatsTable)
