const fs = require('fs')
const axios = require('axios')
const { fork } = require('child_process')
const path = require('path')
const electron = require('electron')
const getProto = require('./getProto')
electron.ipcMain.setMaxListeners(32)
const { app } = electron
const { asleep } = require('../helpers/asleep')
const dataPath = app.getPath('userData')
const os = require('os')
const nCPU = os.cpus().length-1
let cpuAvailable = Array(nCPU).fill(true)
let workers
process.setMaxListeners(0)
process.on('warning', function(w){
  console.log(' => Suman interactive warning => ', w.stack || w);
})

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

const replaySavePath = path.join(dataPath,'replays')
if (!fs.existsSync(replaySavePath)) fs.mkdirSync(replaySavePath)
const parsedPath = path.join(dataPath,'parsed.json')

const { parserPopup, updateParsingMenu } =require('../containers/parsingLogger/parseAndUpdateManager.js')
const { parserWindow, saveInfo } = parserPopup

// const apiUploadsPath = path.join(dataPath,'api.json')
// let apiToCheck = Object.keys(apiUploads).filter(x => !apiUploads[x])
// console.log(apiToCheck.join("\n"))
/*
axios.post('http://hotsapi.net/api/v1/replays/fingerprints', )
  .then(function (response) {
    console.log(response);
  })
  .catch(function (error) {
    console.log(error);
  });
*/

const saveReplay = function(replay, filePath) {
  const repSavePath = path.join(dataPath,'replays',`${replay.hash}.json`)
  saveInfo.files[filePath].api_hash = replay.api_hash
  saveInfo.files[filePath].hash = replay.hash
  saveInfo.files[filePath].result = 9
  if (fs.existsSync(repSavePath)) return
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
  const { replay, workerIndex, filePath } = msg
  if (isNaN(replay)) saveReplay(replay, filePath)
  else {
    saveInfo.files[filePath].result = replay
  }
  updateParsingMenu({[filePath]:saveInfo.files[filePath]})
  cpuAvailable[workerIndex] = true
  parsed++
}

const parseNewReplays = async function(account, HOTS) {
  let promise = new Promise(async function(resolve, reject) {
    const { replayPath, bnetID } = account
    const replayPaths = []
    returnFiles(replayPath,replayPaths)
    const filteredReplayPaths = []
    const toSend = {}
    for (let p=0;p<replayPaths.length;p++) {
      const rPath = replayPaths[p]
      if (!saveInfo.files.hasOwnProperty(rPath)) {
        const newInfo = {api_hash: null, uploaded: null, hash: null, result: null, index: ++saveInfo.Count}
        saveInfo.files[rPath] = newInfo
        filteredReplayPaths.push(rPath)
        toSend[rPath] = newInfo
      }
    }
    const nReplays = filteredReplayPaths.length
    if (nReplays) updateParsingMenu(toSend)
    console.log('in parse new replays',account,'should be parsing ',nReplays)
    workers = []
    cpuAvailable = Array(nCPU).fill(true)
    let nWorkers = Math.min(nReplays,nCPU)
    for (let w=0;w<nWorkers;w++) {
      let forked = fork(require.resolve('./parserFork'))
      forked.send({HOTS})
      forked.on('message', forkMessage)
      workers.push(forked)
    }
    let r = 0
    parsed = 0 // see above global
    while (r < nReplays) {
      let workerOpen = false
      for (let w=0;w<nWorkers;w++) {
        if (cpuAvailable[w]) {
          console.log(r)
          const worker = workers[w]
          worker.send({replayPath: filteredReplayPaths[r], workerIndex:w})
          cpuAvailable[w] = false
          workerOpen = true
          r++
          break
        }
      }
      if (!workerOpen) await asleep(250)
    }
    while (parsed < nReplays) await asleep(250)
    workers = []
    console.log('Finished parsing, should be saving!')
    console.log('final save info',parsedPath)
    const toCheck = {}
    const api_keys = []
    const files = Object.keys(saveInfo.files)
    const nFiles = files.length
    const toUpdate = {}
    for (let f=0;f<nFiles;f++) {
      const fPath = files[f]
      const { api_hash, uploaded } = saveInfo.files[fPath]
      if (uploaded === null && api_hash !==null) {
        toCheck[api_hash] = fPath
        saveInfo.files[fPath].uploaded = 0
        api_keys.push(api_hash)
        toUpdate[fPath] = saveInfo.files[fPath]
      } else if (!uploaded && api_hash !==null) {
        toCheck[api_hash] = fPath
        api_keys.push(api_hash)
      }
    }
    let response
    try {
      response = await axios.post('http://hotsapi.net/api/v1/replays/fingerprints', api_keys.join("\n"), {headers: {'Content-Type': 'text/plain'}})
    } catch (e) {
      console.log(e)
    }
    toUpload = []
    if (response) {
      const { exists, absent } = response.data
      console.log(response.data)
    }
    updateParsingMenu(toUpdate)
    fs.writeFileSync(parsedPath,JSON.stringify(saveInfo), 'utf8', {flag: 'w'}, (err) => { if (err) console.log(err) })
    return resolve(true)
  })
  return promise
}

module.exports = { parseNewReplays }
