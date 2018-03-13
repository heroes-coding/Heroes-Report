const { BrowserWindow, ipcMain } = require('electron')
const url = require('url')
const path = require('path')
const options = require('../optionsMenu/optionsManager.js').options
const windowStateKeeper = require('electron-window-state')
let previewWindow
const minWidth = 700
const minHeight = 755

const togglePreviewWindow = () => {
  if (previewWindow.isVisible()) previewWindow.hide()
  else previewWindow.show()
}

function loadPreviewWindow() {
  let winState = windowStateKeeper({defaultWidth: minWidth, defaultHeight: minHeight, file: 'previewWindowState.json'})
  previewWindow = new BrowserWindow({minWidth, minHeight, width: winState.width, height: winState.height, x: winState.x, y: winState.y, resizable: true, show:false, frame: false})
  previewWindow.on('close', function(event) {
    event.preventDefault()
    togglePreviewWindow()
  })
  const location = process.env.ELECTRON_START_URL ? process.env.ELECTRON_START_URL + '/preview' : undefined
  previewWindow.loadURL(location || url.format({
    pathname: path.join(__dirname, '/../build/index.html/preview'),
    protocol: 'file:',
    slashes: true
  }))
  previewWindow.once('ready-to-show', async() => {
    ipcMain.on('ferryPreviewPlayerInfo', (e,results) => {
      previewWindow.webContents.send('ferryPreviewPlayerInfo',{results,handles:options.handles,bnetIDs:options.bnetIDs})
      if (!previewWindow.isVisible() && options.prefs.previews.value) previewWindow.show()
      previewWindow.focus()
    })
    ipcMain.on('preview:toggle', nothing => {
      togglePreviewWindow()
    })
  })
}

exports.loadPreviewWindow = loadPreviewWindow
