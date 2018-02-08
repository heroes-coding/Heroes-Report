import React, { Component } from 'react'
import { connect } from 'react-redux'
import Storage from './helpers/storage'
import { getHOTSDictionary, updatePreferences, rollbackState, getTalentDic } from './actions'
import { BrowserRouter, Route, Switch } from 'react-router-dom'
import DataTable from './containers/table/data_table'
import HeroPage from './containers/heroPage/hero_page'
import NavigationBar from './containers/nav_bar/nav_bar'
import Footer from './containers/footer/footer'
import PlayerPage from './containers/player_page'
import PlayerList from './containers/player_list/player_list'
import YourPage from './containers/your_page'
import getReplayBinary from './helpers/binary_replay_unpacker'
import Markdown from './containers/markdown_display'
import featuresPath from './md/features.md'
import aboutPath from './md/about.md'
import disclaimerPath from './md/disclaimer.md'

const Features = () => <Markdown path={featuresPath} />
const About = () => <Markdown path={aboutPath} />
const Disclaimer = () => <Markdown path={disclaimerPath} />

class App extends Component {
  componentDidMount() {
    this.props.getHOTSDictionary()
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
                  <Route path="/features" component={Features} />
                  <Route path="/about" component={About} />
                  <Route path="/disclaimer" component={Disclaimer} />
                  <Route path="/" component={DataTable} />
                </Switch>
              </div>
              <div className="col-xl-1"></div>
            </div>
          </div>
          <Footer />
        </div>
      </BrowserRouter>

    )
  }
}

function mapStateToProps({prefs}) {
  return {prefs}
}

export default connect(mapStateToProps, {getTalentDic, getHOTSDictionary, rollbackState})(App)
