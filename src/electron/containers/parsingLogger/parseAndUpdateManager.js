const fs = require('fs')
const path = require('path')
const url = require('url')
const { app, BrowserWindow } = require('electron')
const windowStateKeeper = require('electron-window-state')
const parserPopup = {
  saveInfo:{files:{},Count:0,fileNames:{}},
  parserWindow:null
}
global['parserPopup'] = parserPopup

const dataPath = app.getPath('userData')
const parsedPath = path.join(dataPath,'parsed.json')
const backupParsedPath = path.join(dataPath,'parsedBackup.json')

const loadSaveInfo = function() {
  console.log('load save info called')
  if (fs.existsSync(parsedPath)) {
    try {
      parserPopup.saveInfo = JSON.parse(fs.readFileSync(parsedPath))
    } catch (e) {
      if (fs.existsSync(backupParsedPath)) {
        try {
          parserPopup.saveInfo = JSON.parse(fs.readFileSync(parsedPath))
        } catch (e) {
          parserPopup.saveInfo = {files:{},fileNames:{},Count:0}
        }
      } else parserPopup.saveInfo = {files:{},fileNames:{},Count:0}
    }
    Object.keys(parserPopup.saveInfo.files).map(x => {
      const filePath = parserPopup.saveInfo.files[x].filePath
      if (!parserPopup.saveInfo.fileNames.hasOwnProperty(filePath)) {
        parserPopup.saveInfo.fileNames[filePath] = x
      }
    })
    console.log(Object.keys(parserPopup.saveInfo.files).length,Object.keys(parserPopup.saveInfo.fileNames).length)
  }
}
loadSaveInfo()

const saveSaveInfo = function() {
  console.log('Saving parsed info...')
  fs.writeFileSync(parsedPath,JSON.stringify(parserPopup.saveInfo), 'utf8', {flag: 'w'}, (err) => { if (err) console.log(err) })
  fs.writeFileSync(backupParsedPath,JSON.stringify(parserPopup.saveInfo), 'utf8', {flag: 'w'}, (err) => { if (err) console.log(err) })
}
// function makeParsingWindow()

const updateParsingMenu = (files) => {
  if (parserPopup.parserWindow) parserPopup.parserWindow.webContents.send('parsing',files)
}

function showParsingMenu(mainWindow) {
  let winState = windowStateKeeper({defaultWidth: 300, defaultHeight: 600, file: 'parserWindowState.json'})
  parserPopup.parserWindow = new BrowserWindow({minWidth: 495, minHeight: 300, width: winState.width, height: winState.height, x: winState.x, y: winState.y, show:false, frame: false})
  winState.manage(parserPopup.parserWindow)
  parserPopup.parserWindow.on('closed', (e) => { parserPopup.parserWindow = null })
  const location = process.env.ELECTRON_START_URL ? process.env.ELECTRON_START_URL + '/parser' : undefined
  parserPopup.parserWindow.loadURL(location || url.format({
    pathname: path.join(__dirname, '/../build/index.html/parser'),
    protocol: 'file:',
    slashes: true
  }))
}

exports.saveSaveInfo = saveSaveInfo
exports.parserPopup = parserPopup
exports.showParsingMenu = showParsingMenu
exports.updateParsingMenu = updateParsingMenu
