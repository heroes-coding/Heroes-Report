import React, { Component } from 'react'
import { connect } from 'react-redux'
import Graph from '../../components/graph/graph'
import Legend from '../../components/graph/legend'
import { formatNumber, roundedPercent, roundedPercentPercent, MSLToDateString, simplePercent, formatStatNumber, tinyPercent, sToM, formatDate, DateToMSL, statSToM } from '../../helpers/smallHelpers'
import axios from 'axios'
import { withRouter } from 'react-router-dom'
import { formatPercentile } from '../player_list/player_list'
import Popup from '../../components/popup'
import awardProcessor from '../../helpers/awardProcessor'
import Wheel from './wheels'
import * as d3 from 'd3'
const modeLetters = {3: 'h', 1:'q', 4:'t', 2:'u'}

const header = () => {
  return (
    <div className="replayFlexHeaderHolder">
      <div className="replayFlexIcon replayFlexHeader" />
      <div className="replayFlexPlayer replayFlexHeader">Player</div>
      <div className="replayFlexMMR replayFlexHeader">MMR</div>
      <div className="replayFlexAwards replayFlexHeader">Awards</div>
      <div className="replayFlexTalents replayFlexHeader">
        {[1,4,7,10,13,16,20].map(x => {
          return <div key = {`talent${x}`} className="replayFlexTalent">{x}</div>
        })}
      </div>
    </div>
  )
}

const Team = (props) => {
  const { Allies, MMR, D, Towns, Mercs, Globes, gameMode, bans } = props
  return (
    <div className={`replayFlexBody ${Allies ? 'ally' : 'enemy'}Box`}>
      {gameMode < 5 && gameMode > 1 && <div className="banHolder">
        {[0,1].map(b => {
          return (
            <div key={b} className="strikethrough">
              <img
                className="tinyBanHero"
                src={`https://heroes.report/squareHeroes/${bans[b] ? bans[b] : "black"}.jpg`}
                alt={bans[b] || b}
              ></img>
            </div>
          )
        })}
      </div>}
      <div className='teamHeader'>MMR: {MMR}</div>
      <div className='teamHeader'>Deaths: {D}</div>
      <div className='teamHeader'>Towns: {Towns}</div>
      <div className='teamHeader'>Mercs: {Mercs}</div>
      <div className='teamHeader'>Globes: {Globes}</div>
    </div>
  )
}

const InfoRow = (props) => {
  const { history,hero,handle,MMR,talents, className, bnetID, index, openPopup, messagePopup, awards } = props
  let thisDiv
  return (
    <div key={handle} ref={div => { thisDiv = div }} className={className}>
      <div className="replayFlexIcon">
        <img
          className="tinyFlexHero"
          src={`https://heroes.report/squareHeroes/${hero}.jpg`}
          alt={handle}
        ></img>
      </div>
      <div
        className="replayFlexPlayer"
        onClick={() => {
          console.log(index,bnetID,handle)
          if (index!==0) {
            history.push(`/players/${bnetID}`)
          }
        }}
      >{handle}</div>
      <div className="replayFlexMMR">
        {MMR[0]}
        <br />
        <span className="MMRNumber">{MMR[1]}</span>
      </div>
      <div className="replayFlexAwards">
        {awards.map((x,i) => {
          const [name, desc] = x
          return (
            <div
              className='replayFlexAward'
              key = {name}
              onMouseEnter={(event) => {
                event.preventDefault()
                openPopup(index,thisDiv,name,desc,`https://heroes.report/singleAwards/${name}.png`,true)
              }}
              onMouseLeave={(event) => {
                event.preventDefault()
                messagePopup()
              }}
            >
              <img
                className="tinyTalent"
                src={`https://heroes.report/singleAwards/${name}.png`}
                alt={name}
              ></img>
            </div>
          )
        })}
      </div>
      <div className="replayFlexTalents">
        {[1,4,7,10,13,16,20].map((x,i) => {
          const talent = talents[i*2]
          let talentIcon = window.HOTS.talentPics[talent]
          talentIcon = isNaN(talentIcon) ? 'Black' : talentIcon
          return (
            <div
              className='replayFlexTalent'
              key = {`talent${x}`}
              onMouseEnter={(event) => {
                if (!talent) {
                  return
                }
                let name, desc
                try {
                  name = window.HOTS.cTalents[hero][talent][0]
                  desc = window.HOTS.cTalents[hero][talent][1]
                } catch (e) {
                  console.log(talent,hero,isNaN(talent))
                  return
                }
                event.preventDefault()
                openPopup(index,thisDiv,name,desc,`https://heroes.report/singleTalents/${talentIcon}.jpg`,true)
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
                className="tinyTalent"
                src={`https://heroes.report/singleTalentsTiny/${talentIcon}.jpg`}
                alt={talentIcon}
              ></img>
            </div>
          )
        })}
      </div>
    </div>
  )
}

class Replay extends Component {
  shouldComponentUpdate(nextProps) {
    if (this.props.handle !== nextProps.handle || this.props.MSL !== nextProps.MSL) {
      this.setState({
        unloaded: true,
        mmrs:null,
        popupOpen:false,
        popupX:0,
        popupY:5,
        popupName: '',
        popupDesc: '',
        popupPic: '',
        sortBy: 'Date',
        sortDesc: true,
      })
    }
    return this.state.unloaded
  }
  async populateMMRS(bnetIDs, gameMode) {
    let res = await axios.get(`https://heroes.report/search/mmrs/${bnetIDs.join(",")}`)
    res = res.data
    const resKeys = Object.keys(res)
    const mmrs = {}
    for (let m=0;m<resKeys.length;m++) {
      const id =resKeys[m]
      const mmr = res[id]
      const l = modeLetters[gameMode]
      if (gameMode === 5 || !mmr.hasOwnProperty(l)) {
        mmrs[id] = mmr['q'] ? mmr['q'] : null
      } else {
        mmrs[id] = mmr[l]
      }
    }
    this.setState({...this.state, mmrs})
  }
  constructor(props) {
    super(props)
    this.populateMMRS = this.populateMMRS.bind(this)
    this.state = {
      unloaded: true,
      mmrs:null,
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
  }
  openPopup(row,div, popupName, popupDesc, popupPic,isTalent, x, y) {
    const conDiv = this.div.getBoundingClientRect()
    if (this.popupTimeout) {
      clearTimeout(this.popupTimeout)
      this.popupTimeout = null
    }
    if (!x) {
      y = row*31+72
      popupName = popupName.replace('Blue ','').replace('Red ','')
      const rowDiv = div.getBoundingClientRect()
      const extraWide = conDiv.width > 780 || false
      window.pDiv = div
      window.oDiv = this.div
      if (isTalent && extraWide) {
        x = rowDiv.width/2
      } else if (!extraWide) {
        x = (rowDiv.width - 380)/2
      } else {
        x = (rowDiv.width - 760)/2
      }
    } else {
      y = y - conDiv.y
    }
    this.visualChange = true
    this.setState({
      ...this.state,
      popupOpen:true,
      popupX: x,
      popupY:y,
      popupName,
      popupDesc,
      popupPic,
    })
  }
  componentWillUnmount() {
    if (this.popupTimeout) {
      clearTimeout(this.popupTimeout)
    }
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
  render() {
    const { replayData, handle, bnetID, thisDiv } = this.props
    if (!replayData) {
      console.log(replayData)
      return (
        <div className="replayFlexHolder row">
          <div className={`col-12 col-md-6 col-xl-6 replayCol`} align="center">
            <div className="inner_list_item_right replayFlex">
              Replay not found.
            </div>
          </div>
        </div>
      )
    }
    this.div = thisDiv
    const { mmrs } = this.state
    const { heroes, handles, slot, team, gameMode, allies, enemies, players, colors, heroNames, globes, maxGlobes, towns, mercs, bans, levels, levelMax, stackedXP, maxTime, bnetIDs, stats, awards, wheelData, MSL, mapStats } = replayData
    if (!mmrs && !this.mmrsCalled) {
      this.populateMMRS(bnetIDs, gameMode)
      this.mmrsCalled = true
    }
    return (
      <div className="replayFlexHolder row">
        <div className={`col-12 col-md-6 col-xl-6 replayCol`} align="center">
          <div className="inner_list_item_right replayFlex">
            <div className="replayReport">
              {header()}
              <Popup
                name={this.state.popupName}
                desc={this.state.popupDesc}
                extendedDesc={this.state.popupExtendedDesc}
                classo="replayTalentPopup"
                open={this.state.popupOpen}
                x={this.state.popupX}
                y={this.state.popupY}
                pic={this.state.popupPic}
              />
              {players.map((p,i) => {
                const s = p
                const hIndex = heroes[s][0]
                const id = bnetIDs[i]
                return <InfoRow
                  key={id}
                  history={this.props.history}
                  hero={hIndex}
                  handle={handles[s]}
                  MMR={mmrs && mmrs[id] ? [mmrs[id].mmr,formatPercentile(mmrs[id].percentile)] : ['-----','-----']}
                  talents={heroes[s].slice(30,44).map(t => !t ? null : isNaN(t) ? parseInt(window.HOTS.talentsN[t]) : t)}
                  className={`replayFlexBody ${i === 0 ? 'replaySelf' : ''} ${i%2 ? 'oddBody' : 'evenBody'}`}
                  bnetID={id}
                  index={i}
                  openPopup={this.openPopup}
                  messagePopup={this.messagePopup}
                  awards={awards[s]}
                />
              })}
              {[0,1].map(team => {
                const teamPlayers = players.slice(team*5+0,team*5+5)
                return (
                  <Team
                    key={team}
                    Allies={!team}
                    bans={bans[team]}
                    gameMode={gameMode}
                    MMR={
                      mmrs ? Math.round(d3.mean(teamPlayers.map(p => {
                        const mmr = mmrs[bnetIDs[p]]
                        return mmr ? mmr.mmr : null
                      }).filter(x => x))) : '-----'
                    }
                    D={d3.sum(teamPlayers.map(p => stats[p]))}
                    Towns={towns[team].length-1}
                    Mercs={mercs[team].length-1}
                    Globes={d3.sum(teamPlayers.map(p => globes[p].length))}
                  />
                )
              })}
            </div>
            <Graph
              graphClass="globesGraph"
              multiLines={levels}
              stackedBars={stackedXP}
              colors={["#00ff00","#ff0000","#fff000","#ff0000","#4800ff","#009cff","#a8ff00"]}
              lineLabels={["Ally Level","Enemy Level","Minion XP", "Hero XP", "Creep XP", "Trickle XP", "Structure XP"]}
              xLabel="Minutes"
              yLabel="Level"
              title='Team Experience and Levels'
              xRatio={500}
              yRatio={450}
              xOff={20}
              xMin={0}
              yMin={0}
              xMax={maxTime}
              yMax={levelMax}
              yOff={50}
              noArea={true}
              formatter={formatNumber}
              yFormatter={formatNumber}
            />
            <div className="matchupGraphs">
              {[0,1].map(team => {
                const teamPlayers = players.slice(team*5,team*5+5).filter(p => globes[p].length)
                return (
                  <Graph
                    key={team}
                    graphClass="globesGraph"
                    yMax = {maxGlobes}
                    multiLines={teamPlayers.map(p => globes[p])}
                    colors={teamPlayers.map(p => colors[p])}
                    lineLabels={teamPlayers.map(p => heroNames[p])}
                    xLabel="Minutes"
                    yLabel="Globes"
                    title={`${team ? 'Enemy': 'Ally'} globes`}
                    xRatio={250}
                    yRatio={400}
                    xOff={20}
                    xMax={maxTime}
                    yOff={50}
                    noArea={true}
                    formatter={formatNumber}
                    yFormatter={formatNumber}
                  />
                )
              })}
            </div>
            <div className="matchupGraphs">
              <Graph
                graphClass="globesGraph"
                yMax = {d3.max(towns.map(t => t.length))}
                multiLines={towns.filter(t => t.length).map(teamTowns => {
                  return teamTowns.map((t,i) => {
                    const [ secs, x, y, capturer ] = t
                    return [secs/60, i]
                  })
                })
                }
                colors={["#00ff00","#ff0000"].filter((t,i) => towns[i].length)}
                lineLabels={["Allies","Enemies"].filter((t,i) => towns[i].length)}
                xLabel="Minutes"
                yLabel="Towns"
                title='Towns Captured'
                xRatio={250}
                yRatio={250}
                xOff={20}
                xMin={0}
                yMin={0}
                xMax={maxTime}
                yOff={50}
                noArea={true}
                formatter={formatNumber}
                yFormatter={formatNumber}
              />
              <Graph
                graphClass="globesGraph"
                yMax = {d3.max(mercs.map(t => t.length))}
                multiLines={mercs.filter(t => t.length).map(teamTowns => {
                  return teamTowns.map((t,i) => {
                    const [ secs, x, y, capturer ] = t
                    return [secs/60, i]
                  })
                })
                }
                colors={["#00ff00","#ff0000"].filter((t,i) => towns[i].length)}
                lineLabels={["Allies","Enemies"].filter((t,i) => towns[i].length)}
                xLabel="Minutes"
                yLabel="Mercs"
                title='Merc. Camp Captures'
                xRatio={250}
                yRatio={250}
                xOff={20}
                xMin={0}
                yMin={0}
                xMax={maxTime}
                yOff={50}
                noArea={true}
                formatter={formatNumber}
                yFormatter={formatNumber}
              />
            </div>
            <Wheel
              key={MSL}
              dataRoot={wheelData.deathRoot}
              wheelName="Death"
              isDeath={true}
              openPopup={this.openPopup}
              messagePopup={this.messagePopup}
            />
            <Wheel
              key={`M${MSL}`}
              dataRoot={wheelData.murderRoot}
              wheelName="Murder"
              isDeath={false}
              openPopup={this.openPopup}
              messagePopup={this.messagePopup}
            />
          </div>
        </div>
        <div className={`col-12 col-md-6 col-xl-6 replayCol`} align="center">
          <div className="inner_list_item_left replayFlex reportStatHolder">
            <div className="barLegend">
              <div className="legendTitle">Bar Graphs Legend</div>
              <div className="legendFlexBody">
                {players.map(p => {
                  const style={color:colors[p]}
                  return (
                    <div
                      key={p}
                      className="heroLegend"
                      style={style}
                    >{heroNames[p]}</div>
                  )
                })}
              </div>
            </div>
            {[
              {category: "Map Specific Stats", stats:mapStats.map(k => [k,window.HOTS.nMapStat[k]])},
              {category: "Overall Stats", stats:[["Experience",null],["Mercs",null],["Globes","Regeneration Globes"],["Level",null],["FireTime","Time on Fire"]]},
              {category: "Death Stats", stats:[["KDA",null],["Deaths",null],["OutnmbdDeaths","Outnumbered Deaths"],["DeadTime","Time Spent Dead"],["Kills",null],["Vengeances",null],["Assists",null],["KillStreak","Kill Streak"]]},
              {category: "Damage Stats", stats:[["HeroDam","Hero Damage"],["TFHeroDam","Teamfight Hero Damage"],["BuildingDam","Building Damage"],["MinionDam","Minion Damage"],["SummonDam"],["Summon Damage"],["CreepDam","Creep Damage"]]},
              {category: "Sustain Stats", stats:[["Healing",null],["SelfHealing","Self Healing"],["ClutchHeals","Clutch Heals"],["Protection",null],["TFDamTaken","Teamfight Damage Taken"],["Escapes",null],["TFEscapes","Teamfight Escapes"]]},
              {category: "Crowd Control", stats:[["CCTime","C.C. Seconds"],["StunTime","Stunning Seconds"],["SilenceTime","Silencing Seconds"],["RootTime","Rooting Seconds"]]},
            ].map(c => {
              return (
                <div key={c.category} className="statCat">
                  <div className="statCatTitle">{c.category}</div>
                  {c.stats.map(stat => {
                    let [ s, name ] = stat
                    name = name || s
                    const bars = players.map((p,i) => [i,stats[i][s],colors[p]])
                    if (!bars.filter(x => x[1]).length) {
                      return <div key={s}></div>
                    }
                    return (
                      <Graph
                        key={s}
                        graphClass="heroStat winrateGraph barGraph"
                        containerClass="barHolder"
                        bars={bars}
                        xLabel=""
                        yLabel={name}
                        title={name}
                        xRatio={1000}
                        yRatio={100}
                        xOff={0}
                        yOff={25}
                        noArea={true}
                        formatter={formatNumber}
                        yFormatter={formatNumber}
                      />
                    )
                  })}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    )
  }
}

function mapStateToProps(state, ownProps) {
  return {...ownProps}
}

export default withRouter(connect(mapStateToProps)(Replay))
