import React, { Component } from 'react'
import { connect } from 'react-redux'
import FilterIcon from '../components/filter_icon'
import { updateFilter, filterHeroes } from '../actions'

class IconList extends Component {
  shouldComponentUpdate(nextProps) {
    return false
    //return nextProps.iconList !== this.props.iconList
  }
  constructor(props) {
    super(props)
    this.updateFilterAndHeroes = this.updateFilterAndHeroes.bind(this)
  }
  updateFilterAndHeroes(id) {
    this.props.updateFilter(id, this.props.updateType)
    // Somewhat hacky solution to make sure the state is updated first
    setTimeout(() => { this.props.filterHeroes(this.props.store); this.forceUpdate() }, 10)
  }
  renderIcon(d) {
    return (
      <FilterIcon
        id={d.id}
        name={d.name}
        key={d.id}
        selected ={d.selected}
        updateFilter={this.updateFilterAndHeroes}
      />
    )
  }
  render() {
    console.log('icon_list render called',this.props.iconList)
    return (
      <form className="input-group filterGroup justify-content-center">
        <button
          className='btn btn-small btn-link iconFilter  d-none d-sm-block'
          onClick={(event) => {
            event.preventDefault()
            this.updateFilterAndHeroes('A')
          }}
        ><i className="fa fa-undo iconOnButton" aria-hidden="true"></i> {this.props.updateType}:</button>
        <span className="iconLabel"></span>
        {this.props.iconList.map(d => this.renderIcon(d))}
      </form>
    )
  }
}

function mapStateToProps(state, ownProps) {
  return { ...ownProps, store: state }
}

export default connect(mapStateToProps, {filterHeroes, updateFilter})(IconList)
