import React, { Component } from 'react'
import { connect } from 'react-redux'
import Storage from './helpers/storage'
import { getHOTSDictionary, updatePreferences, getMainData, rollbackState, getTalentDic } from './actions'
import { BrowserRouter, Route, Switch } from 'react-router-dom'
import DataTable from './containers/table/data_table'
import HeroPage from './containers/heroPage/hero_page'
import NavigationBar from './containers/nav_bar/nav_bar'
import PlayerPage from './containers/player_page'
import PlayerList from './containers/player_list/player_list'
import YourPage from './containers/your_page'
import getReplayBinary from './helpers/binary_replay_unpacker'

window.getReplayBinary = getReplayBinary

class App extends Component {
  componentDidMount() {
    this.props.getHOTSDictionary()
    this.props.getMainData(this.props.prefs)
    this.props.getTalentDic()
  }
  render() {
    return (

      <BrowserRouter>
        <div>
          <NavigationBar />
          <div className="container-fluid" >
            <div className="row">
              <div className="col-xl-1"></div>
              <div className="col-sm-12 col-lg-12 col-xl-10" id="contentHolder">
                <Switch>
                  <Route path="/playerlist/:id" component={PlayerList} />
                  <Route path="/players/:id" component={PlayerPage} />
                  <Route path="/heroes/:id" component={HeroPage} />
                  <Route path="/you" component={YourPage} />
                  <Route path="/" component={DataTable} />
                </Switch>
              </div>
              <div className="col-xl-1"></div>
            </div>
          </div>
        </div>
      </BrowserRouter>

    )
  }
}

function mapStateToProps({prefs}) {
  return {prefs}
}

export default connect(mapStateToProps, {getTalentDic, getHOTSDictionary, updatePreferences, getMainData, rollbackState})(App)
