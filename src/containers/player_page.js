import React, { Component } from 'react'
import { connect } from 'react-redux'
import DataFiltersBar from './data_filters_bar'
import ReplayList from './replay_list/replay_list'
import PlayerMatchupTable from './replay_list/player_matchup_table'
import PlayerTalentCalculator from './replay_list/player_talent_calculator'
import PlayerStats from './stat_list/player_stats'
import StatList from './stat_list/stat_list'
import { getPlayerData, getYourData, updateTime, addHeroFilter, heroSearch } from '../actions'
import TimeLine from './replay_list/timeline'
import PlayerReplaysSelector from '../selectors/player_replays_selector'
import ButtonLabeledSpacer from '../components/button_labeled_spacer'
import { formatDate } from '../helpers/smallHelpers'
import FilterDropDown from '../containers/filter_drop_down'
import { renderNothing, renderTinyHero } from '../components/filterComponents'

const today = new Date()

class PlayerPage extends Component {
  constructor(props) {
    super(props)
    this.updateHero = this.updateHero.bind(this)
    this.getPlayer = this.getPlayer.bind(this)
    this.reset = this.reset.bind(this)
    this.state = { curHero: null }
  }
  updateHero(newHero) {
    this.needToUpdate = true
    this.setState({...this.state, curHero:newHero})
  }
  reset() {
    this.needToUpdate = true
    this.setState({...this.state, curHero: null})
    this.props.addHeroFilter(2,"A") // resets player to none so talent tab doesn't become annoying
  }
  componentWillMount() {
    this.props.heroSearch("")
  }
  getPlayer(id) {
    try {
      let [region, bnetID] = id.split('-')
      region = parseInt(region)
      bnetID = parseInt(bnetID)
      if (isNaN(region) || isNaN(bnetID)) {
        throw new Error(id + ' is not a proper player id')
      }
      this.props.getPlayerData(id)
      this.isPlayer = true
    } catch (e) {
      console.log(e.message)
      this.isPlayer = false
    }
  }
  componentDidMount() {
    const {id} = this.props.match.params
    if (id==='you' && window.fullID) {
      this.isYou = true
      this.props.getYourData()
      this.isPlayer = true
    } else {
      this.getPlayer(id)
      this.isYou = false
    }
    this.props.updateTime('reset',null)
  }
  shouldComponentUpdate(nextProps, nextState) {
    const oldID = this.props.match.params.id
    const newID = nextProps.match.params.id
    if (oldID !== newID) {
      this.getPlayer(newID)
    }
    if (!this.props.timeRange && nextProps.timeRange || !this.props.timeRange || !nextProps.timeRange || this.needToUpdate) {
      this.needToUpdate = false
      return true
    }
    if (this.props.startDate !== nextProps.startDate || this.props.timeRange[2] !== nextProps.timeRange[2] || this.props.timeRange[3] !== nextProps.timeRange[3]) {
      return true
    }
    return false
  }

  render() {
    const {id} = this.props.match.params
    const { curHero } = this.state
    const conClass = 'heroDropDown playerNav'
    return (
      <div className="overall">
        <div className="filtersHolder">
          <DataFiltersBar menu={1} />
        </div>
        <div className="row d-flex justify-content-end" id="playerPageHolder">
          <div className="container-fluid col-12 col-md-12 col-lg-9 order-lg-last">
            {!this.isPlayer&&<div className="error">{id} is not a proper player ID (perhaps because of the change to region specific IDs implemented on 2/21).  Please use the navigation to find another player.</div>}
            <div className="replayItem timeBar">
              <ButtonLabeledSpacer
                filterName={`Timeline:  ${this.props.timeRange ? formatDate(this.props.timeRange[2]) + "-" + formatDate(this.props.timeRange[3] > today ? today : this.props.timeRange[3]) : 'Full Available Dates'}`} faIcon='fa-long-arrow-right'
                overclass='blackButton calendar'
              />
              <TimeLine
                minMSL={this.props.startDate}
                maxMSL={this.props.endDate}
              />
            </div>
            <div className="playerHolder">
              <ul className="nav playerTabs">
                <li className="nav-item playerReplays">
                  <a className={`nav-link playerNav ${curHero ? '' : 'active'}`}
                    href="#"
                    onClick={() => { this.reset() }}
                  >Replay Listing</a>
                </li>
                <FilterDropDown
                  currentSelection="Heroes"
                  buttonLabel={curHero ? <span>Talents for {renderTinyHero(curHero)} </span> : 'Talents'}
                  name=''
                  id='gameMap'
                  dropdowns={this.props.HOTS.sortedHeroes ? this.props.HOTS.sortedHeroes : []}
                  updateFunction={this.updateHero}
                  leftComponentRenderer={renderTinyHero}
                  rightComponentRenderer={renderNothing}
                  renderDropdownName={true}
                  containerClass={conClass}
                  currentID={99}
                  active={curHero ? true : false}
                />
              </ul>
              {!curHero && <ReplayList playerID={id} isYou={this.isYou}/>}
              {curHero && <PlayerTalentCalculator hero={curHero} />}
            </div>
            <PlayerMatchupTable />
          </div>
          <div className='flex statsList col-12 col-sm 6 col-lg-3 order-lg-first'>
            <PlayerStats playerID={id} />
          </div>
        </div>
      </div>
    )
  }
}

function mapStateToProps(state, ownProps) {
  return {...PlayerReplaysSelector(state), HOTS:state.HOTS, timeRange:state.timeRange, ...ownProps}
}

export default connect(mapStateToProps,{getPlayerData, getYourData, updateTime, addHeroFilter, heroSearch })(PlayerPage)
