import React, { Component } from 'react'
let ipcRenderer
if (window.isElectron) ipcRenderer = window.require('electron').ipcRenderer

class ElectronMenu extends Component {
  render() {
    return (
      <div className="menuBox">
        <i className="fa fa-cloud-upload parserBox"
          onClick={() => ipcRenderer.send('parser','toggle')} />
        <i className="fa fa-cog maximizeBox"
          onClick={() => console.log('options?')} />
      </div>
    )
  }
}

export default ElectronMenu
