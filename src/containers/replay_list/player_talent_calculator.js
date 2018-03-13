import 'react-table/react-table.css'
import { roundedPercent, updatedTime } from '../../helpers/smallHelpers'
import React, { Component } from 'react'
import { connect } from 'react-redux'
import TalentBox from '../heroPage/talentBox'
import Popup from '../../components/popup'
import { updateTalentHero, selectTalent, addHeroFilter, heroSearch } from '../../actions'
import PlayerTalentsSelector from '../../selectors/player_talents_selector'

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
  componentWillMount() {
    // this.props.getHeroTalents(this.props.curHero, this.props.prefs)
    this.props.updateTalentHero(this.props.hero)
    this.props.addHeroFilter(2, this.props.hero)
    this.props.selectTalent('reset')
    this.props.heroSearch("")
  }
  shouldComponentUpdate(nextProps) {
    if (this.props.hero !== nextProps.hero) {
      this.props.updateTalentHero(nextProps.hero)
      this.props.addHeroFilter(2, nextProps.hero)
      this.props.selectTalent('reset')
    }
    return true
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
    if (!this.props.nBuilds) {
      return <div></div>
    }
    const { hero } = this.props
    const baseTalents = this.props.talentData.talents
    const { filteredTalents } = this.props
    if (!filteredTalents) {
      return <div></div>
    }
    try {
      filteredTalents.map((tals,l) => {
        tals.filter((tal,i) => baseTalents[l][i][1]).map((tal,i) => {
        })
      })
    } catch (e) {
      console.log('OH NOES!')
      this.props.selectTalent('reset')
      return <div></div>
    }
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
          Talent Calculator for &nbsp;<span style={{color:window.HOTS.ColorsDic[hero]}}>{window.HOTS.nHeroes[hero]}</span>&nbsp;&nbsp;<i className="fa fa-undo iconOnButton resetButton" onClick={() => this.props.selectTalent('reset')} aria-hidden="true"></i>
        </div>
        }
        {filteredTalents && window.HOTS && filteredTalents.map((tals,l) => {
          return (
            <div key={l} className={`${window.isElectron ? 'talentRowElectron' : 'talentRow'} row`} >
              {tals.filter((tal,i) => baseTalents[l][i][1]).map((tal,i) => {
                const [ id, adjustedWins, adjustedTotal, wins, total, fullWins, fullTotal ] = tal
                const key = id
                const picLoc = window.HOTS.talentPics[id]
                const isPartialOnly = !adjustedWins && !adjustedTotal && total
                const sel= this.props.selectedTalents[l].includes(id)
                const selected = ((sel || this.props.selectedTalents[l].length===0) && total > 0 && adjustedTotal > 0)
                const highlighted = sel
                const percent = roundedPercent(Math.round(isPartialOnly ? wins/total*1000 : adjustedWins/adjustedTotal*1000))
                const tot = Math.round(adjustedTotal/100)/10
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
                      height={130}
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
  return {...PlayerTalentsSelector(state), prefs, HOTS, ...ownProps}
}

export default connect(mapStateToProps,{ updateTalentHero, selectTalent, addHeroFilter, heroSearch })(TalentCalculator)
