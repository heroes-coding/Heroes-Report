import React, { Component } from 'react'
let ipcRenderer
if (window.isElectron) ipcRenderer = window.require('electron').ipcRenderer

class ElectronMenu extends Component {
  render() {
    return (
      <div className="menuBox">
        <i className="fa fa-users previewBox"
          title="Most recent preview"
          onClick={() => { ipcRenderer.send('preview:toggle','toggle') }}
        />
        <i className="fa fa-cloud-upload parserBox"
          title="Upload and parsing status"
          onClick={() => { ipcRenderer.send('parser:toggle','toggle') }}
        />
        <i className="fa fa-cog maximizeBox"
          title="Options menu"
          onClick={() => { ipcRenderer.send('options:toggle','toggle') }}
        />
      </div>
    )
  }
}

export default ElectronMenu
