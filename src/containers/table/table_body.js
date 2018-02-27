import React, { Component } from 'react'
import TableRow from './table_row'

export default class TableBody extends Component {
  oddifyRows() {
    // I THINK this is the only way to get rows to render with even - odd backgrounds without rerendering the entire component each time.
    let even = true
    const nHeroes = this.props.rows.length
    for (let h = 0; h < nHeroes; h++) {
      if (this.props.rows[h].visible) {
        document.getElementById(`row${this.props.rows[h].id}`).className = `rt-tr-group ${even ? '-even' : '-odd'}`
        even = !even
      } else {
        document.getElementById(`row${this.props.rows[h].id}`).className = 'invisible'
      }
    }
  }
  componentDidMount() {
    this.oddifyRows()
  }
  componentDidUpdate() {
    this.oddifyRows()
  }
  render() {
    return (
      <div className="rt-tbody">
        {this.props.rows.map((row,index) => {
          const id = row.prefsID ? `${row.prefsID}-${this.props.cat}` : row.id.toString()
          return (
            <TableRow
              index={index}
              key={id}
              id={id}
              row={row}
              rowID={`row${row.id}`}
              cat={this.props.cat}
              showWL={this.props.showWL}
            />
          )
        }
        )}
      </div>
    )
  }
}
