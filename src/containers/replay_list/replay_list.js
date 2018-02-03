import React, { Component } from 'react'
import * as d3 from 'd3'
import { connect } from 'react-redux'
import { minSinceLaunchToDate, MSLToDateString, simplePercent, formatNumber, roundedPercent, roundedPercentPercent, formatStatNumber, tinyPercent, sToM, formatDate, DateToMSL, statSToM } from '../../helpers/smallHelpers'
import ListItem from './list_item'
import PlayerReplaysSelector from '../../selectors/player_replays_selector'
import { updatePreferences, updateReplayPage } from '../../actions'
import FilterDropDown from '../../containers/filter_drop_down'
import { renderNothing } from '../../components/filterComponents'
import ToggleButton from '../../components/toggle_button'
import { decoderDictionary, nPredefined, decoderNumbers, menuStats } from '../../helpers/binary_defs'
import Graph from '../../components/graph/graph'
import { exponentialSmoothing } from '../../helpers/exponential_smoother'
import PicHolder from '../customTable/picHolder'
import NameHolder from '../customTable/nameHolder'
import CustomTable from '../customTable/data_table'
import Popup from '../../components/popup'
let currentPage

// import { hashString } from '../../helpers/hasher'

class ReplayList extends Component {
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
  openPopup(row,div, popupName, popupDesc, popupPic,isTalent) {
    const rowDiv = div.getBoundingClientRect()
    const conDiv = this.div.getBoundingClientRect()
    const extraWide = conDiv.width > 780 || false
    window.pDiv = div
    window.oDiv = this.div
    if (this.popupTimeout) {
      clearTimeout(this.popupTimeout)
      this.popupTimeout = null
    }
    let x
    if (isTalent && extraWide) {
      x = rowDiv.width/2
    } else if (!extraWide) {
      x = (rowDiv.width - 380)/2
    } else {
      x = (rowDiv.width - 760)/2
    }
    this.visualChange = true
    this.setState({
      ...this.state,
      popupOpen:true,
      popupX: x,
      popupY:rowDiv.top-conDiv.top+(extraWide ? 38 : 74),
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
  renderItem(index, key, row, handle, bnetID, ranges) {
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
          bnetID={bnetID}
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
    const { handle, bnetID } = this.props.playerInfo
    return (
      <div ref={div => { this.div = div }} className="container-fluid col-12 col-md-12 col-lg-9 order-lg-last">
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
        {this.props.playerData.slice(page*replaysPerPage,(page+1)*replaysPerPage).map((x,i) => this.renderItem(page*replaysPerPage+i,x.MSL,i,handle,bnetID,ranges))}
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
        <ConnectedPMUT />
      </div>
    )
  }
}

class PlayerMatchupTable extends Component {
  constructor(props) {
    super(props)
    this.renderInfo = this.renderInfo.bind(this)
    this.nameRenderer = this.nameRenderer.bind(this)
    this.picRenderer = this.picRenderer.bind(this)
    this.reorder = this.reorder.bind(this)
    this.showGraphs = this.showGraphs.bind(this)
    this.getGraphs = this.getGraphs.bind(this)
    this.state = {
      orderColumn: 'Matches as',
      orderID: 0,
      desc: true,
      graphHero: null
    }
  }
  getGraphs() {
    if (!window.HOTS) {
      return <div />
    }
    const {id,name,color} = this.state.graphHero
    let hero = window.HOTS.nHeroes[this.props.curHero]
    const matchupData = !this.props[0] || !window.HOTS ? [] : this.props[0].builds
    matchupData.sort((x,y) => x[1] < y[1] ? -1 : 1)
    const data1 = []
    const labelPoints1 = []
    const data2 = []
    const labelPoints2 = []
    matchupData.map((x,i) => {
      const [ winsW, matchesW, winsA, matchesA ] = x.heroes[id]
      const build = x[1]
      const buildName = window.builds[build].name
      const [ startTime, endTime, midTime ] = window.builds[build].dates
      let MSL = DateToMSL(midTime)
      const buildString = `${name} over ${matchesW} matches during build ${build} (${buildName}), from ${formatDate(startTime)} until ${formatDate(endTime)}`
      if (matchesW) {
        let wrW = winsW/matchesW
        const wrWS = roundedPercent(wrW*1000)
        data1.push([MSL, wrW])
        labelPoints1.push({
          name:`${wrWS} win rate with ${name}`,
          desc:`${hero} had a win rate of ${wrWS} with ${buildString}`,
          size:4,
          color:color,
          1:wrW,
          0:MSL
        })
      }
      if (matchesA) {
        let wrA = winsA/matchesA
        const wrAS = roundedPercent(wrA*1000)
        data2.push([MSL, wrA])
        labelPoints2.push({
          name:`${wrAS} win rate vs. ${name}`,
          desc:`${hero} had a win rate of ${wrAS} against ${buildString}`,
          size:4,
          color:color,
          1:wrA,
          0:MSL
        })
      }
    })
    return (
      <div className="matchupGraphs">
        <Graph
          graphClass="winrateGraph"
          linePoints={data1}
          labelPoints={labelPoints1}
          xLabel="Date"
          yLabel='Win rate'
          title={`Win % with ${name} over time`}
          xRatio={500}
          yRatio={290}
          xOff={70}
          yOff={90}
          noArea={true}
          formatter={MSLToDateString}
          yFormatter={roundedPercentPercent}
        />
        <Graph
          graphClass="winrateGraph"
          linePoints={data2}
          labelPoints={labelPoints2}
          xLabel="Date"
          yLabel='Win rate'
          title={`Win % vs ${name} over time`}
          xRatio={500}
          yRatio={290}
          xOff={70}
          yOff={90}
          noArea={true}
          formatter={MSLToDateString}
          yFormatter={roundedPercentPercent}
        />
      </div>
    )
  }
  reorder(name,id) {
    this.setState({
      ...this.state,
      desc: this.state.orderColumn === name ? !this.state.desc : true,
      orderColumn: name,
      orderID: id
    })
  }
  renderInfo(value, id) {
    let display
    if (id%2) {
      display=roundedPercent(value*1000)
    } else {
      display=formatNumber(value)
    }

    return (
      <div key={id} className="rt-td statBoxHolder">
        {display}
      </div>
    )
  }
  showGraphs(id,name,color) {
    this.setState({
      ...this.state,
      graphHero: {id,name,color}
    })
  }
  nameRenderer(id,name,color) {
    return (
      <NameHolder
        id={id}
        name={name}
        color={color}
        updateFunction={this.showGraphs}
      />
    )
  }
  picRenderer(id,color) {
    return (
      <PicHolder
        baseLink = 'https://heroes.report/squareHeroes/'
        id={id}
        color={color}
      />
    )
  }
  render() {
    const { nReplays, playerData } = this.props
    if (!playerData || !window.HOTS) {
      return <div></div>
    }
    const nHeroes = window.HOTS.fullHeroNames.length
    const nMaps = Object.keys(window.HOTS.nMaps).length
    const matchupData = []
    const mapData = []
    for (let h=0;h<nHeroes;h++) {
      matchupData.push([0,0,0,0,0,0])
    }
    for (let m=0;m<nMaps;m++) {
      mapData.push([0,0])
    }
    for (let r=0;r<nReplays;r++) {
      const replay = playerData[r]
      const { allies, enemies, MSL, map, Won } = replay
      for (let p=0;p<5;p++) {
        const ally = allies[p]
        const enemy = enemies[p]
        if (p===0) {
          matchupData[ally][4] += Won
          matchupData[ally][5]++
        } else {
          matchupData[ally][0] += Won
          matchupData[ally][1]++
        }
        matchupData[enemy][2] += Won
        matchupData[enemy][3]++
        mapData[map][0] += Won
        mapData[map][1]++
      }
    }
    let rows = matchupData.map((x,i) => {
      const [ winsW, matchesW, winsA, matchesA, winsU, matchesU ] = x
      return {
        name: window.HOTS.nHeroes[i],
        id: i,
        color: window.HOTS.ColorsDic[i],
        stats: [
          { value:matchesU, id: 0 },
          { value:winsU === 0 ? 0 : winsU/matchesU, id: 1 },
          { value:matchesW, id: 2 },
          { value:matchesW === 0 ? 0 : winsW/matchesW, id:3 },
          { value:matchesA, id: 4 },
          { value:matchesA === 0 ? 0 : winsA/matchesA, id: 5 }
        ]
      }
    }).filter(x => x.stats[0].value || x.stats[2].value || x.stats[4].value)
    const { orderID, desc } = this.state
    rows.sort((x,y) => {
      if (isNaN(orderID)) {
        return x[orderID] < y[orderID] ? 1 : -1
      } else {
        return x.stats[orderID].value < y.stats[orderID].value ? 1 : -1
      }
    })
    if (!desc) {
      rows.reverse()
    }
    rows.map((x,i) => {
      rows[i].rowClass = `rt-tr-group ${i%2 ? '-odd' : '-even'}`
    })
    return (
      <div className='matchupHolder'>
        <div className='stat_item_container row'>
          <div className='statItem col-12 col-sm-12 col-lg-12'>
            <div className="matchupTitle" >
              Hero performance and matchups
            </div>
            {this.state.graphHero&&this.getGraphs()}
            <CustomTable
              headers = {[
                {name:'Hero', id:'name'},
                {name:'Matches as', id:0},
                {name:'Win rate as', id:1},
                {name:'Matches w/', id:2},
                {name:'Win rate w/', id:3},
                {name:'Matches vs', id:4},
                {name:'Win rate vs', id:5},
              ]}
              rows = {rows}
              cellRenderer = {this.renderInfo}
              nameRenderer = {this.nameRenderer}
              picRenderer = {this.picRenderer}
              reorder = {this.reorder}
              orderID = {this.state.orderID}
              orderColumn = {this.state.orderColumn}
              desc = {this.state.desc}
              rowsPerPage = {10}
            />
          </div>
        </div>
      </div>
    )
  }
}

function mapStateToProps(state, ownProps) {
  return {...PlayerReplaysSelector(state), prefs: state.prefs, ...ownProps}
}

const ConnectedPMUT = connect(mapStateToProps,{updatePreferences})(PlayerMatchupTable)

const ConnectedReplayList = connect(mapStateToProps, {updatePreferences, updateReplayPage})(ReplayList)
export { ConnectedReplayList as ReplayList, ConnectedPMUT as PlayerMatchupTable }
