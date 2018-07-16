import React from 'react'
import ToggleButton from '../../components/toggle_button'
import { updateToken } from '../../actions'
import { connect } from 'react-redux'

class OAuthPopup extends React.Component {
  constructor(props) {
    super(props)
    this.login = this.login.bind(this)
    this.logout = this.logout.bind(this)
  }
  login() {
    const width = 500
    const height = 800
    const url = "https://heroes.report/auth"
    const title = "Heroes Report"
    const left = window.screenX + (window.outerWidth - width) / 2
    const top = window.screenY + (window.outerHeight - height) / 2.5
    this.externalWindow = window.open(
      url,
      title,
      `width=${width},height=${height},left=${left},top=${top}`
    )
  }
  logout() {
    this.props.updateToken({id:"", temppassword:"", vip: "false"})
  }

  render() {
    const loggedIn = this.props.loggedIn
    return (
      <ToggleButton
        toggleText={loggedIn ? 'Logout ' : 'VIP Login '}
        toggleFunction={loggedIn ? this.logout : this.login }
        active = {loggedIn}
        containerClass='loginButton'
        info='This is the login for VIP Patreon donors.  It allows getting data from more than the last seven plus days'
        activeIcon={<i className="fa fa-sign-in" aria-hidden="true"></i>}
        inactiveIcon={<i className="fa fa-sign-out" aria-hidden="true"></i>}
      />
    )
  }

  componentWillUnmount() {
    if (this.externalWindow) {
      this.externalWindow.close()
    }
  }
}

function mapStateToProps(state, ownProps) {
  return {ownProps}
}

export default connect(mapStateToProps, {updateToken})(OAuthPopup)
