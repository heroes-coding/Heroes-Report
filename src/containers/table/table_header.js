import React, { Component } from 'react'
import { connect } from 'react-redux'
import { hiddenColumns } from '../../helpers/definitions'
import ToggleButton from '../../components/toggle_button'

class TableHeader extends Component {
  render() {
    return (
      <div className="rt-tr -cursor-pointer">
        <div className="rt-th iconHeader">
          <ToggleButton
            toggleFunction={this.props.showWLFunction}
            active={this.props.showWL}
            toggleText={<span>W/L&nbsp;&nbsp;</span>}
            activeIcon={<i className="highlight fa fa-check-square" aria-hidden="true"></i>}
            inactiveIcon={<i className="highlight fa fa-window-close" aria-hidden="true"></i>}
            containerClass='toggleFilter btn btn-small btn-link iconFilter iconOnButton'
          />
        </div>
        <div
          className={`rt-th -cursor-pointer d-none d-md-block ${this.props.order.id === 'names' ? (this.props.order.desc ? '-sort-desc' : '-sort-asc') : ''}`}
          onClick={() => { this.props.reorder('hero', 'names') }}
        >
          Hero
        </div>
        {this.props.headers.map(h => {
          let { name, id } = h
          return (
            <div
              key={id}
              onClick={() => { this.props.reorder(name,id) }}
              className= {`rt-th -cursor-pointer ${this.props.order.id === id ? (this.props.order.desc ? '-sort-desc' : '-sort-asc') : ''} ${(hiddenColumns.includes(id) || (this.props.cat === 'Overall' && [14,16,17].includes(id))) ? 'd-none d-sm-block' : ''} `}
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
