import React from 'react'
import * as d3 from 'd3'
import { connect } from 'react-redux'
import { minSinceLaunchToDate, MSLToDateString, simplePercent } from '../../helpers/smallHelpers'
import ListItem from './list_item'
import PlayerReplaysSelector from '../../selectors/player_replays_selector'
import { updatePreferences, updateReplayPage } from '../../actions'
import FilterDropDown from '../../containers/filter_drop_down'
import { renderNothing } from '../../components/filterComponents'
import { decoderDictionary, nPredefined, decoderNumbers } from '../../helpers/binary_defs'
import Graph from '../../components/graph/graph'
import { exponentialSmoothing } from '../../helpers/exponential_smoother'
import Popup from '../../components/popup'
let currentPage

// import { hashString } from '../../helpers/hasher'

class ReplayList extends React.Component {
  constructor(props) {
    super(props)
    this.stats = ['KDA','Experience','Globes']
    this.renderItem = this.renderItem.bind(this)
    this.flipPage = this.flipPage.bind(this)
    this.state = {
      popupOpen:false,
      popupX:0,
      popupY:5,
      popupName: '',
      popupDesc: '',
      popupPic: ''
    }
    this.openPopup = this.openPopup.bind(this)
    this.closePopup = this.closePopup.bind(this)
    this.messagePopup = this.messagePopup.bind(this)
  }
  openPopup(row,col, popupName, popupDesc, popupPic) {
    if (this.popupTimeout) {
      clearTimeout(this.popupTimeout)
      this.popupTimeout = null
    }
    let offsetHeight = document.getElementsByClassName('replayItem')[0].offsetHeight
    this.setState({
      popupOpen:true,
      popupX:100,
      popupY:(offsetHeight+4)*row+offsetHeight,
      popupName,
      popupDesc,
      popupPic
    })
  }
  messagePopup() {
    this.popupTimeout = setTimeout(this.closePopup, 500)
  }
  closePopup() {
    this.setState({
      popupOpen:false
    })
  }
  flipPage(page) {
    if (currentPage === page) {
      return
    }
    this.props.updateReplayPage(page)
  }
  renderItem(index, key, row, handle) {
    const rep = this.props.playerData[index]
    const replayValues = {}
    rep.stats.map((x,i) => {
      replayValues[decoderDictionary[i+nPredefined]] = x
    })
    const { map, length, Kills, Assists, Deaths, mode, Experience, Globes } = replayValues
    const { heroes, Won, hero, fullTals, FirstTo10, FirstTo20, FirstFort, Winners, KDA, MSL, build, allies, enemies } = rep
    const region = 1 // NEED TO INTEGRATE THIS INTO THE SEARCH SCRIPT DOWN THE LINE
    let talPics
    if (window.HOTS) {
      talPics = fullTals.map(x => window.HOTS.talentPics[x])
    } else {
      talPics = Array(7).fill(null)
    }
    const ranges = this.stats.map(x => {
      const statVals = this.props.playerData.map(y => x === 'KDA' ? y.KDA : y.stats[decoderNumbers[x]])
      let max = d3.max(statVals)
      max = max === Infinity ? 20 : max
      return [d3.min(statVals),max]
    })
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
          length={length}
          assists={Assists}
          kills={Kills}
          deaths={Deaths}
          KDA={KDA}
          Experience={Experience}
          Globes={Globes}
          id={index}
          build={build}
          stats={this.stats}
          ranges={ranges}
          openPopup={this.openPopup}
          messagePopup={this.messagePopup}
          row={row}
        />
      </div>
    )
  }
  render() {
    if (!this.props.playerData || !this.props.talentDic.version) {
      return <div></div>
    }
    const { page, replaysPerPage, nReplays, pageNames, playerData } = this.props
    const timedData = exponentialSmoothing(playerData.map(x => { return [x.MSL,x.Won] }).reverse())
    return (
      <div className="container-fluid col-12 col-md-12 col-lg-9 order-lg-last">
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
        {this.props.playerData.slice(page*replaysPerPage,(page+1)*replaysPerPage).map((x,i) => this.renderItem(page*replaysPerPage+i,x.MSL,i,this.props.playerInfo.handle))}
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
    /*
    return (
      <div className="longScroller container-fluid" style={{overflowY: 'auto', maxHeight: 400}}>
        <ReactList
          itemRenderer={this.renderItem}
          length={this.props.playerData.length}
          type='uniform'
        />
      </div>
    )
    */
  }
}

function mapStateToProps(state, ownProps) {
  return {...PlayerReplaysSelector(state), ...ownProps}
}

export default connect(mapStateToProps, {updatePreferences, updateReplayPage})(ReplayList)
