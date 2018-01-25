import React, { Component } from 'react'
import { connect } from 'react-redux'
import SearchBar from '../components/search_bar'
import BrightButton from '../components/bright_button'
import { updatePreferences } from '../actions'
import axios from 'axios'

class YourPage extends Component {
  constructor(props) {
    super(props)
    this.state = {player:null, message: 'Please enter your player handle'}
    this.updatePlayer = this.updatePlayer.bind(this)
    this.setNewPlayer = this.setNewPlayer.bind(this)
  }
  componentDidMount() {
    const bnetID = this.props.prefs.bnetID
    if (bnetID) {
      this.props.history.push(`/players/${bnetID}`)
    }
  }
  updatePlayer(player) {
    this.setState({...this.state, player})
  }
  async setNewPlayer() {
    if (this.state.player) {
      console.log('Should be trying to get', this.state.player)
      let playerInfo = await axios.get(`https://heroes.report/search/player/${this.state.player.replace('#','_')}`)
      const bnetID = playerInfo.data.bnetID
      if (!bnetID) {
        this.setState({...this.state,message: 'Could not find that handle.  Check it and try again.'})
      } else {
        this.props.updatePreferences('bnetID',bnetID)
        this.props.history.push(`/players/${bnetID}`)
      }
    }
  }
  render() {
    const styles = {
      container: { marginRight: 'auto', marginLeft: 'auto' },
      search: { width: '80%', 'maxWidth': 'None', margin: "0% 10%", textAlign: "center" },
      submit: { margin: '7%', textAlign: "center" }
    }
    return (
      <div className="overall">
        <div className="container-fluid col-12 col-md-10 col-lg-8">
          <div className='stat_item_container row'>
            <div className='statItem col-12 col-sm-6' style={styles.container} >
              <div className='statBarHolder statBarTitle'>
                {this.state.message}
              </div>
              <SearchBar placeholder="YourPlayerHandle#1234" onSearchTermChange={this.updatePlayer} style={styles.search}/>
              <BrightButton
                link={'/you'}
                name={'Get and save my stats!'}
                style={ styles.submit }
                clickFunction={this.setNewPlayer}
              />
            </div>
          </div>
        </div>
      </div>
    )
  }
}

function mapStateToProps({prefs}, ownProps) {
  return {prefs}
}

export default connect(mapStateToProps,{updatePreferences})(YourPage)
