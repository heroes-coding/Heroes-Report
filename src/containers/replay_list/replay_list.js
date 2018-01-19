import React from 'react'
import * as d3 from 'd3'
import { connect } from 'react-redux'
import { minSinceLaunchToDate } from '../../helpers/smallHelpers'
import ListItem from './list_item'
import PlayerReplaysSelector from '../../selectors/player_replays_selector'
import { updatePreferences, updateReplayPage } from '../../actions'
import FilterDropDown from '../../containers/filter_drop_down'
import { renderNothing } from '../../components/filterComponents'
import { decoderDictionary, nPredefined, decoderNumbers } from '../../helpers/binary_defs'
let currentPage

// import { hashString } from '../../helpers/hasher'

class ReplayList extends React.Component {
  constructor(props) {
    super(props)
    this.stats = ['KDA','Experience','Globes']
    this.renderItem = this.renderItem.bind(this)
    this.flipPage = this.flipPage.bind(this)
  }
  flipPage(page) {
    if (currentPage === page) {
      return
    }
    this.props.updateReplayPage(page)
  }
  renderItem(index, key) {
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
        />
      </div>
    )
  }
  render() {
    if (!this.props.playerData || !this.props.talentDic.version) {
      return <div></div>
    }
    const { page, replaysPerPage, nReplays, pageNames } = this.props
    return (
      <div className="container-fluid col-12 col-md-12 col-lg-9 order-lg-last">
        {this.props.playerData.slice(page*replaysPerPage,(page+1)*replaysPerPage).map((x,i) => this.renderItem(page*replaysPerPage+i,x.MSL))}
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
  return PlayerReplaysSelector(state)
}

export default connect(mapStateToProps, {updatePreferences, updateReplayPage})(ReplayList)
