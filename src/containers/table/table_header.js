import React, { Component } from 'react'
import { connect } from 'react-redux'

class TableHeader extends Component {
  render() {
    return (
      <div className="rt-tr -cursor-pointer">
        <div className="rt-th iconHeader"></div>
        <div className="rt-th -cursor-pointer d-none d-md-block">Hero</div>
        {this.props.headers.map(h => {
          let { name, id } = h
          return (
            <div
              key={id}
              onClick={() => { this.props.reorder(name,id) }}
              className="rt-th -cursor-pointer"
            >
              {name}
            </div>
          )
        })
        }
      </div>
    )
  }
}

function mapStateToProps(state, ownProps) {
  return { ...ownProps }
}

export default connect(mapStateToProps)(TableHeader)
