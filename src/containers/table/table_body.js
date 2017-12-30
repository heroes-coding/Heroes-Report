import React, { Component } from 'react'
import { connect } from 'react-redux'
import TableRow from './table_row'

class TableBody extends Component {
  render() {
    return (
      <div className="rt-tbody">
        {this.props.rows.map((row,index) => <TableRow index={index} key={row.id} row={row} />)}
      </div>
    )
  }
}

function mapStateToProps(state, ownProps) {
  return { ...ownProps }
}

export default connect(mapStateToProps)(TableBody)
