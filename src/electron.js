const electron = require('electron')
const app = electron.app
/*
const { createWindow, mainWindow } = require('./electron/start.js')
*/


const BrowserWindow = electron.BrowserWindow
let mainWindow = {mainWindow:null}
const path = require('path')
const url = require('url')

function createWindow() {
  mainWindow.mainWindow = new BrowserWindow({ width: 800, height: 600, webPreferences: {webSecurity: false} })
  mainWindow.mainWindow.loadURL(
    process.env.ELECTRON_START_URL ||
    url.format({
      pathname: path.join(__dirname, '/../build/index.html'),
      protocol: 'file:',
      slashes: true,
    }),
  )
  mainWindow.mainWindow.webContents.openDevTools()
  mainWindow.mainWindow.on('closed', () => {
    mainWindow.mainWindow = null
  })
}

app.on('ready', createWindow)
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
