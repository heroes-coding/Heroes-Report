const axios = require('axios')
const request = require('request')
const fs = require('fs')
const { asleep } = require('./asleep')
const { ipcMain } = require('electron')
const APIStatus = {failedAttempts: 0, APIFailed: false}
const uploadQueue = []
const { parserPopup, updateParsingMenu } =require('../containers/parsingLogger/parseAndUpdateManager.js')
const { options } = require('../containers/optionsMenu/optionsManager.js')

let xRateLimitRemaining = 300
let currentUploads = 0
let uploading = false

ipcMain.on('option:update',(e,args) => {
  const { key, value } = args
  if (key === 'uploads' && value) resetAPI()
})

const uploadOne = async function(fileToUpload) {
  try {
    let newAPIID = await postReplay(fileToUpload)
    // console.log('new API ID: ',newAPIID)
  } catch (e) {
    console.log("ERROR CAUGHT?", e, "ERROR CAUGHT?")
  }
}

const uploadLoop = async function() {
  uploading = true
  while (uploadQueue.length) {
    while (currentUploads > options.prefs.simUploads.value) await asleep(100)
    const fileToUpload = uploadQueue.shift()
    uploadOne(fileToUpload)
    if (!APIOkay()) break
  }
  uploading = false
}

const enqueueReplayForUpload = function(fileName) {
  uploadQueue.push(fileName)
  if (!options.prefs.uploads.value) {
    APIStatus.APIFailed = true
    return
  }
  if (!uploading && APIOkay()) uploadLoop()
}

const resetAPI = function() {
  APIStatus.APIFailed = false
  if (uploadQueue.length && !uploading) uploadLoop()
}

const APIOkay = function() {
  if (APIStatus.failedAttempts < 3 || !APIStatus.APIFailed) return true
  else if (APIStatus.failedAttempts > 2) {
    APIStatus.failedAttempts = 0
    APIStatus.APIFailed = true
    setTimeout(resetAPI, 60000)
  }
  return false
}

function updateFileStatus(filePath,status) {
  parserPopup.saveInfo.files[filePath].uploaded = status
  updateParsingMenu({[filePath]:parserPopup.saveInfo.files[filePath]})
}

const postReplay = function(filePath) {
  updateFileStatus(filePath,4)
  // Takes in a file path, posts to HOTSApi, and either rejects with error or resolves with ID
  let promise = new Promise(async function(resolve, reject) {
    if (!APIOkay()) return reject(new Error('API Down'))
    if (xRateLimitRemaining < 100) await asleep(60000)
    currentUploads++
    const req = request.post('http://hotsapi.net/api/v1/replays', function(err, resp, body) {
      currentUploads--
      if (!resp || !resp.headers) {
        APIStatus.failedAttempts += 1
        updateFileStatus(filePath,5)
        return reject(new Error('No response'))
      }
      xRateLimitRemaining = resp.headers['x-ratelimit-remaining']
      if (err) {
        APIStatus.failedAttempts += 1
        updateFileStatus(filePath,5)
        return reject(err)
      } else if (resp.statusCode !== 200) {
        APIStatus.failedAttempts += 1
        updateFileStatus(filePath,5)
        return reject(new Error(resp.statusCode))
      } else {
        const { id, status, success } = JSON.parse(body)
        if (status==='Duplicate') updateFileStatus(filePath,2)
        else if (success===true) updateFileStatus(filePath,1)
        else updateFileStatus(filePath,5)
        return resolve(id)
      }
    })
    const form = req.form()
    form.append('file', fs.createReadStream(filePath))
  })
  return promise
}

function checkAPIHash(hash) {
  let promise = new Promise(async function(resolve, reject) {
    if (!APIOkay()) return reject(new Error('API Down'))
    let result
    try {
      result = await axios.get(`http://hotsapi.net/api/v1/replays/fingerprints/v3/${hash}`)
    } catch (e) {
      APIStatus.failedAttempts += 1
      return reject(e)
    }
    if (result.status === 200) resolve(result.data.exists)
    else {
      APIStatus.failedAttempts += 1
      reject(new Error(result.status))
    }
  })
  return promise
}

function checkAPIHashes(hashList) {
  let promise = new Promise(async function(resolve, reject) {
    if (!APIOkay()) return reject(new Error('API Down'))
    let result
    try {
      result = await axios.post('http://hotsapi.net/api/v1/replays/fingerprints', hashList.join("\n"), {headers: {'Content-Type': 'text/plain'}})
    } catch (e) {
      APIStatus.failedAttempts += 1
      reject(e)
    }
    if (result.status === 200) resolve(result.data)
    else {
      APIStatus.failedAttempts += 1
      reject(new Error(result.status))
    }
  })
  return promise
}

exports.checkAPIHash = checkAPIHash
exports.enqueueReplayForUpload = enqueueReplayForUpload
exports.APIStatus = APIStatus
exports.checkAPIHashes = checkAPIHashes
