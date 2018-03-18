const { BrowserWindow, ipcMain } = require('electron')
const url = require('url')
const path = require('path')
const options = require('../optionsMenu/optionsManager.js').options
const windowStateKeeper = require('electron-window-state')
let previewWindow = {window:null}
const minWidth = 700
const minHeight = 755

const togglePreviewWindow = () => {
  if (previewWindow.window.isVisible()) previewWindow.window.hide()
  else previewWindow.window.show()
}

function loadPreviewWindow() {
  let winState = windowStateKeeper({defaultWidth: minWidth, defaultHeight: minHeight, file: 'previewWindowState.json'})
  previewWindow.window = new BrowserWindow({minWidth, minHeight, width: winState.width, height: winState.height, x: winState.x, y: winState.y, resizable: true, show:false, frame: false})
  previewWindow.window.windowID = "preview"
  previewWindow.window.on('close', function(event) {
    console.log(global['quitting'])
    if (global['quitting']) {
      console.log('quitting...')
      return
    }
    event.preventDefault()
    togglePreviewWindow()
  })
  const location = process.env.ELECTRON_START_URL ? process.env.ELECTRON_START_URL + '/preview' : undefined
  const fullPath = path.join(__dirname.split('electron')[0], 'index.html')
  console.log('__dirname',__dirname, fullPath,url.format({pathname: fullPath,protocol: 'file:', slashes: true}))
  previewWindow.window.loadURL(location || url.format({
    pathname: fullPath,
    protocol: 'file:',
    slashes: true
  }))
  previewWindow.window.once('ready-to-show', async() => {
    ipcMain.on('ferryPreviewPlayerInfo', (e,results) => {
      previewWindow.window.webContents.send('ferryPreviewPlayerInfo',{results,handles:options.handles,bnetIDs:options.bnetIDs})
      if (!previewWindow.window.isVisible() && options.prefs.previews.value) previewWindow.window.show()
      previewWindow.window.focus()
    })
    ipcMain.on('preview:toggle', nothing => {
      togglePreviewWindow()
    })
  })
}

exports.loadPreviewWindow = loadPreviewWindow
exports.previewWindow = previewWindow
