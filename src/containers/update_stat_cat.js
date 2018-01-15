import React, { Component } from 'react'
import { connect } from 'react-redux'
import { renderNothing, renderCogs } from '../components/filterComponents'
import { statCatChoices } from '../helpers/definitions'
import { updateStatCat } from '../actions'
import FilterDropDown from '../containers/filter_drop_down'

class UpdateStatCat extends Component {
  render() {
    return (
      <FilterDropDown
        currentSelection={this.props.statCat.cat}
        name='Stat Type: '
        id='statType'
        dropdowns={statCatChoices}
        updateFunction={this.props.updateStatCat}
        leftComponentRenderer={renderCogs}
        rightComponentRenderer={renderNothing}
        renderDropdownName={true}
        currentID={this.props.statCat.cat}
      />
    )
  }
}

function mapStateToProps({statCat}) {
  return {statCat}
}

export default connect(mapStateToProps,{updateStatCat})(UpdateStatCat)
