import React, { Component } from 'react'
import { connect } from 'react-redux'
import Storage from './helpers/storage'
import { getHOTSDictionary, updatePreferences, rollbackState, getTalentDic, getYourData } from './actions'
import { BrowserRouter, Route, Switch } from 'react-router-dom'
import DataTable from './containers/table/data_table'
import HeroPage from './containers/heroPage/hero_page'
import NavigationBar from './containers/nav_bar/nav_bar'
import TrafficLights from './electron/containers/navigation/trafficLights'
import ElectronMenu from './electron/containers/navigation/electronMenu'
import Footer from './containers/footer/footer'
import PlayerPage from './containers/player_page'
import PlayerList from './containers/player_list/player_list'
import YourPage from './containers/your_page'
import getReplayBinary from './helpers/binary_replay_unpacker'
import Markdown from './containers/markdown_display'
import featuresPath from './md/features.md'
import aboutPath from './md/about.md'
import disclaimerPath from './md/disclaimer.md'
import Fuse from 'fuse.js'
let ParserAndUpdater, OptionsMenu, ipcRenderer
if (window.isElectron) ParserAndUpdater = require('./electron/containers/parsingLogger/parserAndUpdater').default
if (window.isElectron) OptionsMenu = require('./electron/containers/optionsMenu/options').default
if (window.isElectron) ipcRenderer = window.require('electron').ipcRenderer

const Features = () => <Markdown path={featuresPath} />
const About = () => <Markdown path={aboutPath} />
const Disclaimer = () => <Markdown path={disclaimerPath} />

class App extends Component {
  constructor(props) {
    super(props)
    if (window.isElectron) {
      window.parseReplay = function(replayPath) {
        ipcRenderer.send('parseSingleReplay',{replayPath})
      }
      ipcRenderer.on('dispatchSingleReplay', (e,replay) => {
        console.log(replay,'added to window.parsedReplay')
        window.parsedReplay = replay
      })
      window.yourReplays = []
      window.playerMatchups = {}
      ipcRenderer.on('replays:dispatch',(e,replays) => {
        window.yourReplays = window.yourReplays.concat(replays)
        window.yourReplays.sort((x,y) => x.MSL<y.MSL ? 1 : -1)
        const nNew = replays.length
        for (let r=0;r<nNew;r++) {
          const { allyIDs, enemyIDs, Won } = replays[r]
          for (let p=0;p<4;p++) {
            const [ bnetID, handle ] = allyIDs[p]
            if (!window.playerMatchups.hasOwnProperty(bnetID)) window.playerMatchups[bnetID] = {handle, nWith: 0, nVS: 0, nWinWith: 0, nWinVS: 0, nMatches: 0}
            window.playerMatchups[bnetID].nWith += 1
            window.playerMatchups[bnetID].nWinWith += Won
            window.playerMatchups[bnetID].nMatches += 1
          }
          for (let p=0;p<5;p++) {
            const [ bnetID, handle ] = enemyIDs[p]
            if (!window.playerMatchups.hasOwnProperty(bnetID)) window.playerMatchups[bnetID] = {handle, nWith: 0, nVS: 0, nWinWith: 0, nWinVS: 0, nMatches: 0}
            window.playerMatchups[bnetID].nVS += 1
            window.playerMatchups[bnetID].nWinVS += Won
            window.playerMatchups[bnetID].nMatches += 1
          }
        }
        window.matchupResults = Object.keys(window.playerMatchups).map((k,i) => {
          return {bnetID:parseInt(k), ...window.playerMatchups[k]}
        })
        window.matchupResults.sort((x,y) => x.nMatches < y.nMatches ? 1 : -1)
        const options = {
          shouldSort: true,
          threshold: 0.25,
          location: 0,
          distance: 100,
          maxPatternLength: 32,
          minMatchCharLength: 1,
          keys: ['handle']
        }
        window.playerFuse = new Fuse(window.matchupResults, options)
      })
      ipcRenderer.on('replays:finishedSending', nothing => {
        console.log('replays:finishedSending')
        if (window.location.pathname === "/players/you") this.props.getYourData()
      })
      ipcRenderer.on('playerInfo:dispatch',(e,{bnetIDs, handles, regions}) => {
        console.log('playerInfo:dispatch received')
        if (!bnetIDs.length) return
        window.fullIDs = bnetIDs.map((b,i) => `${regions[i]}-${b}`)
        // console.log(bnetIDs,handles,regions)
        // window.fullID = `${regions[0]}-${bnetIDs[0]}`
      })
    }
  }
  componentDidMount() {
    this.props.getHOTSDictionary()
    this.props.getTalentDic()
  }
  render() {
    const showHeaders = !['/parser','/options'].includes(window.location.pathname)
    return (
      <BrowserRouter>
        <div>
          {!window.isElectron&&<NavigationBar />}
          <div className={`container-fluid ${window.isElectron ? 'electronBody' : ''}`} >
            <div className="row">
              <div className="col-xl-1"></div>
              <div className={`col-sm-12 col-lg-12 col-xl-${window.isElectron ? '12' : '10'}`} id="contentHolder">
                <Switch>
                  {window.isElectron && <Route path="/parser" component={ParserAndUpdater} />}
                  {window.isElectron && <Route path="/options" component={OptionsMenu} />}
                  <Route path="/playerlist/:id" component={PlayerList} />
                  <Route path="/players/:id" component={PlayerPage} />
                  <Route path="/heroes/:id" component={HeroPage} />
                  <Route path="/you" component={YourPage} />
                  <Route path="/features" component={Features} />
                  <Route path="/about" component={About} />
                  <Route path="/disclaimer" component={Disclaimer} />
                  <Route path="/" component={DataTable} />
                </Switch>
              </div>
              <div className="col-xl-1"></div>
            </div>
            {showHeaders&&<Footer />}
          </div>
          {window.isElectron&&showHeaders&&<div className="electronHeader"><NavigationBar /></div>}
          {window.isElectron&&showHeaders&&<TrafficLights window={window.remote.getCurrentWindow()} />}
          {window.isElectron&&showHeaders&&<ElectronMenu/>}
          {window.isElectron&&<div className="appBorder" />}
        </div>
      </BrowserRouter>

    )
  }
}

function mapStateToProps({prefs}) {
  return {prefs}
}

export default connect(mapStateToProps, {getTalentDic, getHOTSDictionary, rollbackState, getYourData})(App)
