import React from 'react'
import ListPart from './list_part'
import DoubleCell from '../../components/double_cell'
import Arc from '../../components/arc'
import { hashString } from '../../helpers/hasher'
import { formatNumber, formatDate, formatTime, formatLength } from '../../helpers/smallHelpers'
import PercentBar from '../../components/percent_bar'
const barColors = ['#8C5F8C','#51A1A7','#6383C4']


const modes = {
  1: "QM",
  2: "UD",
  3: "HL",
  4: "TL",
  5: "BR"
}

function getReplay(props) {
  const { MSL, heroes, winners, Length, mode, build, map } = props
  const hashInput = `${mode}${Math.round(Length/60)}${heroes.join("")}${winners}${MSL}${map}${build}`
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
        percent = {Math.min(1, isNaN(percent) ? 0 : percent)}
        barColor = {barColors[index]}
      />
      <div className='miniStatText' style={{'top': `${-22 + index*3}px`}}>
        {`${statName}:`}{Array(spaces).fill('\u00A0').join("")}{`${formatNumber(statValue)}`}
      </div>
    </div>
  )
}
let talentIcon = (talentIcon,key,row,openPopup,messagePopup,talent,hero) => {
  talentIcon = `${talentIcon || talentIcon === 0 ? `${talentIcon}.jpg` : 'empty.png'}`
  return (
    <div
      className='tinyTalentHolder'
      key={key}
      onMouseEnter={(event) => {
        if (!talent) {
          return
        }
        const name = window.HOTS.cTalents[hero][talent][0]
        const desc = window.HOTS.cTalents[hero][talent][1]
        event.preventDefault()
        openPopup(row,key,name,desc,`https://heroes.report/singleTalents/${talentIcon}`)
      }}
      onMouseLeave={(event) => {
        if (!talent) {
          return
        }
        event.preventDefault()
        messagePopup()
      }}
    >
      <img
        key={key}
        className="tinyTalent"
        src={`https://heroes.report/singleTalentsTiny/${talentIcon}`}
        alt={talentIcon}
      ></img>
    </div>
  )
}

let tinyHero = (hero,key,openPopup,row,messagePopup) => {
  return (
    <img
      onMouseEnter={(event) => {
        const name = window.HOTS.nHeroes[hero]
        const desc = ''
        event.preventDefault()
        openPopup(row,key,name,desc,`https://heroes.report/squareHeroes/${hero}.jpg`)
      }}
      onMouseLeave={(event) => {
        event.preventDefault()
        messagePopup()
      }}
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
            onMouseEnter={(event) => {
              const name = window.HOTS.nHeroes[props.hero]
              const desc = ''
              event.preventDefault()
              props.openPopup(props.row,props.key,name,desc,`https://heroes.report/squareHeroes/${props.hero}.jpg`)
            }}
            onMouseLeave={(event) => {
              event.preventDefault()
              props.messagePopup()
            }}
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
            onMouseEnter={(event) => {
              const mapName = window.HOTS.nMaps[props.map]
              const pName = props.handle.split('#')[0]
              const name = `${mapName} | ${props.won ? 'Victory' : 'Defeat'}`
              const desc = `${pName} ${props.won ? 'won' : 'lost'} a${props.mode === 2 ? 'n' :''} ${window.HOTS.nModes[props.mode]}${props.mode === 1 || props.mode === 5 ? '' : ' match'} on ${mapName} as ${window.HOTS.nHeroes[props.hero]} in ${formatLength(props.Length,true)} on ${props.date.toString().slice(0,10)} at ${formatTime(props.date)}.`
              event.preventDefault()
              props.openPopup(props.row,props.key,name,desc,`https://heroes.report/mapPosts/${props.map}.jpg`)
            }}
            onMouseLeave={(event) => {
              event.preventDefault()
              props.messagePopup()
            }}
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
            {formatLength(props.Length)}
          </span>
          <div className="teamsHolder">
            <div className="tinyHeroHolder" style={{background: "#022c02"}}>
              {[0,1,2,3,4].map((x) => tinyHero(props.allies[x],`${props.MSL}-${x}`,props.openPopup,props.row,props.messagePopup))}
            </div>
            <div className="tinyHeroHolder" style={{background: "#350101"}}>
              {[0,1,2,3,4].map((x) => tinyHero(props.enemies[x],`${props.MSL}-${x}`,props.openPopup,props.row,props.messagePopup))}
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
              {props.stats.map((x,i) => statBar(props.statValues[i],i,props.ranges[i],x))}
            </div>
            <div className="firstsHolder">
              {firsts(props.FirstTo10,"10")}
              {firsts(props.FirstTo20,"20")}
            </div>
            <div className="talentsHolder">
              {[0,1,2,3,4,5,6].map((x) => talentIcon(props.talPics[x],`${props.MSL}-${x}`,props.row,props.openPopup,props.messagePopup,props.talents[x],props.hero))}
            </div>
          </div>
        }
      />
    </div>
  )
}
