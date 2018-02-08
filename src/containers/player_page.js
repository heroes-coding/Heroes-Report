import React, { Component } from 'react'
import { connect } from 'react-redux'
import DataFiltersBar from './data_filters_bar'
import ReplayList from './replay_list/replay_list'
import PlayerMatchupTable from './replay_list/player_matchup_table'
import PlayerStats from './stat_list/player_stats'
import StatList from './stat_list/stat_list'
import { getPlayerData, updateTime } from '../actions'
import TimeLine from './replay_list/timeline'
import PlayerReplaysSelector from '../selectors/player_replays_selector'
import ButtonLabeledSpacer from '../components/button_labeled_spacer'
import { formatDate } from '../helpers/smallHelpers'
import FilterDropDown from '../containers/filter_drop_down'
import { renderNothing, renderTinyHero } from '../components/filterComponents'

class PlayerPage extends Component {
  constructor(props) {
    super(props)
    this.updateHero = this.updateHero.bind(this)
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
  }
  componentDidMount() {
    const {id} = this.props.match.params
    this.props.getPlayerData(id)
    this.props.updateTime('reset',null)
  }
  shouldComponentUpdate(nextProps, nextState) {
    console.log(this.props,nextProps,this.state,nextState)
    const oldID = this.props.match.params.id
    const newID = nextProps.match.params.id
    if (oldID !== newID) {
      this.props.getPlayerData(newID)
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
    console.log(conClass)
    return (
      <div className="overall">
        <div className="filtersHolder">
          <DataFiltersBar menu={1} />
        </div>
        <div className="row d-flex justify-content-end" id="playerPageHolder">
          <div className="container-fluid col-12 col-md-12 col-lg-9 order-lg-last">

            <div className="replayItem timeBar">
              <ButtonLabeledSpacer
                filterName={`Dates:  ${this.props.timeRange ? formatDate(this.props.timeRange[2]) + " - " + formatDate(this.props.timeRange[3]) : 'All'}`} faIcon='fa-calendar'
                overclass='blackButton calendar'
              />
              <TimeLine
                minMSL={this.props.startDate}
                maxMSL={this.props.endDate}
              />
            </div>
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
              />
            </ul>
            {!curHero && <ReplayList playerID={id} />}
            {curHero && <div>{curHero}</div>}
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

export default connect(mapStateToProps,{getPlayerData, updateTime})(PlayerPage)
