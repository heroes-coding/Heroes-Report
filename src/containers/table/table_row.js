import React, { Component } from 'react'
import Arc from '../../components/arc'
import StatBox from './statBox'

export default class TableRow extends Component {
  shouldComponentUpdate(nextProps) {
    if (nextProps.id !== this.props.id || this.props.id.length < 4) {
      console.log('updating...')
      return true
    }
    return false
  }
  render() {
    const { id, color, name, stats } = this.props.row
    const nameStyle = {'color': color}
    return (
      <div id={`row${id}`} className="rt-tr-group">
        <div className="rt-tr">
          <div className="rt-td roundedPort">
            <img
              className='roundedPort'
              alt={name}
              src={`https://heroes.report/squareHeroes/${id}.jpg`}
            />
            <Arc
              color={color}
              id={id}
            />
          </div>
          <div className={`rt-td d-none d-md-block`} >
            <span
              className='heroName'
              style={nameStyle}
            >{name}</span>
          </div>
          {stats && stats.map(stat =>
            <StatBox
              key={stat.id}
              id={stat.id}
              cat={this.props.cat}
              display={stat.display}
              percent={stat.percent}
            />
          )}
        </div>
      </div>
    )
  }
}
