let HOTS
const fs = require('fs')
const axios = require('axios')
const { fork } = require('child_process')
const path = require('path')
const electron = require('electron')
const getProto = require('./getProto')
electron.ipcMain.setMaxListeners(32)
const { HOTSPromise } = require('../startup.js')
const { app } = electron
const { asleep } = require('../helpers/asleep')
const { checkAPIHash, checkAPIHashes, enqueueReplayForUpload } = require('../helpers/HOTSApi.js')
const { fullToPartial } = require('../helpers/fullToPartial.js')
const dataPath = app.getPath('userData')
const os = require('os')
const nCPU = os.cpus().length-1
let cpuAvailable = Array(nCPU).fill(true)
const { options } = require('../containers/optionsMenu/optionsManager.js')
const { mapNicks, modeNicks } = require('../helpers/definitions.js')
const { formatTime, formatDate, minSinceLaunchToDate } = require('../helpers/simpleFunctions.js')

let workers = []
process.on('warning', function(w) { console.log(' => FULL STACK E => ', w.stack || w) })

const returnFiles = function(dirPath, replayPaths) {
  const files = fs.readdirSync(dirPath)
  for (let f=0;f<files.length;f++) {
    const file = files[f]
    const filePath = path.join(dirPath,file)
    if (file.includes('.StormReplay')) {
      replayPaths.push(filePath)
    } else if (fs.lstatSync(filePath).isDirectory()) {
      returnFiles(filePath,replayPaths)
    }
  }
}

process.on('uploadCheckResult', ({uploadInfoQueue,results}) => {
  const toSend = {}
  for (let e=0;e<results.absent.length;e++) {
    const {fileID} = uploadInfoQueue[results.absent[e]]
    saveInfo.files[fileID].uploaded = 3 // pending
    toSend[fileID] = saveInfo.files[fileID]
  }
  for (let e=0;e<results.exists.length;e++) {
    const {fileID} = uploadInfoQueue[results.exists[e]]
    saveInfo.files[fileID].uploaded = 2 // pending
    toSend[fileID] = saveInfo.files[fileID]
  }
  updateParsingMenu(toSend)
})
process.on('clearUploadInfoQueue', nothing => {
  uploadInfoQueue = {}
})

process.on('addSingleReplay', function({rPath, bnetID, renameFiles}) {
  const fileID = ++saveInfo.Count
  const newInfo = {filePath:rPath, apiHash: null, uploaded: null, hash: null, result: null, index:fileID}
  saveInfo.files[fileID.toString()] = newInfo
  replayQueue.push({rPath, bnetID, renameFiles, fileID})
  if (!isParsing) parsingLoop()
})

process.on('newReplayPath', function(newAccount) {
  console.log(newAccount)
  if (newAccount && newAccount.replayPath) parseNewReplays(newAccount)
})

const replaySavePath = path.join(dataPath,'replays')
const replaySummaryPath = path.join(dataPath,'replaySummaries')
if (!fs.existsSync(replaySavePath)) fs.mkdirSync(replaySavePath)
if (!fs.existsSync(replaySummaryPath)) fs.mkdirSync(replaySummaryPath)
const parsedPath = path.join(dataPath,'parsed.json')

const { parserPopup, updateParsingMenu, saveSaveInfo } =require('../containers/parsingLogger/parseAndUpdateManager.js')
const { parserWindow, saveInfo } = parserPopup


let uploadInfoQueue = {}
let uploadedSingly = 0
const saveReplay = async function(replay, filePath, bnetID, renameFiles, fileID) {
  const condensed = fullToPartial(replay,bnetID,HOTS)
  if (!condensed) {
    saveInfo.files[fileID].result = 8
    updateParsingMenu({[fileID]:saveInfo.files[fileID]})
    return
  }
  const repSavePath = path.join(replaySavePath,`${condensed.MSL}.json`)
  const repSummaryPath = path.join(replaySummaryPath,`${condensed.MSL}.json`)
  if (renameFiles) {
    // replace saveInfo info, as well as send message to parser
    const { hero, map, mode, Won, MSL } = condensed
    const date = minSinceLaunchToDate(MSL)
    const oldFilePath = filePath
    const dirName = oldFilePath.match(/(.*)[\/\\]/)[1]||''
    filePath = path.join(dirName,`${formatDate(date)} ${formatTime(date)} ${modeNicks[mode]} ${isNaN(map) ? map : mapNicks[map]} ${isNaN(hero) ? hero : HOTS.nHeroes[hero]} ${Won ? 'Victory' : 'Defeat'}.StormReplay`)
    saveInfo.files[fileID].filePath = filePath
    saveInfo.fileNames[filePath] = fileID
    if (oldFilePath !== filePath) {
      fs.renameSync(oldFilePath,filePath)
    }
  } else if (!saveInfo.fileNames.hasOwnProperty(filePath)) saveInfo.fileNames[filePath] = fileID
  saveInfo.files[fileID].apiHash = replay.apiHash
  saveInfo.files[fileID].hash = replay.hash
  saveInfo.files[fileID].result = 9
  let uploaded
  if (uploadedSingly > 50) uploadInfoQueue[replay.apiHash] = {filePath,fileID}
  else {
    try {
      uploadedSingly++
      uploaded = await checkAPIHash(replay.apiHash)
    } catch (e) {
      console.log(e)
      saveInfo.files[fileID].uploaded = 5
      enqueueReplayForUpload(filePath,fileID)
    }
    if (uploaded) saveInfo.files[fileID].uploaded = 2 // uploaded by someone else
    else {
      saveInfo.files[fileID].uploaded = 3 // pending
      enqueueReplayForUpload(filePath,fileID)
    }
  }
  updateParsingMenu({[fileID]:saveInfo.files[fileID]})
  if (fs.existsSync(repSavePath)) return
  process.emit('dispatchReplay', condensed)
  fs.writeFileSync(repSummaryPath,JSON.stringify(condensed), 'utf8', (err) => { if (err) console.log(err) })
  fs.writeFileSync(repSavePath,JSON.stringify(replay), 'utf8', (err) => { if (err) console.log(err) })
}

let parsed
const parseResults = {0: 'Corrupt', 1: 'BadBans', 2: 'AI', 3: 'Incomplete', 4: 'Unsupported',9: 'Parsed'}
const forkMessage = async(msg) => {
  if (msg.hasOwnProperty('protoNumber')) {
    const { protoNumber, workerIndex } = msg
    let proto
    const worker = workers[workerIndex]
    try {
      proto = await getProto(protoNumber)
    } catch (e) {
      console.log(e)
      return worker.send({protoNumber, proto:undefined})
    }
    return worker.send({protoNumber, proto})
  }
  const { replay, workerIndex, filePath, bnetID, renameFiles, fileID } = msg
  if (isNaN(replay)) saveReplay(replay, filePath, bnetID, renameFiles, fileID)
  else {
    saveInfo.files[fileID].result = replay
    saveInfo.files[fileID].uploaded = 0
    updateParsingMenu({[fileID]:saveInfo.files[fileID]})
  }
  cpuAvailable[workerIndex] = true
  openParseCount--
}

const replayQueue = []
let isParsing = false
let openParseCount = 0
const parsingLoop = async function() {
  isParsing = true
  const maxCPU = options.prefs.simParsers.value
  cpuAvailable = Array(maxCPU).fill(true)
  let nWorkers = Math.min(replayQueue.length,maxCPU)
  for (let w=0;w<nWorkers;w++) {
    let forked = fork(require.resolve('./parserFork'))
    forked.send({HOTS})
    forked.on('message', forkMessage)
    workers.push(forked)
  }
  openParseCount = 0 // see above global
  while (replayQueue.length) {
    let workerOpen = false
    for (let w=0;w<nWorkers;w++) {
      if (cpuAvailable[w]) {
        const { rPath, bnetID, renameFiles, fileID } = replayQueue.shift()
        const worker = workers[w]
        openParseCount++
        worker.send({replayPath:rPath, workerIndex:w, bnetID, renameFiles, fileID})
        cpuAvailable[w] = false
        workerOpen = true
        break
      }
    }
    if (!workerOpen) await asleep(250)
  }
  isParsing = false
  saveSaveInfo()
  while (openParseCount) await asleep(250)
  process.emit("massUpload",uploadInfoQueue)
  workers = [workers[0]] // just keep the first worker
  saveSaveInfo()
  process.emit('clearUploadInfoQueue','ohyeah')
}

const parseNewReplays = async function(account,isStartup) {
  let promise = new Promise(async function(resolve, reject) {
    if (!HOTS) HOTS = await HOTSPromise
    const { replayPath, bnetID, renameFiles } = account
    const replayPaths = []
    returnFiles(replayPath,replayPaths)
    // const filteredReplayPaths = []
    const toSend = {}
    for (let p=0;p<replayPaths.length;p++) {
      const rPath = replayPaths[p]
      if (!saveInfo.fileNames.hasOwnProperty(rPath)) {
        const fileID = ++saveInfo.Count
        const newInfo = {filePath: rPath, apiHash: null, uploaded: null, hash: null, result: null, index: fileID}
        saveInfo.files[fileID.toString()] = newInfo
        replayQueue.push({rPath, bnetID, renameFiles, fileID})
        // filteredReplayPaths.push(rPath)
        toSend[fileID] = newInfo
      } else {
        const oldInfo = saveInfo.files[saveInfo.fileNames[rPath]]
        const fileID = oldInfo.index
        if (isStartup) toSend[fileID] = oldInfo
        if (oldInfo.result === null) replayQueue.push({rPath, bnetID, renameFiles, fileID})
        // pending - 3 or errored - 5
        if ([3,4,5,null].includes(oldInfo.uploaded) && oldInfo.apiHash) {
          const { apiHash, filePath } = oldInfo
          uploadInfoQueue[apiHash] = {filePath,fileID}
          /*
          checkAPIHash(oldInfo.apiHash).then(uploaded => {
            if (uploaded) {
              saveInfo.files[fileID].uploaded = 2
              updateParsingMenu({[fileID]:saveInfo.files[fileID]})
            } else {
              saveInfo.files[fileID].uploaded = 3 // pending
              enqueueReplayForUpload(rPath,fileID)
            }
          })
          */
        }
      }
    }
    if (Object.keys(toSend).length) updateParsingMenu(toSend)
    if (!isParsing && replayQueue.length) parsingLoop()
    else process.emit("massUpload",uploadInfoQueue)
    return resolve(true)
  })
  return promise
}

module.exports = { parseNewReplays }
