import React, { Component } from 'react'
import { connect } from 'react-redux'
import TalentsSelector from '../../selectors/talent_menu_selector'
import { updateTalentPopupVisibility, addHeroTalent } from '../../actions'


const TalentPopup = (props) => {
  const { lev, talent, pic, name, desc, updateTalent, team, index } = props
  // console.log({ talent, pic, name, desc, updateTalent, team, index } )
  // updateTalent(lev, talent, team, index)
  return (
    <div
      className="poppedTalent"
      title={desc}
      onClick={(e) => {
        e.preventDefault()
        updateTalent(lev, talent, team, index, name, desc, pic)
      }}
    >
      <img
        className="poppedTalentImage"
        src={`https://heroes.report/singleTalentsTiny/${pic}.jpg`}
        alt={talent}
      ></img>
      <div className="poppedTalentName">{name}</div>
    </div>
  )
}


class TalentSelectorPopup extends Component {
  constructor(props) {
    super(props)
    this.closeTalentPopup = this.closeTalentPopup.bind(this)
    this.addTalent = this.addTalent.bind(this)
  }
  addTalent(lev, talent, team, index, name, desc, pic) {
    const talentData = this.props.talentList[lev][talent]
    talentData.talent = talent
    talentData.lev = lev
    talentData.name = name
    talentData.desc = desc
    talentData.pic = pic
    this.props.addHeroTalent(team, index, talentData, true)
  }
  componentWillUnmount() {
    if (this.popupTimeout) clearTimeout(this.popupTimeout)
  }
  componentWillUpdate(nextProps) {
    if (nextProps.hero !== this.hero && this.popupTimeout) clearTimeout(this.popupTimeout)
  }
  closeTalentPopup() {
    this.props.updateTalentPopupVisibility(false)
    if (this.popupTimeout) clearTimeout(this.popupTimeout)
  }
  render() {
    const { talentList, talentPopupData, talentPopupOpen, hero, team, index } = this.props
    if (!talentPopupOpen) return null
    if (!talentList) {
      return (
        <div id="talentPopup">This talent data is currently unavailable</div>
      )
    }

    // document.getElementById("allyHolder").getBoundingClientRect()
    let { left, top } = window.document.getElementById(team === 0 ? "allyHolder" : "enemyHolder").getBoundingClientRect()
    top = top - 15
    left = left + 800 > window.innerWidth ? 0.5*left : left
    return (
      <div
        id="talentPopup"
        style={{top, left}}
        onMouseEnter={(event) => {
          // delete timeout for closing of popup, if set
          event.preventDefault()
          if (this.popupTimeout) clearTimeout(this.popupTimeout)
        }}
        onMouseLeave={(event) => {
          // set timeout for closing of popup, if set
          event.preventDefault()
          this.popupTimeout = setTimeout(this.closeTalentPopup, 1000)
        }}
      >
        <div id="talentPopupTitle">{`Select talent to filter replays by for ${window.HOTS.nHeroes[hero]}`}</div>
        <div className="trafficLightBox">
          <i
            className="fa fa-window-close closeBox"
            onClick={() => {this.closeTalentPopup()}}
        /></div>
        {talentPopupData.map((lev,i) => {
          return (
            <div key={i} className="talentPopupRow">
              <div className="talentPopupRowTitle">{[1,4,7,10,13,16,20][i]}:</div>
              <br/>
              {lev.map(({talent, pic, name, desc},j) => <TalentPopup updateTalent={this.addTalent} lev={i} key={talent} team={team} index={index} talent={talent} pic={pic} name={name} desc={desc} />)}
            </div>
          )
        })}
      </div>
    )
  }
}

function mapStateToProps(state, ownProps) {
  const { talentPopupOpen } = state
  return {...TalentsSelector(state), talentPopupOpen }
}

export default connect(mapStateToProps, {updateTalentPopupVisibility, addHeroTalent})(TalentSelectorPopup)
