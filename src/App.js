import React, { Component } from 'react'
import './App.css'
import { connect } from 'react-redux'
import { getHOTSDictionary, updatePreferences, getMainData, rollbackState } from './actions'
import { BrowserRouter, Route, Switch } from 'react-router-dom'
import OverallTable from './containers/overall_table'
import HeroPage from './containers/hero_page'
import NavigationBar from './containers/navigation'

class App extends Component {
  componentDidMount() {
    this.props.getHOTSDictionary()
    this.props.getMainData(this.props.prefs)
    console.log(window.location)
  }
  render() {
    return (
      <div>
        <NavigationBar />
        <div className="container-fluid" >
          <div className="row">
            <div className="col-lg-1 col-xl-2"></div>
            <div className="col-sm-12 col-lg-10 col-xl-8" id="contentHolder">
              <BrowserRouter>
                <Switch>
                  <Route path="/heroes" component={HeroPage} />
                  <Route path="/" component={OverallTable} />
                </Switch>
              </BrowserRouter>
            </div>
            <div className="col-lg-1 col-xl-2"></div>
          </div>
        </div>
      </div>
    )
  }
}

function mapStateToProps({HOTS, roles, franchises, prefs, status}) {
  return {HOTS, roles, franchises, prefs, status}
}

export default connect(mapStateToProps, {getHOTSDictionary, updatePreferences, getMainData, rollbackState})(App)
