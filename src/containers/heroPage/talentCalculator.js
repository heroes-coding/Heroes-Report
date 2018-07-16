import 'react-table/react-table.css'
import { roundedPercent, updatedTime } from '../../helpers/smallHelpers'
import React, { Component } from 'react'
import { connect } from 'react-redux'
import TalentBox from './talentBox'
import Popup from '../../components/popup'
import * as d3 from 'd3'
import { getHeroTalents, getHOTSDictionary, selectTalent } from '../../actions'
import TalentsSelector from '../../selectors/talents_selector'

class TalentCalculator extends Component {
  constructor(props) {
    super(props)
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
  componentDidMount() {
    this.props.getHeroTalents(this.props.curHero, this.props.prefs)
    this.props.selectTalent('reset')
  }
  openPopup(row,col, popupName, popupDesc, popupPic) {
    if (this.popupTimeout) {
      clearTimeout(this.popupTimeout)
      this.popupTimeout = null
    }
    this.setState({
      popupOpen:true,
      popupX:20,
      popupY:156*(row+1)+30,
      popupName,
      popupDesc,
      popupPic
    })
  }
  componentWillUnmount() {
    if (this.popupTimeout) {
      clearTimeout(this.popupTimeout)
    }
  }
  messagePopup() {
    this.popupTimeout = setTimeout(this.closePopup, 100)
  }
  closePopup() {
    this.setState({
      popupOpen:false
    })
  }
  render() {
    if (!this.props.talentData) {
      return (
        <div className="container-fluid col-12 col-md-12 col-lg-9 order-lg-last" id="talentBox">
          This talent data is currently unavailable
        </div>
      )
    }
    const { filteredTalents, dataTime, talentCounts, hero } = this.props.talentData
    // I really wish there was a better way of doing this.  The problem is the old talents are passed back with the new hero id.  I don't know why props are being updated before the talent data is when I am only connecting to getHeroTalents
    let curHero = hero
    return (
      <div className="container-fluid col-12 col-md-12 col-lg-9 order-lg-last" id="talentBox">
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
        {window.HOTS && <div className="talentCalcHeader row" >
          Talent Calculator for &nbsp;<span style={{color:window.HOTS.ColorsDic[curHero]}}>{window.HOTS.nHeroes[curHero]}</span>&nbsp;&nbsp;<i className="fa fa-undo iconOnButton resetButton" onClick={() => this.props.selectTalent('reset')} aria-hidden="true"></i>
          <span className="talentTime">&nbsp;&nbsp;(This talent data last updated {updatedTime(dataTime)} ago)</span>
        </div>
        }
        {filteredTalents && window.HOTS && filteredTalents.map((tals,l) => {
          const rowMax = d3.max(tals.map(x => x[4]))
          const winRates = tals.filter(x => x[4]).map(x => x[1]/x[2])
          const minWR = d3.min(winRates)
          const maxWR = d3.max(winRates)
          return (
            <div key={l} className={`${window.isElectron ? 'talentRowElectron' : 'talentRow'} row`}>
              {tals.filter(tal => window.HOTS.cTalents[hero].hasOwnProperty(tal[0])).map((tal,i) => {
                const [ id, adjustedWins, adjustedTotal, wins, total ] = tal.slice(0,5)
                const key = window.HOTS.nTalents[id]
                const picLoc = window.HOTS.talentPics[id]
                const sel= this.props.selectedTalents[l].includes(id)
                const selected = (sel || this.props.selectedTalents[l].length===0) && total > 0 && adjustedTotal > 0
                const highlighted = sel
                const percent = roundedPercent(Math.round(adjustedWins/adjustedTotal*1000))
                return (
                  <div
                    key={key}
                    onClick={(event) => {
                      event.preventDefault()
                      this.props.selectTalent(l,id,this.props.selectedTalents,this.props.talentData)
                    }}
                    // ref={(div) => { this.div = div }}
                    onMouseEnter={(event) => {
                      const name = window.HOTS.cTalents[hero][id][0]
                      const desc = window.HOTS.cTalents[hero][id][1]
                      event.preventDefault()
                      this.openPopup(l,i,name,desc,`https://heroes.report/singleTalents/${picLoc}.jpg`)
                    }}
                    onMouseLeave={(event) => {
                      event.preventDefault()
                      this.messagePopup()
                    }}
                  >
                    <TalentBox
                      key={key}
                      width={70}
                      height={133}
                      winrateBar={0.1 + 0.9*(maxWR===minWR ? 1 : (adjustedWins/adjustedTotal-minWR)/(maxWR-minWR))}
                      popularityBar={total/rowMax}
                      x={100}
                      y={10}
                      selected={selected}
                      highlighted={highlighted}
                      tal={picLoc}
                      count={total}
                      percent={percent}
                    />
                  </div>
                )
              })}
            </div>
          )
        })}
      </div>
    )
  }
}

function mapStateToProps(state, ownProps) {
  const {prefs, HOTS} = state
  return state.talentData ? {...TalentsSelector(state), prefs, HOTS, ...ownProps} : {prefs, HOTS, ...ownProps}
}

export default connect(mapStateToProps,{getHeroTalents, getHOTSDictionary, selectTalent})(TalentCalculator)
