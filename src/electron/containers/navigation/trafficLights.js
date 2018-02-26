import React, { Component } from 'react'

class TrafficLights extends Component {
  render() {
    const win = this.props.window
    return (
      <div className="trafficLightBox">
        <i className="fa fa-window-close closeBox"
          onClick={() => win.close()} />
        <i className="fa fa-window-maximize maximizeBox"
          onClick={() => win.isMaximized() ? win.unmaximize() : win.maximize()} />
        <i className="fa fa-window-minimize minimizeBox"
          onClick={() => win.minimize()} />
      </div>
    )
  }
}

export default TrafficLights
