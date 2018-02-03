import React, { Component } from 'react'
import TableRow from './table_row'

export default class TableBody extends Component {
  render() {
    const { nameRenderer, picRenderer, cellRenderer } = this.props
    return (
      <div className="rt-tbody">
        {this.props.rows.map((row,index) => {
          const id = row.id
          return (
            <TableRow
              index={index}
              key={id}
              id={id}
              row={row}
              cellRenderer = {cellRenderer}
              nameRenderer = {nameRenderer}
              picRenderer = {picRenderer}
            />
          )
        }
        )}
      </div>
    )
  }
}
