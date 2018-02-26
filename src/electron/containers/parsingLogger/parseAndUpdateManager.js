const fs = require('fs')
const path = require('path')
const url = require('url')
const { app, BrowserWindow } = require('electron')
const windowStateKeeper = require('electron-window-state')
const parserPopup = {
  saveInfo:{files:{},Count:0},
  parserWindow:null
}
global['parserPopup'] = parserPopup

const dataPath = app.getPath('userData')
const parsedPath = path.join(dataPath,'parsed.json')

if (fs.existsSync(parsedPath)) parserPopup.saveInfo = JSON.parse(fs.readFileSync(parsedPath))

// function makeParsingWindow()

const updateParsingMenu = (files) => { if(parserPopup.parserWindow) parserPopup.parserWindow.webContents.send('parsing',files) }

function showParsingMenu(mainWindow) {
  let winState = windowStateKeeper({defaultWidth: 300, defaultHeight: 600, file: 'parserWindowState.json'})
  parserPopup.parserWindow = new BrowserWindow({minWidth: 580, minHeight: 300, width: winState.width, height: winState.height, x: winState.x, y: winState.y, show:false, frame: false})
  winState.manage(parserPopup.parserWindow)
  parserPopup.parserWindow.once('ready-to-show', () => {
    parserPopup.parserWindow.webContents.send('parsing',parserPopup.saveInfo.files)
    parserPopup.parserWindow.show()
  })
  /*
  closeEvent = parserPopup.parserWindow.onbeforeunload = function(e) {
    e.returnValue = false
    console.log('just hiding!')
    parserPopup.parserWindow.hide()
  }
  */
  parserPopup.parserWindow.on('closed', (e) => { parserPopup.parserWindow = null })
  const location = process.env.ELECTRON_START_URL ? process.env.ELECTRON_START_URL + '/parser' : undefined
  parserPopup.parserWindow.loadURL(location || url.format({
    pathname: path.join(__dirname, '/../build/index.html/parser'),
    protocol: 'file:',
    slashes: true
  }))
}

exports.parserPopup = parserPopup
exports.showParsingMenu = showParsingMenu
exports.updateParsingMenu = updateParsingMenu
