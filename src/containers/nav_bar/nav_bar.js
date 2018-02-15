import React, { Component } from 'react'
import FilterDropDown from '../../containers/filter_drop_down'
import { renderNothing, renderTinyHero } from '../../components/filterComponents'
import SearchBar from '../../components/search_bar'
import { connect } from 'react-redux'
import { updatePreferences, selectTalent, getMainData, dispatchPlayerSearch, getHeroTalents, getTimedData, addHeroFilter } from '../../actions'
import { NavLink, withRouter } from 'react-router-dom'
import _ from 'lodash'
import unpackTalents from '../../helpers/unpack_talents'

const linkFunction= (match, location) => {
  return match && match.isExact
}
class Nav extends React.Component {
  constructor(props) {
    super(props)
    this.playerSearch = this.playerSearch.bind(this)
    this.updateHero = this.updateHero.bind(this)
    this.state = { curHero: null }
  }
  updateHero(newHero) {
    this.props.updatePreferences('hero', newHero)
    this.props.selectTalent('reset')
    if (this.props.history.location.pathname.includes('heroes')) {
      this.props.getHeroTalents(newHero,this.props.prefs)
      this.props.getTimedData(this.props.prefs,newHero)
    }
    this.setState({curHero: newHero})
    newHero = window.HOTS.nHeroes[newHero]
    this.props.history.push(`/heroes/${newHero}`)
  }
  playerSearch(player) {
    this.props.dispatchPlayerSearch(player)
    if (player==='') {
      this.props.history.push('/')
    } else {
      this.props.history.push(`/playerlist/${player}`)
    }
    this.setState({curHero: null})
  }
  render() {
    const playerSearch = _.debounce((term) => {
      this.playerSearch(term)
    }, 500)
    return (
      <div className="d-flex">
        <ul className="list-inline mx-auto justify-content-center">
          <li className="nav-item list-inline-item">
            <NavLink
              to=""
              exact className="nav-link"
              activeClassName="active"
              isActive={linkFunction}
              onClick={() => this.setState({curHero: null})}
            >Stats</NavLink>
          </li>
          <FilterDropDown
            currentSelection="Heroes"
            buttonLabel={this.state.curHero ? renderTinyHero(this.state.curHero) : 'Heroes'}
            name=''
            id='gameMap'
            dropdowns={this.props.HOTS.sortedHeroes ? this.props.HOTS.sortedHeroes : []}
            updateFunction={this.updateHero}
            leftComponentRenderer={renderTinyHero}
            rightComponentRenderer={renderNothing}
            renderDropdownName={true}
            containerClass='heroDropDown'
            currentID={99}
          />
          <a className="navbar-brand" id="brand">
            <img src="/tinyLogo.png" width="123" height="40" className="d-inline-block align-top-middle" alt="" />
          </a>
          <li className="nav-item list-inline-item">
            <NavLink
              to="/you"
              exact className="nav-link"
              activeClassName="active"
              isActive={linkFunction}
              onClick={() => {
                // RESET ALL HEROES
                this.props.addHeroFilter(0, 'A')
                this.props.addHeroFilter(1, 'A')
                this.props.addHeroFilter(2, 'A')
                this.setState({curHero: null})}
              }
            >You</NavLink>
          </li>
          <li className="searchBar nav-item list-inline-item">
            <SearchBar placeholder="player#1234" onSearchTermChange={playerSearch}/>
          </li>
        </ul>
      </div>
    )
  }
}

function mapStateToProps({HOTS, prefs}, ownProps) {
  return {...ownProps, HOTS, prefs}
}

export default withRouter(connect(mapStateToProps, { updatePreferences, dispatchPlayerSearch, getMainData, selectTalent, getHeroTalents, getTimedData, addHeroFilter })(Nav))
