import React, { Component } from 'react'
import TableRow from './table_row'

export default class TableBody extends Component {
  render() {
    const { nameRenderer, picRenderer, cellRenderer, rows } = this.props
    return (
      <div className="rt-tbody">
        {rows.map((row,index) => {
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
        {!rows.length &&<div className="rt-tr">Not enough data to show!  Go play some matches!</div>}
      </div>
    )
  }
}
