const { HOTSPromise } = require('./electron/startup.js')
const chokidar = require('chokidar')
const electron = require('electron')
const fs = require('fs')
const path = require('path')
const url = require('url')
const { app, BrowserWindow, Menu, Tray, ipcMain } = electron
const windowStateKeeper = require('electron-window-state')
const importReplays = require('./electron/importReplays').openReplays
const { fork } = require('child_process')
const { parseNewReplays } = require('./electron/parser/parsingManager.js')
const dataPath = app.getPath('userData')
const replaysFolder = path.join(dataPath,'replaySummaries')
const { showParsingMenu, parserPopup, saveSaveInfo } = require('./electron/containers/parsingLogger/parseAndUpdateManager.js')
const { options, optionsPopup, loadOptionsMenu, addNewAccount } = require('./electron/containers/optionsMenu/optionsManager.js')
const { loadPreviewWindow }= require('./electron/containers/preview/previewManager.js')
const { returnIDs } = require('./electron/parser/bareLobby.js')
console.log(returnIDs)
require('electron-context-menu')()
require('electron-reload')(__dirname, { electron: require('${__dirname}/../../node_modules/electron') })

process.on('dispatchSingleReplay', replay => {
  mainWindow.webContents.send('dispatchSingleReplay',replay)
})

ipcMain.on('parser:toggle',(e,args) => {
  if (parserPopup.parserWindow.isVisible()) parserPopup.parserWindow.hide()
  else {
    parserPopup.parserWindow.webContents.send('parsing',parserPopup.saveInfo.files)
    parserPopup.parserWindow.show()
  }
})

ipcMain.on('loadPlayer',(e,playerID) => {
  mainWindow.webContents.send('loadPlayer', playerID)
  mainWindow.focus()
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

process.on('dispatchReplays', replays => {
  mainWindow.webContents.send('replays:dispatch',replays)
})
process.on('newaccount:send', ({bnetID, region, handle}) => {
  mainWindow.webContents.send('playerInfo:dispatch',{bnetIDs:options.bnetIDs, handles:options.handles, regions: options.regions})

})
process.on('replays:refresh', nothing => {
  console.log('replays:refresh called')
  setTimeout(() => { mainWindow.webContents.send('replays:finishedSending',null) },250)
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

const battleLobbyResults = { handles:
   [ 'MaxPower',
     'HappyPants',
     'Zero',
     'Iamsquirtle',
     'Demian',
     'baobabe',
     'Pochiking',
     'MightyBeast',
     'Chasanak',
     'ElRickJames' ],
  teamNumbers: [ 0, 1, 1, 0, 0, 0, 1, 1, 0, 0 ],
  battleTags:
   [ '1348',
     '1918',
     '14616',
     '1203',
     '1705',
     '1685',
     '1909',
     '17660',
     '1357',
     '1854' ] }


const monitorForLobby = function() {
  // This is for testing purposes only.  Delete it when everything is ready.
  setTimeout(() => { mainWindow.webContents.send('getPreviewPlayerInfo',battleLobbyResults) }, 2000)
  // main window is already loaded when calling this function
  const tempPath = path.join(app.getPath('temp'),'Heroes of the Storm')
  const watcher = chokidar.watch(tempPath, {
    ignored: /(^|[\/\\])\../,
    persistent: true
  })
  watcher.on('ready', () => watcher.on('add', path => {
    console.log(path)
    if (path.includes('replay.server.battlelobby')) {
      setTimeout(async() => {
        console.log(path,' added!')
        let file = fs.readFileSync(path)
        let results = returnIDs(file.toString())
        console.log(results)
        mainWindow.webContents.send('getPreviewPlayerInfo',results)
      }, 250)
    }
  }))
}

process.on('monitorAccount', newAccount => {
  console.log(newAccount)
  monitorAccount(newAccount)
})

const monitorAccount = function(account) {
  const { replayPath, renameFiles } = account
  const watcher = chokidar.watch(replayPath, {
    ignored: /(^|[\/\\])\../,
    persistent: true
  })
  watcher.on('ready', () => watcher.on('add', path => {
    if (!parserPopup.saveInfo.fileNames.hasOwnProperty(path)) {
      setTimeout(() => {
        process.emit('addSingleReplay', {rPath:path, renameFiles})
      },500) // after half a second, send file info to parser.  should be enough time
    }
  }))
  parseNewReplays(account,true)
}

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
      const replayOpenerFork = fork(require.resolve('./electron/importReplays'))
      replayOpenerFork.send(replaysFolder)
      replayOpenerFork.on('message', results => {
        if (results.hasOwnProperty('toSend')) {
          setTimeout(() => { mainWindow.webContents.send('replays:finishedSending',null) },250)
          mainWindow.webContents.send('replays:dispatch',results.toSend)
        }
      })
      /*
      const toSend = await importReplays(replaysFolder)
      setTimeout(() => { mainWindow.webContents.send('replays:finishedSending',null) },250)
      mainWindow.webContents.send('replays:dispatch',toSend)
      */
    }
    mainWindow.webContents.send('playerInfo:dispatch',{bnetIDs:options.bnetIDs, handles:options.handles, regions: options.regions})
    if (options.accounts.length) {
      options.accounts.forEach(account => {
        monitorAccount(account)
      })
      // call parser and do normal startup stuff
    } else {
      let account = await addNewAccount()
      monitorAccount(account)
    }
    monitorForLobby()
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
  loadPreviewWindow()
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
