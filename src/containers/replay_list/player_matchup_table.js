import React, { Component } from 'react'
import { connect } from 'react-redux'
import { MSLToDateString, formatNumber, roundedPercent, roundedPercentPercent } from '../../helpers/smallHelpers'
import PlayerReplaysSelector from '../../selectors/player_replays_selector'
import { updatePreferences } from '../../actions'
import Graph from '../../components/graph/graph'
import { exponentialSmoothing } from '../../helpers/exponential_smoother'
import PicHolder from '../customTable/picHolder'
import NameHolder from '../customTable/nameHolder'
import CustomTable from '../customTable/data_table'

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
    const playerData = this.props.playerData
    const nReplays = playerData.length
    const {id, name, color} = this.state.graphHero
    const withPoints = []
    const againstPoints = []
    const asPoints = []
    for (let r=0;r<nReplays;r++) {
      const replay = playerData[r]
      const { allies, enemies, MSL, hero, Won } = replay
      if (hero===id) {
        asPoints.push([MSL,Won])
      } else {
        for (let a=0;a<5;a++) {
          const h = allies[a]
          if (h===id) {
            withPoints.push([MSL,Won])
            break
          }
        }
      }
      for (let e=0;e<5;e++) {
        const h = enemies[e]
        if (h===id) {
          againstPoints.push([MSL,Won])
          break
        }
      }
    }
    withPoints.sort((x,y) => x[0] < y[0] ? -1 : 1)
    againstPoints.sort((x,y) => x[0] < y[0] ? -1 : 1)
    asPoints.sort((x,y) => x[0] < y[0] ? -1 : 1)
    return (
      <div className="matchupGraphs">
        <Graph
          graphClass="winrateGraph"
          containerClass="graphHolder matchupGraphHolder"
          linePoints={exponentialSmoothing(asPoints)}
          xLabel="Date"
          yLabel='Win rate'
          title={`Win % as ${name} over time`}
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
          containerClass="graphHolder matchupGraphHolder"
          linePoints={exponentialSmoothing(withPoints)}
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
          containerClass="graphHolder matchupGraphHolder"
          linePoints={exponentialSmoothing(againstPoints)}
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
      display=isNaN(value) ? value : roundedPercent(value*1000)
    } else {
      display=isNaN(value) ? value : formatNumber(value)
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
  nameRenderer(id,name,color, stats) {
    const showGraphs = stats[0].value > 3 || stats[2].value > 3 || stats[4].value > 3 ? true : false
    return (
      <NameHolder
        id={id}
        name={name}
        color={color}
        updateFunction={showGraphs ? this.showGraphs : null}
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
          { value:matchesU === 0 ? '-' : matchesU, id: 0 },
          { value:matchesU === 0 ? '-' : winsU/matchesU, id: 1 },
          { value:matchesW === 0 ? '-' : matchesW, id: 2 },
          { value:matchesW === 0 ? '-' : winsW/matchesW, id:3 },
          { value:matchesA === 0 ? '-' : matchesA, id: 4 },
          { value:matchesA === 0 ? '-' : winsA/matchesA, id: 5 }
        ]
      }
    }).filter(x => x.stats[0].value !== "-" || x.stats[2].value !== "-" || x.stats[4].value !== "-")
    const { orderID, desc } = this.state
    rows.sort((x,y) => {
      let xVal, yVal
      if (isNaN(orderID)) {
        xVal = x[orderID]
        yVal = y[orderID]
      } else {
        xVal = x.stats[orderID].value
        yVal =y.stats[orderID].value
      }
      xVal = xVal === '-' ? (desc ? -1 : Infinity) : xVal
      yVal = yVal === '-' ? (desc ? -1 : Infinity) : yVal
      return xVal < yVal ? 1 : -1
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

export default connect(mapStateToProps,{updatePreferences})(PlayerMatchupTable)
