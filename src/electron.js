const { HOTSPromise } = require('./electron/startup.js')
const chokidar = require('chokidar')
const electron = require('electron')
const fs = require('fs')
const path = require('path')
const url = require('url')
const { app, BrowserWindow, Menu, Tray, ipcMain } = electron
const windowStateKeeper = require('electron-window-state')
const { parseNewReplays } = require('./electron/parser/parsingManager.js')
const dataPath = app.getPath('userData')
const replaysFolder = path.join(dataPath,'replaySummaries')
const { showParsingMenu, parserPopup, saveSaveInfo } = require('./electron/containers/parsingLogger/parseAndUpdateManager.js')
const { options, optionsPopup, loadOptionsMenu, addNewAccount } = require('./electron/containers/optionsMenu/optionsManager.js')
require('electron-context-menu')()
require('electron-reload')(__dirname, { electron: require('${__dirname}/../../node_modules/electron') })

ipcMain.on('parser:toggle',(e,args) => {
  if (parserPopup.parserWindow.isVisible()) parserPopup.parserWindow.hide()
  else {
    parserPopup.parserWindow.webContents.send('parsing',parserPopup.saveInfo.files)
    parserPopup.parserWindow.show()
  }
})
ipcMain.on('options:toggle',(e,args) => {
  if (optionsPopup.window.isVisible()) optionsPopup.window.hide()
  else {
    optionsPopup.window.webContents.send('options',options)
    optionsPopup.window.show()
  }
})
ipcMain.on('request:replay',(e,MSL) => {
  fs.readFile(path.join(path.join(dataPath,'replays',`${MSL}.json`)), (e,replay) => {
    if (e) return console.log(e)
    mainWindow.webContents.send('send:replay',JSON.parse(replay))
  })
})

process.on('dispatchReplay', replay => {
  mainWindow.webContents.send('replays:dispatch',[replay])
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
  mainWindow = new BrowserWindow({width: winState.width, height: winState.height, x: winState.x, y: winState.y, minWidth: 825, minHeight: 480, frame: false, standardWindow: false, show: false})
  mainWindow.once('ready-to-show', () => { mainWindow.show() })
  winState.manage(mainWindow)
  const startUrl = process.env.ELECTRON_START_URL || url.format({
    pathname: path.join(__dirname, '/../build/index.html'),
    protocol: 'file:',
    slashes: true
  })
  mainWindow.loadURL(startUrl)
  showParsingMenu()
  loadOptionsMenu()

  // The below, interrupting other window shutdowns with hides, has to be done in the main process HERE.  Otherwise, it will be called asynchronously (after the window has closed)
  for (let w=0;w<2;w++) {
    let window = [parserPopup.parserWindow,optionsPopup.window][w]
    window.on('close', function(event) {
      event.preventDefault()
      if (window.isVisible()) window.hide()
      else window.show()
    })
  }

  mainWindow.webContents.on('did-finish-load', async() => {
    if (fs.existsSync(replaysFolder)) {
      const replayPaths = fs.readdirSync(replaysFolder)
      const nReps = replayPaths.length
      for (let r=0;r<nReps;r++) {
        const repPath = path.join(replaysFolder,replayPaths[r])
        fs.readFile(repPath, (e,replay) => {
          if (e) return console.log(e)
          try {
            mainWindow.webContents.send('replays:dispatch',[JSON.parse(replay)])
          } catch (e) {
            console.log(e)
          }
        })
      }
    }
    if (options.accounts.length) {
      options.accounts.forEach(account => {
        const { replayPath, bnetID, region, handle, renameFiles } = account
        mainWindow.webContents.send('playerInfo:dispatch',{bnetID, region, handle})
        const watcher = chokidar.watch(replayPath, {
          ignored: /(^|[\/\\])\../,
          persistent: true
        })
        watcher.on('ready', () => watcher.on('add', path => {
          if (!parserPopup.saveInfo.fileNames.hasOwnProperty(path)) {
            setTimeout(() => {
              process.emit('addSingleReplay', {rPath:path, bnetID, renameFiles})
            },500) // after half a second, send file info to parser.  should be enough time
          }
        }))
        parseNewReplays(account,true)
      })
      // call parser and do normal startup stuff
    } else await addNewAccount()
  })
  createTray()
  Menu.setApplicationMenu(mainMenu)
  mainWindow.on('closed', function() {
    console.log('closing main window...')
    // Dereference the window object, usually you would store windows in an array if your app supports multi windows
    saveSaveInfo()
    mainWindow = null
    tray.destroy()
    parserPopup.parserWindow.destroy()
    // need to shutdown uploader and parsers, too...
    app.quit()
    process.exit(0)
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
