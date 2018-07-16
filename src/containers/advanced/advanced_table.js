import React, { Component } from 'react'
import { connect } from 'react-redux'
import SearchBar from '../../components/search_bar'
import { heroSearch } from '../../actions'
import { MSLToDateString, formatNumber, roundedPercent, simplePercent, roundedPercentPercent } from '../../helpers/smallHelpers'
import Graph from '../../components/graph/graph'
import { exponentialSmoothing } from '../../helpers/exponential_smoother'
import PicHolder from '../customTable/picHolder'
import NameHolder from '../customTable/nameHolder'
import CustomTable from '../customTable/data_table'
import DoubleCell from '../../components/double_cell'
import _ from 'lodash'

class RustyHeroTable extends Component {
  constructor(props) {
    super(props)
    this.renderInfo = this.renderInfo.bind(this)
    this.nameRenderer = this.nameRenderer.bind(this)
    this.picRenderer = this.picRenderer.bind(this)
    this.reorder = this.reorder.bind(this)
    this.heroSearch = this.heroSearch.bind(this)
    this.state = {
      orderColumn: 'Matches as',
      orderID: 0,
      desc: true,
      graphHero: null
    }
  }
  heroSearch(term) {
    this.props.heroSearch(term)
  }
  reorder(name,id) {
    this.setState({
      ...this.state,
      desc: this.state.orderColumn === name ? !this.state.desc : true,
      orderColumn: name,
      orderID: id
    })
  }
  renderInfo({sigma, display, id}) {
    if (sigma) {
      return (
        <div key={id} className="rt-td statBoxHolder doubleBox">
          {display}
          <br/>
          {sigma}σ
        </div>
      )
    }
    return (
      <div key={id} className="rt-td statBoxHolder">
        {display}
      </div>
    )
  }
  nameRenderer(id,name,color, stats) {
    return (
      <NameHolder
        id={id}
        name={name}
        color={color}
        updateFunction={null}
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
    const heroSearch = _.debounce((term) => {
      this.heroSearch(term)
    }, 500)
    let {rustyStats: rows, rustyGraphs} = this.props
    const { orderID, desc } = this.state
    if (this.props.searchTerm) rows = rows.filter(x => this.props.searchTerm.includes(x.id))
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
            {rustyGraphs&&
              <Graph
                key={"Winrates"}
                midline={0.5}
                errorBars={rustyGraphs.errorBars}
                graphClass="rustyGraph"
                linePoints={rustyGraphs.data}
                labelPoints={rustyGraphs.labelPoints}
                xLabel="Date"
                yLabel={"Win rate"}
                title={`Winrates over time`}
                xRatio={1000}
                yRatio={250}
                xOff={70}
                yOff={55}
                singlePoint={true}
                noArea={true}
                formatter={MSLToDateString}
                yFormatter={roundedPercentPercent}
              />
            }
            <div className="matchupTitle" >
              Hero Stats for the filtered replays you selected (allied side)
              <div className="rustySearch"><SearchBar
                placeholder="Hero search"
                overClass="btn btn-small btn-link iconFilter"
                formClass="halfy input-group filterGroup buttonSpacer blackButton"
                onSearchTermChange={heroSearch}
                noautoclear={true}
              /></div>
            </div>
            <CustomTable
              headers = {[
                {name:'Hero', id:'name'},
                {name:'Matches', id:0},
                {name:'Win rate', id:1},
                {name:'1st 10 Δ', id:2},
                {name:'1st 20 Δ', id:3},
                {name:'1st Fort Δ', id:4},
                {name:'KDA', id:5},
                {name:'Towns', id:6},
                {name:'Globes', id:7},
                {name:'Mercs', id:8},
                {name:'Length', id:9}
              ]}
              errorMessage='You must first get and filter some data (filtering automatically gets data if the get parameters have changed)'
              rows = {rows}
              cellRenderer = {this.renderInfo}
              nameRenderer = {this.nameRenderer}
              picRenderer = {this.picRenderer}
              reorder = {this.reorder}
              orderID = {this.state.orderID}
              orderColumn = {this.state.orderColumn}
              desc = {this.state.desc}
              rowsPerPage = {100}
            />
          </div>
        </div>
      </div>
    )
  }
}

function mapStateToProps({rustyStats, rustyGraphs, prefs, searchTerm}, ownProps) {
  return {rustyStats, rustyGraphs, prefs, ...ownProps, searchTerm}
}

export default connect(mapStateToProps, {heroSearch})(RustyHeroTable)
