import React, { Component } from 'react'
import { connect } from 'react-redux'
import Arc from '../../components/arc'
import StatBox from '../../components/statBox'

class TableRow extends Component {
  render() {
    const { id, color, name, stats } = this.props.row
    const nameStyle = {'color': color}
    return (
      <div className="rt-tr-group">
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
          <div className="rt-td d-none d-md-block">
            <span
              className='heroName'
              style={nameStyle}
            >{name}</span>
          </div>
          {stats && stats.map(stat => <StatBox key={stat.id} id={stat.id} display={stat.display} percent={stat.percent} />)}
        </div>
      </div>
    )
  }
}

function mapStateToProps(state, ownProps) {
  return { ...ownProps }
}


/*
<div className="roundedPort">

</div>

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
*/


export default connect(mapStateToProps)(TableRow)
