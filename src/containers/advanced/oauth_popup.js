import React from 'react'

export default class OauthPopup extends React.Component {
  constructor(props) {
    super(props)
    this.createPopup = this.createPopup.bind(this)
  }
  createPopup() {
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

  render() {
    return <div onClick={this.createPopup}> {this.props.children} </div>
  }

  componentWillUnmount() {
    if (this.externalWindow) {
      this.externalWindow.close()
    }
  }
}
