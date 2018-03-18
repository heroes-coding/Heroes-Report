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
    simUploads: {name: 'Max simultaneous uploads', value: Math.max(Math.round(nCPU/2),1), index: 1},
    simParsers: {name:'Max simultaneous parsers', value: Math.max(Math.round(nCPU/2),1), index: 2},
    previews:{name:'Automatically show match previews', value: true, index: 3}
  },
  accounts: [],
  replayPaths: [],
  bnetIDs: [],
  handles: [],
  regions: [],
}

ipcMain.on('account:renameFilesToggle',async(e,oldAccount) => {
  const { replayPath, renameFiles } = oldAccount
  const newAccounts = []
  for (let a=0;a<options.accounts.length;a++) {
    const account = options.accounts[a]
    if (account.replayPath === replayPath) account.renameFiles = !renameFiles
    newAccounts.push(account)
  }
  options.accounts = newAccounts
  saveOptions()
  optionsPopup.window.webContents.send('options',options)
})

process.on('account:addCustomPath', ({replayPath,renameFiles}) => {
  options.accounts.push({replayPath,renameFiles})
  saveOptions()
  optionsPopup.window.webContents.send('options',options)
})

ipcMain.on('account:deleteReplayPath',async(e,oldAccount) => {
  const { replayPath } = oldAccount
  const newAccounts = []
  for (let a=0;a<options.accounts.length;a++) {
    const account = options.accounts[a]
    if (account.replayPath === replayPath) continue // skipping means deleting lol
    newAccounts.push(account)
  }
  options.accounts = newAccounts
  saveOptions()
  optionsPopup.window.webContents.send('options',options)
})

ipcMain.on('option:update',(e,args) => {
  const { key, value } = args
  options.prefs[key].value = value
  console.log(options)
  saveOptions()
  optionsPopup.window.webContents.send('options',options)
})

ipcMain.on('account:selectReplayPath',async(e,args) => {
  await addNewAccount(true)
  optionsPopup.window.webContents.send('options',options)
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

process.on('newaccount:manualadd',({bnetID, region, handle}) => {
  console.log('adding new account through manual add, handle: ',handle)
  updateAccounts({bnetID, region, handle})
})

const updateAccounts = function({bnetID, region, handle}) {
  options.bnetIDs.push(bnetID)
  options.handles.push(handle)
  options.regions.push(region)
  process.emit('newaccount:send',{bnetID, region, handle})
  saveOptions()
}

const addNewAccount = async(fromBrowser) => {
  let promise = new Promise(async function(resolve, reject) {
    let newAccount = await showAccountSelection(options.accounts)
    const {replayPath, bnetID, region, handle, renameFiles} = newAccount
    console.log('adding new account through add new account, handle: ',handle)
    options.accounts.push({replayPath,renameFiles})
    updateAccounts({bnetID, region, handle})
    if (fromBrowser) process.emit('monitorAccount', newAccount)
    return resolve(newAccount)
  })
  return promise
}

const height = 600
const width = 450
function loadOptionsMenu() {
  optionsPopup.window = new BrowserWindow({width, height, resizable: false, show:false, frame: false})
  const location = process.env.ELECTRON_START_URL ? process.env.ELECTRON_START_URL + '/options' : undefined
  const fullPath = path.join(__dirname.split('electron')[0], 'index.html')
  console.log('__dirname',__dirname, fullPath,url.format({pathname: fullPath,protocol: 'file:', slashes: true}))
  optionsPopup.window.loadURL(location || url.format({
    pathname: fullPath,
    protocol: 'file:',
    slashes: true
  }))
  optionsPopup.window.windowID = "options"
  optionsPopup.window.once('ready-to-show', () => {
    optionsPopup.window.webContents.send('options',options)
  })
}

exports.options = options
exports.optionsPopup = optionsPopup
exports.addNewAccount = addNewAccount
exports.loadOptionsMenu = loadOptionsMenu
