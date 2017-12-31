import React, { Component } from 'react'
import { connect } from 'react-redux'
import TableHeader from './table_header'
import TableBody from './table_body'
import SelectedMainData from '../../selectors/selected_main_data'
import DataFiltersBar from '../data_filters_bar'
import HeroFiltersBar from '../hero_filters_bar'
import { updateMainSorting } from '../../actions'

class DataTable extends Component {
  constructor(props) {
    super(props)
    this.reorder = this.reorder.bind(this)
  }
  reorder(name,id) {
    this.props.updateMainSorting(id)
  }
  render() {
    return (
      <div className="overall">
        <div className="filtersHolder">
          <DataFiltersBar />
          <HeroFiltersBar />
        </div>
        <div className="ReactTable -striped -highlight">
          <div className="rt-table" >
            <div className="rt-thead -header">
              <TableHeader
                cat={this.props.data.cat}
                headers={this.props.data.headers}
                order={this.props.data.order}
                reorder={this.reorder}
              />
            </div>
            <TableBody
              rows={this.props.data.rows}
              prefsID={this.props.data.prefsID}
              cat={this.props.data.cat}
            />
          </div>
        </div>
      </div>
    )
  }
}

const mapStateToProps = state => {
  return {
    data: SelectedMainData(state)
  }
}

export default connect(mapStateToProps,{updateMainSorting})(DataTable)
