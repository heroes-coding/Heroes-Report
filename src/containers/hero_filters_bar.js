import React, { Component } from 'react'
import IconList from '../containers/icon_list'
import ButtonLabeledSpacer from '../components/button_labeled_spacer'
import { connect } from 'react-redux'
import { renderNothing, renderCogs } from '../components/filterComponents'
import { statCatChoices } from '../helpers/definitions'
import { updateStatCat, updateFilter } from '../actions'
import FilterDropDown from '../containers/filter_drop_down'

class HeroFilters extends Component {
  render() {
    return (
      <div className="row heroFilters">
        <ButtonLabeledSpacer filterName='Show' faIcon='fa-cog' />
        <IconList className='float-left' iconList={this.props.roles} updateType='ROLE' />
        <IconList className='float-right' iconList={this.props.franchises} updateType='UNIVERSE' />
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
      </div>
    )
  }
}

function mapStateToProps({roles, franchises, statCat}) {
  return {roles, franchises, statCat}
}

export default connect(mapStateToProps,{updateStatCat, updateFilter})(HeroFilters)
