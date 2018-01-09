import React, { Component } from 'react'
import { connect } from 'react-redux'
import { getHOTSDictionary, updatePreferences, getMainData, getPlayerData, rollbackState, getTalentDic } from './actions'
import { BrowserRouter, Route, Switch } from 'react-router-dom'
import DataTable from './containers/table/data_table'
import HeroPage from './containers/hero_page'
import NavigationBar from './containers/navigation'
import PlayerPage from './containers/player_page'

class App extends Component {
  componentDidMount() {
    this.props.getHOTSDictionary()
    this.props.getMainData(this.props.prefs)
    this.props.getPlayerData(4428564)
    this.props.getTalentDic()
    console.log(window.location)
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
                  <Route path="/players" component={PlayerPage} />
                  <Route path="/heroes/:id" component={HeroPage} />
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

export default connect(mapStateToProps, {getTalentDic, getHOTSDictionary, updatePreferences, getMainData, rollbackState, getPlayerData})(App)
