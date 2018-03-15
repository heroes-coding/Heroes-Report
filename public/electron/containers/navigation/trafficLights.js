import React, { Component } from 'react'

class TrafficLights extends Component {
  render() {
    const win = this.props.window
    const { noClose, noMax, noMin } = this.props
    return (
      <div className="trafficLightBox">
        {!noClose &&<i className="fa fa-window-close closeBox"
          onClick={() => win.close()} />}
        {!noMax&&<i className="fa fa-window-maximize maximizeBox"
          onClick={() => win.isMaximized() ? win.unmaximize() : win.maximize()} />}
        {!noMin&&<i className="fa fa-window-minimize minimizeBox"
          onClick={() => win.minimize()} />}
      </div>
    )
  }
}

export default TrafficLights
