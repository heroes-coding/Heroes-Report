const { showAccountSelection, HOTSPromise } = require('./electron/startup.js')
const electron = require('electron')
const path = require('path')
const url = require('url')
const { app, BrowserWindow, Menu, Tray, ipcMain } = electron
const windowStateKeeper = require('electron-window-state')
const { parseNewReplays } = require('./electron/parser/parsingManager.js')
const { showParsingMenu, parserPopup } = require('./electron/containers/parsingLogger/parseAndUpdateManager.js')
require('electron-context-menu')()
require('electron-reload')(__dirname, { electron: require('${__dirname}/../../node_modules/electron') })
const { userOptions, saveOptions } = require('./electron/helpers/config')


ipcMain.on('parser',(e,args) => {
  if (parserPopup.parserWindow) parserPopup.parserWindow.close()
  else showParsingMenu()
})

let tray
function createTray() {
  tray = new Tray('tinyTray.png')
  tray.setToolTip('Heroes Report Replay Analyzer')
  const trayMenu = Menu.buildFromTemplate([
    {label: 'Tray Menu Item'},
    {role: 'quit'}
  ])
  tray.setContextMenu(trayMenu)
}
let mainMenu = Menu.buildFromTemplate(require('./electron/menuTemplate'))
let mainWindow // Keep a global reference of the window object OR GC
// console.log(process.getProcessMemoryInfo())

function createWindow() {
  let winState = windowStateKeeper({defaultWidth: 1200, defaultHeight: 600})
  mainWindow = new BrowserWindow({width: winState.width, height: winState.height, x: winState.x, y: winState.y, minWidth: 825, minHeight: 400, frame: false, standardWindow: false })
  winState.manage(mainWindow)
  const startUrl = process.env.ELECTRON_START_URL || url.format({
    pathname: path.join(__dirname, '/../build/index.html'),
    protocol: 'file:',
    slashes: true
  })
  mainWindow.loadURL(startUrl)
  showParsingMenu()

  // The below has to be done in the main process HERE.  Otherwise, it will be called asynchronously (after the window has closed)
  parserPopup.parserWindow.on('close', function(event) {
    event.preventDefault()
    console.log('preventing close from main process!')
    if (parserPopup.parserWindow.isVisible()) parserPopup.parserWindow.hide()
    else parserPopup.parserWindow.show()
  })
  mainWindow.webContents.on('did-finish-load', async() => {
    // mainWindow.webContents.send('private','Message from Main Process to MainWindow')
    let account
    account = await showAccountSelection()
    console.log(account)
    if (account) HOTSPromise.then(HOTS => { parseNewReplays(account,HOTS) })
  })
  createTray()
  Menu.setApplicationMenu(mainMenu)
  mainWindow.on('closed', function() {
    // Dereference the window object, usually you would store windows in an array if your app supports multi windows
    mainWindow = null
    tray.destroy()
    parserPopup.parserWindow.destroy()
    app.quit()
  })
}

// This method will be called when Electron has finished initialization and is ready to create browser windows.
app.on('ready', () => {
  createWindow()
})

app.on('window-all-closed', function() {
  // On OS X it is common for applications and their menu bar to not quit without CMD+Q
  if (process.platform !== 'darwin') { app.quit() }
})

app.on('activate', function() {
  // re-create a window in OSX when the dock icon is clicked and there are no other windows open.
  if (mainWindow === null) { createWindow() }
})
