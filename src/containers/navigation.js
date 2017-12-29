import React, { Component } from 'react'
import BrightButton from '../components/bright_button'
import { connect } from 'react-redux'
import { renderNothing, renderCogs } from '../components/filterComponents'
import FilterDropDown from '../containers/filter_drop_down'

class Navigation extends Component {
  render() {
    return (
      <nav className="navbar fixed-to navbar-toggleable-sm navbar-inverse bg-faded main-nav" id="navbar">
        <button className="navbar-toggler navbar-toggler-left" type="button" data-toggle="collapse" data-target=".navbar-collapse" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
          <span className="navbar-toggler-icon"></span>
        </button>
        <a className="navbar-brand mx-auto" id="brand">
          <img src="tinyLogo.png" width="123" height="40" className="d-inline-block align-top-middle" alt="" />
        </a>
        <ul className="navbar-nav mx-auto" id="leftNav">
          <BrightButton name="Overall" clickFunction={() => { console.log('overall') }} />
        </ul>
        <ul className="navbar-nav ml-auto" id="rightNav">
          <BrightButton name="Heroes" clickFunction={() => {}} />
        </ul>
      </nav>
    )
  }
}

function mapStateToProps({roles, franchises, statCat}) {
  return {roles, franchises, statCat}
}

export default connect(mapStateToProps)(Navigation)

/*
<div class="navbar-collapse collapse container">

    <ul class="navbar-nav mx-auto" id="leftNav">
      <li class="nav-item active text-center">
        <a class="nav-link navMenuText" href="/">Overall Stats</a>
      </li>
      <li class="nav-item text-center dropdown">
        <a class="nav-link mx-auto navMenuText dropdown-toggle" data-toggle="dropdown" role="button" aria-haspopup="true" aria-expanded="false" id="heroLinksO">Heroes</a>
        <div class="dropdown-menu" id="heroSelectO">
        </div>
      </li>
      <li class="nav-item text-center">
        <a class="nav-link navMenuText" href="/about">About</a>
      </li>
    </ul>
    <ul class="navbar-nav ml-auto" id="rightNav">
      <li class="nav-item text-center d-none d-lg-block" id="yourReplaysLink">
        <a class="nav-link navMenuText d-none d-lg-block" href="replays">Your Replays</a>
      </li>
      <li class="nav-item text-center">
        <a class="nav-link navMenuText" href="https://patreon.com/heroesreport">Patreon Link</a>
      </li>

    </ul>

</div>
*/

/*
<FilterDropDown
  currentSelection={this.props.statCat.cat}
  name='Stat Type: '
  id='statType'
  dropdowns={statCatChoices}
  updateFunction={this.props.updateStatCat}
  leftComponentRenderer={renderCogs}
  rightComponentRenderer={renderNothing}
  renderDropdownName={true}
  currentID={this.props.statCat.cat}
/>
*/
