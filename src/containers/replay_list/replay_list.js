import React from 'react'
import * as d3 from 'd3'
import { connect } from 'react-redux'
import { minSinceLaunchToDate, MSLToDateString, simplePercent } from '../../helpers/smallHelpers'
import ListItem from './list_item'
import PlayerReplaysSelector from '../../selectors/player_replays_selector'
import { updatePreferences, updateReplayPage } from '../../actions'
import FilterDropDown from '../../containers/filter_drop_down'
import { renderNothing } from '../../components/filterComponents'
import ToggleButton from '../../components/toggle_button'
import { decoderDictionary, nPredefined, decoderNumbers, menuStats } from '../../helpers/binary_defs'
import Graph from '../../components/graph/graph'
import { exponentialSmoothing } from '../../helpers/exponential_smoother'
import Popup from '../../components/popup'
let currentPage

// import { hashString } from '../../helpers/hasher'

class ReplayList extends React.Component {
  constructor(props) {
    super(props)
    this.renderItem = this.renderItem.bind(this)
    this.flipPage = this.flipPage.bind(this)
    this.state = {
      popupOpen:false,
      popupX:0,
      popupY:5,
      popupName: '',
      popupDesc: '',
      popupPic: '',
      sortBy: 'Date',
      sortDesc: true,
    }
    this.openPopup = this.openPopup.bind(this)
    this.closePopup = this.closePopup.bind(this)
    this.messagePopup = this.messagePopup.bind(this)
    this.changeSort = this.changeSort.bind(this)
    this.reverseSort = this.reverseSort.bind(this)
    this.changeStatBar = this.changeStatBar.bind(this)
  }
  changeStatBar(newStat) {
    this.props.updatePreferences('sortStats',newStat)
    this.changeSort(newStat.stat)
  }
  changeSort(sort) {
    this.setState({
      ...this.state,
      sortBy: sort,
      sortDesc: this.state.sortBy === sort ? !this.state.sortDesc : true
    })
  }
  reverseSort() {
    this.setState({
      ...this.state,
      sortDesc: !this.state.sortDesc
    })
  }
  openPopup(row,col, popupName, popupDesc, popupPic) {
    if (this.popupTimeout) {
      clearTimeout(this.popupTimeout)
      this.popupTimeout = null
    }
    let offsetHeight = document.getElementsByClassName('replayItem')[0].offsetHeight
    this.visualChange = true
    this.setState({
      ...this.state,
      popupOpen:true,
      popupX:100,
      popupY:(offsetHeight+4)*row+offsetHeight,
      popupName,
      popupDesc,
      popupPic,
    })
  }
  messagePopup() {
    this.popupTimeout = setTimeout(this.closePopup, 500)
  }
  closePopup() {
    this.visualChange = true
    this.setState({
      ...this.state,
      popupOpen:false,
    })
  }
  flipPage(page) {
    if (currentPage === page) {
      return
    }
    this.props.updateReplayPage(page)
  }
  renderItem(index, key, row, handle, ranges) {
    const rep = this.props.playerData[index]
    const replayValues = {}
    rep.stats.map((x,i) => {
      replayValues[decoderDictionary[i+nPredefined]] = x
    })
    const { map, Length, Kills, Assists, Deaths, mode, Experience, Globes } = replayValues
    const statValues = [0,0,0]
    const { heroes, Won, hero, fullTals, FirstTo10, FirstTo20, FirstFort, Winners, KDA, MSL, build, allies, enemies } = rep
    const sortStats = this.props.prefs.sortStats
    sortStats.map((x,i) => {
      if (x==="KDA") {
        statValues[i] = KDA
      } else {
        statValues[i] = replayValues[x]
      }
    })

    const region = 1 // NEED TO INTEGRATE THIS INTO THE SEARCH SCRIPT DOWN THE LINE
    let talPics
    if (window.HOTS) {
      talPics = fullTals.map(x => window.HOTS.talentPics[x])
    } else {
      talPics = Array(7).fill(null)
    }
    return (
      <div key={index} className="replay_item_container">
        <ListItem
          handle={handle}
          MSL={MSL}
          region={region}
          FirstTo10={FirstTo10}
          FirstTo20={FirstTo20}
          FirstFort={FirstFort}
          date={minSinceLaunchToDate(MSL)}
          heroes={heroes}
          allies={allies}
          enemies={enemies}
          hero={hero}
          won={Won}
          winners={Winners}
          map={map}
          mode={mode}
          talents={fullTals}
          talPics={talPics}
          Length={Length}
          assists={Assists}
          kills={Kills}
          deaths={Deaths}
          KDA={KDA}
          Experience={Experience}
          Globes={Globes}
          id={index}
          build={build}
          stats={sortStats}
          statValues={statValues}
          ranges={ranges}
          openPopup={this.openPopup}
          messagePopup={this.messagePopup}
          row={row}
        />
      </div>
    )
  }
  render() {
    const { page, replaysPerPage, nReplays, pageNames, playerData } = this.props
    if (!playerData || !this.props.talentDic.version) {
      return <div></div>
    }
    const { sortBy, sortDesc } = this.state
    const sortStats = this.props.prefs.sortStats
    if (this.visualChange) {
      this.visualChange = null
    } else {
      const order = sortDesc ? -1 : 1
      if (sortBy === "Date") {
        playerData.sort((x,y) => x.MSL > y.MSL ? order: -order)
      } else if (sortBy === "KDA") {
        playerData.sort((x,y) => x.KDA > y.KDA ? order : -order)
      } else {
        const stat = decoderNumbers[sortBy]
        playerData.sort((x,y) => x.stats[stat] > y.stats[stat] ? order : -order)
      }
    }
    /*
    if (!this.hasOwnProperty('lastSort') || this.lastSort.sortBy !== sortBy || this.lastSort.sortDesc !== sortDesc) {
      const order = sortDesc ? -1 : 1
      if (sortBy === "Date") {
        playerData.sort((x,y) => x.MSL > y.MSL ? order: -order)
      } else if (sortBy === "KDA") {
        playerData.sort((x,y) => x.KDA > y.KDA ? order : -order)
      } else {
        const stat = decoderNumbers[sortBy]
        playerData.sort((x,y) => x.stats[stat] > y.stats[stat] ? order : -order)
      }
      this.lastSort = { sortBy, sortDesc }
    }
    */
    const ranges = sortStats.map((x,i) => {
      const statVals = this.props.playerData.map(y => x === 'KDA' ? y.KDA : y.stats[decoderNumbers[x]])
      let max = d3.max(statVals)
      max = max === Infinity ? 20 : max
      return [d3.min(statVals),max]
    })
    return (
      <div className="container-fluid col-12 col-md-12 col-lg-9 order-lg-last">
        <div className="replayListFilters">
          <div className="replayItem row justify-content-center">
            <FilterDropDown
              currentSelection={`Sort by: ${this.state.sortBy}`}
              buttonLabel=''
              name=''
              id='Sorting selection'
              dropdowns={[
                {name:'Date',id:'Date'},
                {name:'Match Length',id:'Length'},
                {name: 'KDA', id: 'KDA'},
                ...menuStats.map(x => { return {name: x, id: x} })
              ]}
              updateFunction={this.changeSort}
              leftComponentRenderer={renderNothing}
              rightComponentRenderer={renderNothing}
              renderDropdownName={true}
              currentID={99}
              containerClass='-cursor-pointer'
            />
            <ToggleButton
              toggleFunction={this.reverseSort}
              active={this.state.sortDesc}
              activeIcon={<i className="fa fa-sort-amount-desc" aria-hidden="true"></i>}
              inactiveIcon={<i className="fa fa-sort-amount-asc" aria-hidden="true"></i>}
              containerClass='toggleButton'
            />
            <div className="filterText">Shown Stat Bars:</div>
            {[0,1,2].map(i => {
              return (
                <FilterDropDown
                  key={i}
                  currentSelection={sortStats[i]}
                  buttonLabel=''
                  name=''
                  id={`Statbar ${i}`}
                  dropdowns={[
                    {name:'Match Length', id:'Length', data:{slot:i,stat:'Length'}},
                    {name:'KDA', id:'KDA', data:{slot:i,stat:'KDA'}},
                    ...menuStats.map(x => { return {name: x, id:x, data:{slot:i,stat:x}} })
                  ]}
                  updateFunction={this.changeStatBar}
                  leftComponentRenderer={renderNothing}
                  rightComponentRenderer={renderNothing}
                  renderDropdownName={true}
                  currentID={99}
                  containerClass='-cursor-pointer'
                  textClass={`color${i}`}
                />
              )
            }
            )}
          </div>
        </div>
        <Popup
          name={this.state.popupName}
          desc={this.state.popupDesc}
          extendedDesc={this.state.popupExtendedDesc}
          classo="talentPopup"
          open={this.state.popupOpen}
          x={this.state.popupX}
          y={this.state.popupY}
          pic={this.state.popupPic}
        />
        {this.props.playerData.slice(page*replaysPerPage,(page+1)*replaysPerPage).map((x,i) => this.renderItem(page*replaysPerPage+i,x.MSL,i,this.props.playerInfo.handle,ranges))}
        <FilterDropDown
          currentSelection={`${1+page*replaysPerPage} - ${Math.min((page+1)*replaysPerPage,nReplays)} out of ${nReplays} filtered replays`}
          buttonLabel=''
          name=''
          id='mmrSelection'
          dropdowns={pageNames}
          updateFunction={this.flipPage}
          leftComponentRenderer={renderNothing}
          rightComponentRenderer={renderNothing}
          renderDropdownName={true}
          currentID={99}
          containerClass='regionList -cursor-pointer'
        />
      </div>
    )
  }
}

function mapStateToProps(state, ownProps) {
  return {...PlayerReplaysSelector(state), prefs: state.prefs, ...ownProps}
}

export default connect(mapStateToProps, {updatePreferences, updateReplayPage})(ReplayList)
