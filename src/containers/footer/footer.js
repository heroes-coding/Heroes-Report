import React from 'react'
import { connect } from 'react-redux'
import { NavLink, withRouter } from 'react-router-dom'

const linkFunction= (match, location) => {
  return match && match.isExact
}
class Footer extends React.Component {
  render() {
    return (
      <div className="d-flex footer">
        <ul className="list-inline mx-auto justify-content-center">
          <li className="nav-item list-inline-item">
            <NavLink
              to="/about"
              exact className="nav-link"
              activeClassName="active"
              isActive={linkFunction}
            >About</NavLink>
          </li>
          <li className="nav-item list-inline-item">
            <NavLink
              to="/features"
              exact className="nav-link"
              activeClassName="active"
              isActive={linkFunction}
            >Features</NavLink>
          </li>
          <li className="nav-item list-inline-item">
            <NavLink
              to="/disclaimer"
              exact className="nav-link"
              activeClassName="active"
              isActive={linkFunction}
            >Disclaimer</NavLink>
          </li>
        </ul>
      </div>
    )
  }
}

function mapStateToProps(state, ownProps) {
  return ownProps
}

export default withRouter(connect(mapStateToProps)(Footer))
