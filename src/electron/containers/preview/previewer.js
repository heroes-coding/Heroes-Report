import React, { Component } from 'react'
import { connect } from 'react-redux'
import { renderNothing } from '../../../components/filterComponents'
import { simplePercent } from '../../../helpers/smallHelpers'
import { formatPercentile } from '../../../containers/player_list/player_list'
import FilterDropDown from '../../../containers/filter_drop_down'
import TrafficLights from '../navigation/trafficLights'
import axios from 'axios'
import * as d3 from 'd3'
const colors10 = d3.scaleOrdinal(d3.schemeCategory10)
const electron = window.require('electron')
const { ipcRenderer, remote } = electron

const MMRDropdowns = [
  {name: 'Quick Match', id: 'q'},
  {name: 'Hero League', id: 'h'},
  {name: 'Team League', id: 't'},
  {name: 'Unranked Draft', id: 'u'}
]
const MMRNames = {}
MMRDropdowns.map(m => { MMRNames[m.id] = m.name })

class OptionsMenu extends Component {
  updateMode(mode) {
    this.setState({...this.state, mode})
  }
  constructor(props) {
    super(props)
    this.updateMode = this.updateMode.bind(this)
    this.state = { players: [], mode: 'q', you: -1, team: -1 }
    ipcRenderer.on('ferryPreviewPlayerInfo',async(e,args) => {
      const { results, handles:yourHandles, bnetIDs } = args
      const { handles, battleTags, playerInfos, teamNumbers } = results
      console.log(teamNumbers)
      const fullHandles = []
      const players = []
      const playerIndexes = {}
      let you, team
      for (let p=0;p<10;p++) {
        const fullHandle = `${handles[p]}#${battleTags[p]}`
        playerIndexes[fullHandle] = p
        fullHandles.push(fullHandle.replace('#','_'))
        if (yourHandles.indexOf(fullHandle) !== -1) {
          you = p
          team = Math.floor(p/5)
        }
        let player = {fullHandle, team:teamNumbers[p]}
        const playerInfo = playerInfos[p]
        if (playerInfo) player = {...player, ...playerInfo}
        else player = {...player, ...{nWith: '-', nVS: '-', nWinWith: '-', nWinVS: '-', nMatches: '-'}}
        players.push(player)
      }
      const mmrsPath = `https://heroes.report/api/mmrsbyhandle/${fullHandles.join(",")}`
      // console.log(mmrsPath)
      // const mmrsPath = `https://heroes.report/search/mmrs/${bnetIDs.join(",")}`
      let res = await axios.get(mmrsPath)
      res = res.data
      const resKeys = Object.keys(res)
      for (let m=0;m<resKeys.length;m++) {
        const id =resKeys[m]
        const p = playerIndexes[id]
        players[p].mmrs = res[id]
      }
      this.setState({...this.state,players, you, team})
    })
  }
  render() {
    const { you, team, mode } = this.state
    return (
      <div className="overall optionsDiv">
        <div className="electronHeader">
          <TrafficLights window={remote.getCurrentWindow()} noMax={true} noMin={true} />
          <div className="optionsTitle">
            Match Preview
          </div>
        </div>
        <div className="ReactTable -striped -highlight accountList">
          <div className="rt-table" >
            <div className="rt-thead -header">
              <div className="previewTitle">
                {"Click on a player's name to open their full history in the main window"}
              </div>
              <div className="mmrDrop">
                <FilterDropDown
                  currentSelection=""
                  name={`Please choose an MMR Type: ${MMRNames[mode]}`}
                  id='gameMode'
                  dropdowns={ MMRDropdowns }
                  updateFunction={this.updateMode}
                  leftComponentRenderer={renderNothing}
                  rightComponentRenderer={renderNothing}
                  renderDropdownName={true}
                  currentID={ mode }
                />
              </div>
              <div className="rt-tr">
                <div className="rt-th replayFileList -cursor-pointer">Player</div>
                <div className="rt-th parsedList -cursor-pointer">MMR</div>
                <div className="rt-th parsedList -cursor-pointer">Percentile</div>
                <div className="rt-th parsedList -cursor-pointer">Matches W.</div>
                <div className="rt-th parsedList -cursor-pointer">Win % W.</div>
                <div className="rt-th parsedList -cursor-pointer">Matches VS</div>
                <div className="rt-th parsedList -cursor-pointer">Win % VS</div>
              </div>
            </div>
            <div className="rt-tbody">
              {this.state.players.map((p,i) => {
                const { nWith, nVS, nWinWith, nWinVS, fullHandle, mmrs } = p
                const playerID = i === you ? 'you' : mmrs ? `${mmrs.region}-${mmrs.id}` : null
                let winPercentWith = nWith && nWith !== '-' ? simplePercent(nWinWith/nWith) : '-'
                let winPercentVS = nVS && nVS !== '-' ? simplePercent(nWinVS/nVS) : '-'
                const MMRInfo = mmrs ? (mmrs[mode] ? mmrs[mode] : (mmrs['q'] ? mmrs['q'] : null)) : null
                const MMR = MMRInfo ? MMRInfo.mmr : '-'
                const percentile = MMRInfo ? formatPercentile(MMRInfo.percentile) : '-'
                const playerTeam = Math.floor(i/5)
                const isAlly = i !== you && playerTeam === team
                const isEnemy = playerTeam === 1 - team
                const rowClass = i === you ? 'youRow' : (isAlly ? 'allyRow ' : (isEnemy ? 'enemyRow' : ''))
                const label = i === you ? 'you' : (isAlly ? 'ally' : (isEnemy ? 'enemy' : ''))
                const teamClass = p.team+(p.team ? Math.floor(i/5)*2 : 0)
                let partyStyle = {backgroundColor: teamClass ? colors10(teamClass) : 'none'}
                return (
                  <div
                    key={i} className="rt-tr-group"
                    onClick={() => {
                      if (playerID) ipcRenderer.send('loadPlayer',playerID)
                    }}
                  >
                    <div className={`rt-tr replayItem addPath`}>
                      <div key={teamClass} className='teamPartyBar' style={partyStyle} />
                      <div
                        className={`rt-td handleCell  ${rowClass}`}
                      >
                        {fullHandle} ({label})
                        <div className="unavailable">{playerID ? '' : 'PLAYER PROFILE UNAVAILABLE'}</div>
                      </div>
                      <div className={`rt-td parsedPath`}>{MMR}</div>
                      <div className={`rt-td parsedPath`}>{percentile}</div>
                      <div className={`rt-td parsedPath`}>{nWith}</div>
                      <div className={`rt-td parsedPath`}>{winPercentWith}</div>
                      <div className={`rt-td parsedPath`}>{nVS}</div>
                      <div className={`rt-td parsedPath`}>{winPercentVS}</div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    )
  }
}

function mapStateToProps(state, ownProps) {
  return {...ownProps}
}

export default connect(mapStateToProps)(OptionsMenu)
