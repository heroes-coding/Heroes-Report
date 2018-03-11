import React, { Component } from 'react'
import { connect } from 'react-redux'
import FilterIcon from '../components/filter_icon'
import { filterHeroes, updateFilter } from '../actions'

class IconList extends Component {
  shouldComponentUpdate(nextProps) {
    return this.props.iconList !== nextProps.iconList
  }
  constructor(props) {
    super(props)
    this.updateFilterAndHeroes = this.updateFilterAndHeroes.bind(this)
  }
  updateFilterAndHeroes(id,name) {
    const updateType = ['warcraft','diablo','starcraft','overwatch','retro'].includes(name) ? 'UNIVERSE' : 'ROLE'
    this.props.updateFilter(id, updateType)
  }
  renderIcon(d,index) {
    const { id, name, selected } = d
    return (
      <FilterIcon
        id={id}
        name={name}
        key={`${name}-${selected}`}
        selected ={selected}
        updateFilter={this.updateFilterAndHeroes}
      />
    )
  }
  render() {
    return (
      <form className="input-group filterGroup justify-content-center">
        <button
          className='btn btn-small btn-link iconFilter'
          onClick={(event) => {
            event.preventDefault()
            this.updateFilterAndHeroes('A')
          }}
        ><i className="fa fa-undo iconOnButton" aria-hidden="true"></i>{this.props.updateType}</button>
        {this.props.iconList.map((d,i) => this.renderIcon(d,i))}
        {this.props.info && <i title={this.props.info} className="fa fa-info-circle infoButton" aria-hidden="true"></i>}
      </form>
    )
  }
}

function mapStateToProps(state, ownProps) {
  return { ...ownProps, store: state }
}

export default connect(mapStateToProps, {filterHeroes, updateFilter})(IconList)
