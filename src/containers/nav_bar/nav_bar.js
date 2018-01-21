import React, { Component } from 'react'
import FilterDropDown from '../../containers/filter_drop_down'
import { renderNothing, renderTinyHero } from '../../components/filterComponents'
import SearchBar from '../../components/search_bar'
import { connect } from 'react-redux'
import { updatePreferences, getMainData, dispatchPlayerSearch } from '../../actions'
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
  }
  playerSearch(player) {
    console.log(`Searching for ${player}...`)
    this.props.dispatchPlayerSearch(player)
    if (player==='') {
      this.props.history.push('/')
    } else {
      this.props.history.push(`/playerlist/${player}`)
    }

  }
  render() {
    const playerSearch = _.debounce((term) => { this.playerSearch(term) }, 500)
    return (
      <div className="d-flex">
        <ul className="list-inline mx-auto justify-content-center">
          <li className="nav-item list-inline-item">
            <NavLink
              to=""
              exact className="nav-link"
              activeClassName="active"
              isActive={linkFunction}
            >Stats</NavLink>
          </li>
          <FilterDropDown
            currentSelection="Heroes"
            buttonLabel='Heroes'
            name=''
            id='gameMap'
            dropdowns={this.props.HOTS.sortedHeroes ? this.props.HOTS.sortedHeroes : []}
            updateFunction={unpackTalents}
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

export default withRouter(connect(mapStateToProps, {updatePreferences, dispatchPlayerSearch, getMainData})(Nav))
