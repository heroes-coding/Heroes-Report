const fs = require('fs')
const path = require('path')
const url = require('url')
const { app, BrowserWindow, ipcMain } = require('electron')
const { showAccountSelection, HOTSPromise } = require('../../startup.js')
const { parseNewReplays } = require('../../parser/parsingManager.js')
const dataPath = app.getPath('userData')
const optionsPath = path.join(dataPath,'userOptions.json')
const os = require('os')
const nCPU = os.cpus().length-1
global['nCPU'] = nCPU

let options = {
  prefs: {
    uploads:{name: 'Upload to HOTS Api', value:true, index:0},
    simUploads: {name: 'Max simultaneous uploads', value: 5, index: 1},
    simParsers: {name:'Max simultaneous parsers', value: nCPU, index: 2},
    previews:{name:'Show match previews', value: true, index: 3}
  },
  accounts: []
}

ipcMain.on('option:update',(e,args) => {
  const { key, value } = args
  options.prefs[key].value = value
  console.log(options)
  saveOptions()
})

ipcMain.on('account:selectReplayPath',(e,args) => {
  addNewAccount()
})

let optionsPopup = {window: null}

if (fs.existsSync(optionsPath)) {
  try {
    options = JSON.parse(fs.readFileSync(optionsPath))
  } catch (e) {
    console.log('user options corrupted',e)
  }
}

const saveOptions = () => fs.writeFileSync(optionsPath,JSON.stringify(options), 'utf8', (err) => { if (err) console.log(err) })

const addNewAccount = async() => {
  let promise = new Promise(async function(resolve, reject) {
    let newAccount = await showAccountSelection(options.accounts)
    if (options.accounts.filter(x => {
      if (x.replayPath === newAccount.replayPath) return true
    }).length === 0) {
      options.accounts.push(newAccount)
      saveOptions()
      process.emit('newReplayPath', newAccount)
      return resolve(newAccount)
    }
    resolve('exists')
  })
  return promise
}

const height = 600
const width = 450
function loadOptionsMenu() {
  optionsPopup.window = new BrowserWindow({width, height, resizable: false, show:false, frame: false})
  const location = process.env.ELECTRON_START_URL ? process.env.ELECTRON_START_URL + '/options' : undefined
  optionsPopup.window.loadURL(location || url.format({
    pathname: path.join(__dirname, '/../build/index.html/options'),
    protocol: 'file:',
    slashes: true
  }))
}

exports.options = options
exports.optionsPopup = optionsPopup
exports.addNewAccount = addNewAccount
exports.loadOptionsMenu = loadOptionsMenu
