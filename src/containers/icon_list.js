import React, { Component } from 'react'
import { connect } from 'react-redux'
import FilterIcon from '../components/filter_icon'
import { filterHeroes } from '../actions'

class IconList extends Component {
  shouldComponentUpdate(nextProps) {
    return nextProps.iconList !== this.props.iconList
  }
  constructor(props) {
    console.log(props,'constructor for icon list')
    super(props)
    this.state = {
      selected: props.iconList.map(x => x.selected)
    }
    this.updateFilterAndHeroes = this.updateFilterAndHeroes.bind(this)
  }
  updateFilterAndHeroes(id) {
    this.props.updateFilter(id, this.props.updateType)
    // Updating through redux is not working.  Please let this work...
    this.setState((prevState,props) => {
      if (id==='A') {
        return {selected: prevState.selected.map(x => false)}
      } else {
        const newState = {selected:[...prevState.selected]}
        newState.selected[id] = !prevState.selected[id]
        return newState
      }
    })
    // Somewhat hacky solution to make sure the state is updated first
    setTimeout(() => { this.props.filterHeroes(this.props.store); this.forceUpdate() }, 10)
  }
  renderIcon(d,index) {
    return (
      <FilterIcon
        id={d.id}
        name={d.name}
        key={d.id}
        selected ={this.state.selected[d.id]}
        updateFilter={this.updateFilterAndHeroes}
      />
    )
  }
  render() {
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
        {this.props.iconList.map((d,i) => this.renderIcon(d,i))}
      </form>
    )
  }
}

function mapStateToProps(state, ownProps) {
  return { ...ownProps, store: state }
}

export default connect(mapStateToProps, {filterHeroes})(IconList)
