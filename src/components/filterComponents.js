import React from 'react'
import { connect } from 'react-redux'
import { commify, simplePercent } from '../helpers/smallHelpers'
import { mmrDic } from '../helpers/definitions'
import SimpleDropDown from './simple_drop_down'
import { updateAdvancedTalentHero, updateTalentPopupVisibility, addHeroTalent } from '../actions'
import TalentsSelector from '../selectors/talent_menu_selector'

export function renderPeep(selected,x) {
  return <i className={`fa fa-user${selected ? ' fa-lg': '-o'}`} key={x} aria-hidden="true"></i>
}

export function renderCogs(selected, x) {
  return <span><i className="fa fa-cogs iconOnButton" key={x} aria-hidden="true"></i>&nbsp;&nbsp;</span>
}




class RTeam extends React.Component {
  constructor(props) {
    super(props)
    this.updateTalentMenuHero = this.updateTalentMenuHero.bind(this)
    this.removeTalent = this.removeTalent.bind(this)
  }
  updateTalentMenuHero(data) {
    this.props.updateAdvancedTalentHero(data)
    this.props.updateTalentPopupVisibility(true)
  }
  removeTalent(team,index, talentData) {
    this.props.addHeroTalent(team, index, talentData, false)
  }
  render() {
    const { teamArray, deleteHero, id, updateTeam, timeRange } = this.props
    return teamArray.map((x,i) => x.hasOwnProperty('hero') ? renderTinyHeroAndTalents(x,i,true,deleteHero,id,this.updateTalentMenuHero, this.removeTalent) : isNaN(x) ? renderTinyRole(x,i,true,deleteHero,id, updateTeam) : renderTinyHero(x,i,true,deleteHero,id))
  }
}

function mapStateToProps(state, ownProps) {
  const advancedTalentHero = state.advancedTalentHero
  return { ...TalentsSelector(state), advancedTalentHero, ...ownProps }
}

const RenderedTeam = connect(mapStateToProps, {updateTalentPopupVisibility, updateAdvancedTalentHero, addHeroTalent })(RTeam)
export { RenderedTeam }


const FilterTalent = (props) => {
  const { name, lev, pic, desc, talent, slot, team, index } = props.talent
  const removeTalent = props.removeTalent
  return (
    <div
      className="filterTalent"
      title={`${name}: ${desc}`}
      onClick={(e) => {
        e.preventDefault()
        removeTalent(team,index, {talent, lev})
      }}
    >
      <img
        className="poppedTalentImage"
        src={`https://heroes.report/singleTalentsTiny/${pic}.jpg`}
        alt={talent}
      ></img>
      <div className="filterTalentLevel">{[1,4,7,10,13,16,20][lev]}</div>
    </div>
  )
}

export function renderTinyHeroAndTalents(data,index,hasFunction,deleteHero,team,openTalentMenu, removeTalent) {
  const id = data.hero
  data.team = team
  data.index = index
  const tinyButtonFunction = hasFunction ? (e) => {
    e.preventDefault()
    deleteHero(team,index)
  } : () => {}
  const talents = []
  if (id) {
    for (let l=0;l<7;l++) {
      const tals = Object.keys(data.talents[l])
      for (let t=0;t<tals.length;t++) {
        const { name, lev, pic, desc, talent, slot } = data.talents[l][tals[t]]
        talents.push({name, lev, pic, desc, talent, slot, team, index})
      }
    }
  }

  return (
    <div className="tinyHeroAndTalents" key={index}>
      <i className="fa fa-minus-circle removePlayer" title="Remove player" onClick={tinyButtonFunction} aria-hidden="true"></i>
      <img
        alt={id}
        className="tinyHero dropDownHero"
        src={`https://heroes.report/${isNaN(id) ? `appIcons/${id}.png` : `squareHeroes/${id}.jpg`}`}
      />
      <i className="fa fa-plus-circle addTalent" title="Add talent" aria-hidden="true"
        onClick={ () =>
          openTalentMenu(data)
        }
      ></i>
      {talents.map(t => <FilterTalent key={t.talent} talent={t} removeTalent={removeTalent} />)}
    </div>
  )
}

const buildTalentOptions = (hero, startDate, endDate) => {
  const talentList = [{},{},{},{},{},{},{}]
  // 1) go through all builds from start date to end date
  // 2) if new talent at build, add with start build as that build plus
  // 3) else if talent exists, add to there are any new talents at that level
  for (let b=0; b < window.recentBuildList.length;b++) {
    const build = window.recentBuildList[b]
    if (!(window.builds.hasOwnProperty(build) && startDate < window.builds[build].dates[1] && endDate > window.builds[build].dates[0])) continue
    const buildIndex = window.talentDic.buildIndexes[build]
    let allTals = window.talentDic[build][hero]
    for (let t = 0; t < 7; t++) {
      let slot = 1
      while (true) {
        let talent = allTals[t][slot]
        if (!talent) break
        if (talentList[t].hasOwnProperty(talent) && talentList[t][talent].slot === slot) talentList[t][talent].builds.push(buildIndex)
        else talentList[t][talent] = { builds: [buildIndex], talent, slot }
        slot++
      }
    }
  }
}

// buildTalentOptions(0,timeRange.startDate, timeRange.endDate)

export function renderTinyHero(id,index,hasFunction,deleteHero,type) {
  const tinyButtonFunction = hasFunction ? (e) => {
    e.preventDefault()
    deleteHero(type,index)
  } : () => {}
  return <img
    alt={id}
    key={index}
    className="tinyHero dropDownHero"
    src={`https://heroes.report/${isNaN(id) ? `appIcons/${id}.png` : `squareHeroes/${id}.jpg`}`}
    onClick={tinyButtonFunction}
  />
}

function renderTinyRole(hero,index,hasFunction,deleteHero,type, updateTeam) {
  const { id, count } = hero
  const tinyButtonFunction = hasFunction ? (e) => {
    e.preventDefault()
    deleteHero(type,index)
  } : () => {}
  const roleChoices = ["0","> 0", "1", "> 1", "< 2", "2", "> 2", "< 3", "3", "> 3", "< 4", "4", "< 5", "5"].map((x,i) => { return {name:x, id: x, data: {id, count: x}} })
  return (
    <div key={index} className="tinyRoleHolder">
      <img
        alt={id}
        className="tinyHero dropDownHero tinyRole"
        src={`https://heroes.report/${isNaN(id) ? `appIcons/${id}.png` : `squareHeroes/${id}.jpg`}`}
        onClick={tinyButtonFunction}
      />
      <SimpleDropDown
        currentSelection={count}
        name=''
        id=''
        containerClass='roleDropdown'
        dropdowns={roleChoices}
        updateFunction={(data) => updateTeam(data)}
        currentID={count}
        title={`Select count for ${id}s`}
      />
    </div>
  )
}

export function renderPeeps(id) {
  // {this.props.iconList.map(d => this.renderIcon(d))}
  return (
    <span className="starHolder">
      {[0,1,2,3,4].map(x => renderPeep(mmrDic[id].stars.includes(x),x))}
    </span>
  )
}

export function renderPlayerData(data) {
  if (data.bnetID === 'All') {
    return (
      <div className="otherPlayerData">
        <div className="OPData OPHeader">{'With'}</div>
        <div className="OPData OPHeader">{'Win% W.'}</div>
        <div className="OPData OPHeader">{'VS'}</div>
        <div className="OPData OPHeader">{'Win% VS'}</div>
      </div>
    )
  }
  let { nWith, nVS, nWinWith, nWinVS } = data
  let winPercentWith = nWith ? simplePercent(nWinWith/nWith) : '-'
  let winPercentVS = nVS ? simplePercent(nWinVS/nVS) : '-'
  return (
    <div className="otherPlayerData">
      <div className="OPData">{nWith || '-'}</div>
      <div className="OPData">{winPercentWith}</div>
      <div className="OPData">{nVS || '-'}</div>
      <div className="OPData">{winPercentVS}</div>
    </div>
  )
}

export function renderTime(id) {
  if (!window.builds) {
    return
  }
  return (
    <div className='timeHolder'>
      <div className='timeLabelHolder'>{window.builds[id].name}</div>
      <div className='timeInfoHolder'>
        <div className='dateHolder'>{
          `${window.builds[id].dates[0].toString().slice(4, 10)}
           - ${window.builds[id].dates[1].toString().slice(4, 10)}`
        }</div>
        <div className='replayCountHolder'>{`(${commify(window.builds[id].count)} Replays)`}</div>
      </div>
    </div>
  )
}

export function renderTinyMap(id) {
  return <img alt={id} className="tinyMap" src={`https://heroes.report/mapPostsTiny/${id}.png`}></img>
}

export function renderNothing() {
}
