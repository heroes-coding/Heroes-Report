import React, { Component } from 'react'
import { connect } from 'react-redux'
import TableHeader from './table_header'
import TableBody from './table_body'
import SelectedMainData from '../../selectors/selected_main_data'
import DataFiltersBar from '../data_filters_bar'
import { updateMainSorting, updatePreferences, getMainData, heroSearch } from '../../actions'
import { updatedTimeMins } from '../../helpers/smallHelpers'

class DataTable extends Component {
  componentDidMount() {
    this.props.getMainData(this.props.prefs)
    if (window.HOTS && window.HOTS.searchDic) {
      this.props.heroSearch("")
    }
  }
  constructor(props) {
    super(props)
    this.reorder = this.reorder.bind(this)
    this.showWL = this.showWL.bind(this)
    this.state = {showWL:false}
  }
  showWL() {
    this.setState({...this.state,showWL:!this.state.showWL})
  }
  reorder(name,id) {
    this.props.updateMainSorting(id)
  }
  render() {
    let rows = this.props.data.rows
    const searchHeroes = this.props.heroSearchTerm
    if (searchHeroes && rows[0].id !== 666) {
      rows = rows.filter(x => searchHeroes.includes(x.id))
    }
    const updatedTime = updatedTimeMins(this.props.data.updatedMins)
    return (
      <div className="overall">
        <div className="filtersHolder">
          <DataFiltersBar menu={0} updatedTime={updatedTime} />
        </div>
        <div className="ReactTable -striped -highlight">
          <div className="rt-table" >
            <div className="rt-thead -header">
              <TableHeader
                showWLFunction={this.showWL}
                showWL={this.state.showWL}
                cat={this.props.data.cat}
                headers={this.props.data.headers}
                order={this.props.data.order}
                reorder={this.reorder}
              />
              <div className="tableInfo">Last updated {updatedTime} ago</div>
            </div>
            <TableBody
              rows={rows}
              prefsID={this.props.data.prefsID}
              cat={this.props.data.cat}
              showWL={this.state.showWL}
            />
          </div>
        </div>
      </div>
    )
  }
}

const mapStateToProps = state => {
  return {
    data: SelectedMainData(state),
    prefs: state.prefs,
    heroSearchTerm: state.searchTerm
  }
}

export default connect(mapStateToProps,{updateMainSorting, updatePreferences, getMainData, heroSearch})(DataTable)
