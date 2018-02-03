import React, { Component } from 'react'
import FilterDropDown from '../containers/filter_drop_down'
import ButtonLabeledSpacer from '../components/button_labeled_spacer'
import IconList from '../containers/icon_list'
import { modeChoices, modeDic, mmrChoices, mmrDic } from '../helpers/definitions'
import { renderTime, renderNothing, renderTinyMap, renderPeeps, renderTinyHero, renderTeam } from '../components/filterComponents'
import { connect } from 'react-redux'
import { updatePreferences, getMainData, getHeroTalents, rollbackState, updateFilter, selectTalent, addHeroFilter, getTimedData } from '../actions'
import UpdateStatCat from './update_stat_cat'

const roleDropdownData = ['Assassin','Warrior','Support','Specialist'].map(x => { return {name:x, id:x} })

class DataFilters extends Component {
  constructor(props) {
    super(props)
    this.updateMode = this.updateMode.bind(this)
    this.updateMMR = this.updateMMR.bind(this)
    this.updateTime = this.updateTime.bind(this)
    this.updateMap = this.updateMap.bind(this)
    this.updateAllies = this.updateAllies.bind(this)
    this.updateEnemies = this.updateEnemies.bind(this)
    this.updateSelf = this.updateSelf.bind(this)
    this.isMenu = this.isMenu.bind(this)
    this.getHeroes = this.getHeroes.bind(this)
  }
  getHeroes() {
    this.props.getHeroTalents(this.props.prefs.hero,this.props.prefs)
    this.props.getTimedData(this.props.prefs,this.props.prefs.hero)
    this.props.selectTalent('reset')
  }
  updateTime(newTime) {
    this.props.updatePreferences('time', newTime)
  }
  updateAllies(hero) {
    this.props.addHeroFilter(0, hero)
  }
  updateEnemies(hero) {
    this.props.addHeroFilter(1, hero)
  }
  updateSelf(hero) {
    this.props.addHeroFilter(2, hero)
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
  isMenu(bits) {
    // This uses bit switching to determine which menu parts to show for different screens
    // So the first screen (0) is the rightmost bit, etc.  Ignore eslint suggestion.
    return bits & (1<<this.props.menu) ? true : false
  }
  render() {
    const [allies, enemies, self] = this.props.filterHeroes
    return (
      <div className="row dataFilters">
        {this.isMenu(0b0101) && <FilterDropDown
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
        {this.isMenu(0b0101) && <FilterDropDown
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
        {/* below I use getHeroTalents if menu is not 1 */}
        {this.isMenu(0b0101) && <ButtonLabeledSpacer filterName='Update' faIcon='fa-download' onPress={() => { this.isMenu(0b0001) ? this.props.getMainData(this.props.prefs, this.props.rollbackState) : this.getHeroes(this.props.prefs.hero,this.props.prefs) }} />}
        {this.isMenu(0b0001) && <UpdateStatCat />}
        {this.isMenu(0b0011) && <IconList className='float-left' iconList={this.props.roles} updateType='ROLE' updateFilter={this.props.updateFilter} />}
        {this.isMenu(0b0011) && <IconList className='float-right' iconList={this.props.franchises} updateType='UNIVERSE' updateFilter={this.props.updateFilter} />}
        {this.isMenu(0b0010) && <FilterDropDown
          currentSelection=""
          resetFunction={this.updateSelf}
          buttonLabel={
            <div className="teamFilterHolder">
              <div className="leftTeamFilter">
                <i className="fa fa-user-circle self" aria-hidden="true"></i>
                <span className="filterLabel">Player</span>
              </div>
              {renderTeam(self)}
            </div>
          }
          name=''
          id='Self'
          dropdowns={this.props.HOTS.sortedHeroes ? [...this.props.HOTS.sortedHeroes] : []}
          updateFunction={this.updateSelf}
          leftComponentRenderer={renderTinyHero}
          rightComponentRenderer={renderNothing}
          renderDropdownName={true}
          currentID={99}
          containerClass='halfy input-group filterGroup'
          hideArrow={true}
        />}
        {this.isMenu(0b0010) && <FilterDropDown
          currentSelection=""
          resetFunction={this.updateAllies}
          buttonLabel={
            <div className="teamFilterHolder">
              <div className="leftTeamFilter">
                <i className="fa fa-user-plus allies" aria-hidden="true"></i>
                <span className="filterLabel">Allies</span>
              </div>
              {renderTeam(allies)}
            </div>
          }
          name=''
          id='Allies'
          dropdowns={this.props.HOTS.sortedHeroes ? [...roleDropdownData,...this.props.HOTS.sortedHeroes] : []}
          updateFunction={this.updateAllies}
          leftComponentRenderer={renderTinyHero}
          rightComponentRenderer={renderNothing}
          renderDropdownName={true}
          currentID={99}
          containerClass='halfy input-group filterGroup'
          hideArrow={true}
        />}
        {this.isMenu(0b0010) && <FilterDropDown
          currentSelection=""
          resetFunction={this.updateEnemies}
          buttonLabel={
            <div className="teamFilterHolder">
              <div className="leftTeamFilter">
                <i className="fa fa-user-plus enemies" aria-hidden="true"></i>
                <span className="filterLabel">Enemies</span>
              </div>
              {renderTeam(enemies)}
            </div>
          }
          name=''
          id='Enemies'
          dropdowns={this.props.HOTS.sortedHeroes ? [...roleDropdownData,...this.props.HOTS.sortedHeroes] : []}
          updateFunction={this.updateEnemies}
          leftComponentRenderer={renderTinyHero}
          rightComponentRenderer={renderNothing}
          renderDropdownName={true}
          currentID={99}
          containerClass='halfy input-group filterGroup'
          hideArrow={true}
        />}
      </div>
    )
  }
}

function mapStateToProps({HOTS, prefs, status, roles, franchises, filterHeroes}) {
  return {HOTS, prefs, status, roles, franchises, filterHeroes}
}

export default connect(mapStateToProps, {updatePreferences, getMainData, getHeroTalents, rollbackState, updateFilter, selectTalent, addHeroFilter, getTimedData})(DataFilters)
