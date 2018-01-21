import React from 'react'
import ListPart from './list_part'
import DoubleCell from '../../components/double_cell'
import Arc from '../../components/arc'
import { hashString } from '../../helpers/hasher'
import { formatNumber } from '../../helpers/smallHelpers'
import PercentBar from '../../components/percent_bar'
const barColors = ['#8C5F8C','#51A1A7','#6383C4']

function formatDate(value) {
  let month = value.getMonth()+1
  month = month < 10 ? `0${month}` : month
  let day = value.getDate()
  day = day < 10 ? `0${day}` : day
  return `${month}/${day}/${value.getYear()-100}`
}
function formatTime(value) {
  let hours = value.getHours()
  const dayNight = hours > 11 ? 'pm' : 'am'
  hours = hours%12
  hours = hours === 0 ? 12 : hours
  let minutes = value.getMinutes()
  minutes = minutes > 9 ? minutes : `0${minutes}`
  return `${hours}:${minutes}${dayNight}`
}
function formatLength(length) {
  let minutes = Math.floor(length/60)
  let seconds = Math.floor(length%60)
  minutes = minutes < 10 ? `0${minutes}` : minutes
  seconds = seconds < 10 ? `0${seconds}` : seconds
  return `${minutes}m${seconds}s`
}

const modes = {
  1: "QM",
  2: "UD",
  3: "HL",
  4: "TL",
  5: "BR"
}

function getReplay(props) {
  const { MSL, heroes, winners, length, mode, build, map } = props
  const hashInput = `${mode}${Math.round(length/60)}${heroes.join("")}${winners}${MSL}${map}${build}`
  const hashPath = `https://heroes.report/stats/replays/${hashString(hashInput)}.json`
  console.log(hashInput,hashPath)
}

let statBar = (statValue,index,statRange, statName) => {
  const percent = (statValue-statRange[0])/statRange[1]
  const number = formatNumber(statValue).toString()
  const spaces = 5-number.length
  return (
    <div className={`miniStatBar ${percent}`} key={`${index}${statValue}`}>
      <PercentBar
        percent = {Math.min(1, percent)}
        barColor = {barColors[index]}
      />
      <div className='miniStatText' style={{'top': `${-22 + index*3}px`}}>
        {`${statName}:`}{Array(spaces).fill('\u00A0').join("")}{`${formatNumber(statValue)}`}
      </div>
    </div>
  )
}

let talentIcon = (talentIcon,key) => {
  talentIcon = `${talentIcon || talentIcon === 0 ? `${talentIcon}.jpg` : 'empty.png'}`
  return (
    <div className='tinyTalentHolder' key={key}>
      <img
        key={key}
        className="tinyTalent"
        src={`https://heroes.report/singleTalentsTiny/${talentIcon}`}
        alt={talentIcon}
      ></img>
    </div>
  )
}

let tinyHero = (hero,key) => {
  return (
    <img
      key={key}
      className={`tinyHero ${hero}`}
      src={`https://heroes.report/squareHeroes/${hero}.jpg`}
      alt={hero}
    ></img>
  )
}

let firsts = (first,text) => {
  return (
    <div
      className="firsts"
      style={{color: first === 1 ? '#00ff00' : first === 0 ? '#ff0000' : '#333'}}
    >
      {text}
    </div>
  )
}

let left = props => {
  return (
    <ListPart
      extraClass='listPart'
      childComponent={
        <div onClick={() => getReplay(props)} className="inner_list_item_left">
          <img
            className="tinyReplayHero"
            src={`https://heroes.report/squareHeroes/${props.hero}.jpg`}
            alt={props.slot}
          ></img>
          <Arc
            color={"#0000ff"}
            id={props.id}
            dim={28}
            translate="(7,13)"
            extraClass="reportArc"
          />
          <img
            className="tinyReplayMap"
            src={`https://heroes.report/mapPostsTiny/${props.map}.png`}
            alt={props.map}
          ></img>
          <span className="gameModeBox">
            {modes[props.mode]}
          </span>
          <DoubleCell
            topValue={formatDate(props.date)}
            bottomValue={formatTime(props.date)}
          />
          <span
            className="victoryBox"
            style={{color: props.won ? '#00ff00' : '#ff0000'}}
          >
            {props.won ? 'V' : 'D'}
          </span>
          <span className="gameLength">
            {formatLength(props.length)}
          </span>
          <div className="teamsHolder">
            <div className="tinyHeroHolder" style={{background: "#022c02"}}>
              {[0,1,2,3,4].map((x) => tinyHero(props.allies[x],`${props.MSL}-${x}`))}
            </div>
            <div className="tinyHeroHolder" style={{background: "#350101"}}>
              {[0,1,2,3,4].map((x) => tinyHero(props.enemies[x],`${props.MSL}-${x}`))}
            </div>
          </div>
        </div>
      }
    />
  )
}

export default (props) => {
  return (
    <div className="replayItem row">
      {left(props)}
      <ListPart
        extraClass='listPart'
        childComponent={
          <div className="inner_list_item_right">
            <div className="miniStatsHolder">
              {props.stats.map((x,i) => statBar(props[x],i,props.ranges[i],x))}
            </div>
            <div className="firstsHolder">
              {firsts(props.FirstTo10,"10")}
              {firsts(props.FirstTo20,"20")}
            </div>
            <div className="talentsHolder">
              {[0,1,2,3,4,5,6].map((x) => talentIcon(props.talPics[x],`${props.MSL}-${x}`))}
            </div>
          </div>
        }
      />
    </div>
  )
}
