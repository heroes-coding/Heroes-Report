import React, { Component } from 'react'
import { connect } from 'react-redux'
import TableHeader from './table_header'
import TableBody from './table_body'

class DataTable extends Component {
  constructor(props) {
    super(props)
    this.flipPage = this.flipPage.bind(this)
    this.state = {
      page: 0
    }
  }
  componentWillUpdate(nextProps) {
    if (this.props.orderID !== nextProps.orderID || this.props.orderColumn !== nextProps.orderColumn) {
      this.flipPage(0)
    }
  }
  flipPage(page) {
    this.setState({
      ...this.state,
      page
    })
  }
  render() {
    const { nameRenderer, picRenderer, cellRenderer, rowsPerPage, errorMessage } = this.props
    let page = this.state.page
    const nPages = Array(Math.ceil(this.props.rows.length/rowsPerPage)).fill().map((x,i) => i)
    return (
      <div className="ReactTable -striped -highlight">
        <div className="rt-table" >
          <div className="rt-thead -header">
            <TableHeader
              headers={this.props.headers}
              order={{id:this.props.orderID, desc: this.props.desc}}
              reorder={this.props.reorder}
            />
          </div>
          <TableBody
            rows={this.props.rows.slice(page*rowsPerPage,(page+1)*rowsPerPage)}
            cellRenderer = {cellRenderer}
            nameRenderer = {nameRenderer}
            picRenderer = {picRenderer}
            errorMessage = {errorMessage}
          />
        </div>
        {nPages > 1 && <div className="rt-thead pagesDiv">
          {nPages.map(n => {
            return (
              <div
                key={n}
                className={`pageMarker ${n===this.state.page ? 'activePage' : ''}`}
                onClick={() => { this.flipPage(n) }}
              >{n+1}</div>
            )
          })}
        </div>}
      </div>
    )
  }
}

const mapStateToProps = state => {
  return state.prefs
}

export default connect(mapStateToProps)(DataTable)
