import React from 'react'
import * as d3 from 'd3'
import { connect } from 'react-redux'
import { minSinceLaunchToDate } from '../../helpers/smallHelpers'
import ListItem from './list_item'
import PlayerReplaysSelector from '../../selectors/player_replays_selector'
import { updatePreferences, updateReplayPage } from '../../actions'
import FilterDropDown from '../../containers/filter_drop_down'
import { renderNothing } from '../../components/filterComponents'
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
    const { MSL, heroes, map, slot, length, winners, Kills, Assists, Deaths, mode, build, fullTals,FirstTo10,FirstTo20,FirstFort, Experience, Globes, KDA, hero, Won } = this.props.playerData[index]
    const region = 1 // NEED TO INTEGRATE THIS INTO THE SEARCH SCRIPT DOWN THE LINE
    let talPics
    if (window.HOTS) {
      talPics = fullTals.map(x => window.HOTS.talentPics[x])
    } else {
      talPics = Array(7).fill(null)
    }
    /* If you wanted, you could add hot loading here for extra information, but that is a little extreme =0
    const fixedMode = mode === 4 ? 5 : mode === 5 ? 4 : mode
    const hashInput = `${fixedMode}${Math.round(length/60)}${heroes.join("")}${winners}${firstTo10}${firstTo20}${firstFort}${MSL}${region}${build}`
    */
    const ranges = this.stats.map(x => {
      const statVals = this.props.playerData.map(y => y[x])
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
          hero={hero}
          won={Won}
          map={map}
          mode={mode}
          talents={fullTals}
          talPics={talPics}
          length={length}
          slot={slot}
          team={Math.floor(slot/5)}
          winners={winners}
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
      <div className="container-fluid col-12 col-md-12 col-lg-9">
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
