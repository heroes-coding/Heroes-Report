import React, { Component } from 'react'
import { connect } from 'react-redux'
import Storage from './helpers/storage'
import { getHOTSDictionary, updatePreferences, rollbackState, getTalentDic, getYourData } from './actions'
import { Redirect, BrowserRouter, Route, Switch, withRouter } from 'react-router-dom'
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
import Markdown from './containers/markdown_display_redux'
import featuresPath from './md/features.md'
import aboutPath from './md/about.md'
import disclaimerPath from './md/disclaimer.md'
import Fuse from 'fuse.js'
import { sortObjectListByProperty } from './helpers/CPPBridge' // This is because sorting player matchups took 10 seconds for a list of 20K elements.  I have no idea why
window.sortObjectListByProperty = sortObjectListByProperty
let ParserAndUpdater, OptionsMenu, ipcRenderer, PreviewMenu

if (window.isElectron && window.windowID === 'parser') ParserAndUpdater = require('./electron/containers/parsingLogger/parserAndUpdater').default
else if (window.isElectron && window.windowID === 'preview') PreviewMenu = require('./electron/containers/preview/previewer').default
else if (window.isElectron && window.windowID === 'options') OptionsMenu = require('./electron/containers/optionsMenu/options').default
if (window.isElectron) ipcRenderer = window.require('electron').ipcRenderer

const showHeaders = !['parser','options','preview'].includes(window.windowID)
const Features = () => <Markdown path={featuresPath} />
const About = () => <Markdown path={aboutPath} />
const Disclaimer = () => <Markdown path={disclaimerPath} />

window.save = function(data, filename) {
  if (!data) {
    console.error('Console.save: No data')
    return
  }
  if (!filename) filename = 'console.json'
  if (typeof data === "object") {
    data = JSON.stringify(data, undefined, 4)
  }
  let blob = new window.Blob([data], {type: 'text/json'})
  let e = document.createEvent('MouseEvents')
  let a = document.createElement('a')
  a.download = filename
  a.href = window.URL.createObjectURL(blob)
  a.dataset.downloadurl = ['text/json', a.download, a.href].join(':')
  e.initMouseEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null)
  a.dispatchEvent(e)
}

class App extends Component {
  constructor(props) {
    super(props)
    if (window.isElectron) {
      window.parseReplay = function(replayPath) {
        ipcRenderer.send('parseSingleReplay',{replayPath})
      }
      ipcRenderer.on('loadPlayer', (e,playerID) => {
        this.props.history.push(`/players/${playerID}`)
      })
      ipcRenderer.on('dispatchSingleReplay', (e,replay) => {
        console.log(replay,'added to window.parsedReplay')
        window.parsedReplay = replay
      })
      window.yourReplays = []
      window.playerMatchups = {}
      window.playersByHandle = {}
      ipcRenderer.on('getPreviewPlayerInfo',(e,results) => {
        // This event / function takes in the preview info and checks it against player info in this main browser window and then sends it back to the main electron process to send to the actual preview window
        const { handles, battleTags } = results
        results.playerInfos = handles.map((h,i) => window.playersByHandle[`${h}#${battleTags[i]}`])
        ipcRenderer.send('ferryPreviewPlayerInfo',results)
      })
      ipcRenderer.on('replays:dispatch',(e,replays) => {
        window.yourReplays = window.yourReplays.concat(replays)
        window.yourReplays.sort((x,y) => x.MSL<y.MSL ? 1 : -1)
        const nNew = replays.length
        for (let r=0;r<nNew;r++) {
          const { allyIDs, enemyIDs, Won } = replays[r]
          for (let p=0;p<4;p++) {
            const [ bnetID, handle ] = allyIDs[p]
            if (!window.playerMatchups.hasOwnProperty(bnetID)) {
              window.playerMatchups[bnetID] = {handle, nWith: 0, nVS: 0, nWinWith: 0, nWinVS: 0, nMatches: 0}
              window.playersByHandle[handle] = window.playerMatchups[bnetID] // lookup by reference
            }
            window.playerMatchups[bnetID].nWith += 1
            window.playerMatchups[bnetID].nWinWith += Won
            window.playerMatchups[bnetID].nMatches += 1
          }
          for (let p=0;p<5;p++) {
            const [ bnetID, handle ] = enemyIDs[p]
            if (!window.playerMatchups.hasOwnProperty(bnetID)) {
              window.playerMatchups[bnetID] = {handle, nWith: 0, nVS: 0, nWinWith: 0, nWinVS: 0, nMatches: 0}
              window.playersByHandle[handle] = window.playerMatchups[bnetID] // lookup by reference
            }
            window.playerMatchups[bnetID].nVS += 1
            window.playerMatchups[bnetID].nWinVS += Won
            window.playerMatchups[bnetID].nMatches += 1
          }
        }
        window.matchupResults = Object.keys(window.playerMatchups).map((k,i) => {
          return {bnetID:parseInt(k), ...window.playerMatchups[k]}
        })
        window.matchupResults = window.sortObjectListByProperty(window.matchupResults, 'nMatches', true)
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
        if (window.location.pathname.includes("players/you")) this.props.getYourData()
      })
      ipcRenderer.on('playerInfo:dispatch',(e,{bnetIDs, handles, regions}) => {
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
    return (
      <div>
        {!window.isElectron&&<NavigationBar />}
        <div className={`container-fluid ${window.isElectron ? 'electronBody' : ''}`} >
          <div className="row">
            <div className="col-xl-1"></div>
            <div className={`col-sm-12 col-lg-12 col-xl-${window.isElectron ? '12' : '10'}`} id="contentHolder">
              <Switch>
                {window.isElectron && <Route path="/parser" component={ParserAndUpdater} />}
                {window.isElectron && <Route path="/options" component={OptionsMenu} />}
                {window.isElectron && <Route path="/preview" component={PreviewMenu} />}
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
          <Footer />
        </div>
        {window.isElectron&&<div className="electronHeader"><NavigationBar /></div>}
        {window.isElectron&&<TrafficLights window={window.remote.getCurrentWindow()} />}
        {window.isElectron&&<ElectronMenu/>}
        {window.isElectron&&<div className="appBorder" />}
      </div>
    )
  }
}

function mapStateToProps({prefs}) {
  return {prefs}
}

let MainApp = withRouter(connect(mapStateToProps, {getTalentDic, getHOTSDictionary, rollbackState, getYourData})(App))

class ExtraWindows extends Component {
  render() {
    const loading = document.getElementById('loadingWrapper')
    if (loading) loading.parentNode.removeChild(loading)
    return (
      <div>
        <div className={`container-fluid electronBody`} >
          <div className="row">
            <div className="col-xl-1"></div>
            <div className={`col-sm-12 col-lg-12 col-xl-12`} id="contentHolder">
              <Switch>
                {window.windowID==='parser'&&<Route path="/" component={ParserAndUpdater}/>}
                {window.windowID==='options'&&<Route path="/" component={OptionsMenu} />}
                {window.windowID==='preview'&&<Route path="/" component={PreviewMenu} />}
              </Switch>
            </div>
            <div className="col-xl-1"></div>
          </div>
        </div>
        <div className="appBorder" />
      </div>
    )
  }
}

class AppHolder extends Component {
  render() {
    return (
      <BrowserRouter>
        <div>
          {showHeaders&&<Route path="/" component={MainApp}/>}
          {!showHeaders&&<Route path="/" component={ExtraWindows}/>}
        </div>
      </BrowserRouter>
    )
  }
}

export default AppHolder
