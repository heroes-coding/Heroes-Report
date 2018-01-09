import React, { Component } from 'react'
import FilterDropDown from '../containers/filter_drop_down'
import ButtonLabeledSpacer from '../components/button_labeled_spacer'
import IconList from '../containers/icon_list'
import { modeChoices, modeDic, mmrChoices, mmrDic } from '../helpers/definitions'
import { renderTime, renderNothing, renderTinyMap, renderPeeps } from '../components/filterComponents'
import { connect } from 'react-redux'
import { updatePreferences, getMainData, rollbackState, updateFilter } from '../actions'

class DataFilters extends Component {
  constructor(props) {
    super(props)
    this.updateMode = this.updateMode.bind(this)
    this.updateMMR = this.updateMMR.bind(this)
    this.updateTime = this.updateTime.bind(this)
    this.updateMap = this.updateMap.bind(this)
  }
  updateTime(newTime) {
    this.props.updatePreferences('time', newTime)
  }
  updateMode(newMode) {
    this.props.updatePreferences('mode', newMode)
  }
  updateMMR(newMMR) {
    this.props.updatePreferences('mmr', newMMR)
  }
  updateMap(newMap) {
    this.props.updatePreferences('map', newMap)
  }
  render() {
    return (
      <div className="row dataFilters">
        {this.props.hideSome && <IconList className='float-left' iconList={this.props.roles} updateType='ROLE' updateFilter={this.props.updateFilter} />}
        {this.props.hideSome && <IconList className='float-right' iconList={this.props.franchises} updateType='UNIVERSE' updateFilter={this.props.updateFilter} />}
        {!this.props.hideSome && <FilterDropDown
          currentSelection=''
          name=''
          id='timeFrame'
          dropdowns={this.props.HOTS.times ? this.props.HOTS.times : [{name: '', 'id': '', selected: false}]}
          updateFunction={this.updateTime}
          leftComponentRenderer={renderTime}
          rightComponentRenderer={renderNothing}
          renderDropdownName={false}
          buttonLabel={window.builds ? window.builds[this.props.prefs.time].name : ''}
          currentID={this.props.prefs.time}
        />}
        <FilterDropDown
          currentSelection={window.mapsDic ? window.mapsDic[this.props.prefs.map].name : ''}
          name=''
          id='gameMap'
          dropdowns={this.props.HOTS.sortedMaps ? this.props.HOTS.sortedMaps : []}
          updateFunction={this.updateMap}
          leftComponentRenderer={renderTinyMap}
          rightComponentRenderer={renderNothing}
          renderDropdownName={true}
          currentID={window.mapsDic ? window.mapsDic[this.props.prefs.map].id : 99}
        />
        {!this.props.hideSome && <FilterDropDown
          currentSelection=""
          name='MMR'
          id='mmr'
          dropdowns={mmrChoices}
          updateFunction={this.updateMMR}
          leftComponentRenderer={renderPeeps}
          rightComponentRenderer={renderNothing}
          renderDropdownName={true}
          currentID={ mmrDic[this.props.prefs.mmr].id }
        />}
        <FilterDropDown
          currentSelection={modeDic[this.props.prefs.mode].name}
          name='Game Mode: '
          id='gameMode'
          dropdowns={modeChoices}
          updateFunction={this.updateMode}
          leftComponentRenderer={renderNothing}
          rightComponentRenderer={renderNothing}
          renderDropdownName={true}
          currentID={modeDic[this.props.prefs.mode].id}
        />
        {!this.props.hideSome && <ButtonLabeledSpacer filterName='Update' faIcon='fa-download' onPress={() => { this.props.getMainData(this.props.prefs, this.props.rollbackState) }} />}
      </div>
    )
  }
}

function mapStateToProps({HOTS, prefs, status, roles, franchises}) {
  return {HOTS, prefs, status, roles, franchises}
}

export default connect(mapStateToProps, {updatePreferences, getMainData, rollbackState, updateFilter})(DataFilters)
