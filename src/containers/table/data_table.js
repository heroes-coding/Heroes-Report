import React, { Component } from 'react'
import { connect } from 'react-redux'
import TableHeader from './table_header'
import TableBody from './table_body'

class DataTable extends Component {
  constructor(props) {
    super(props)
    this.state = {rows: this.props.rows, order:'forward'}
    this.reorder = this.reorder.bind(this)
  }
  reorder(name,id) {
    this.setState((prevState, props) => {
      const rows = [...props.rows]
      if (prevState.order==='forward') {
        rows.reverse()
      }
      return {rows,order: prevState.order==='forward' ? 'backward' : 'forward'}
    })
  }
  render() {
    return (
      <div className="ReactTable -striped -highlight">
        <div className="rt-table" >
          <div className="rt-thead -header" key="thead">
            <TableHeader key="header" headers={this.props.headers} reorder={this.reorder} />
          </div>
          <TableBody rows={this.state.rows} />
        </div>
      </div>
    )
  }
}

function mapStateToProps(state, ownProps) {
  return { ...ownProps }
}

export default connect(mapStateToProps)(DataTable)
