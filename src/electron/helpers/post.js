const request = require('request')
const fs = require('fs')
const { asleep } = require('./asleep')

let xRateLimitRemaining = 300
const postReplay = function(filePath) {
  // Takes in a file path, posts to HOTSApi, and either rejects with error or resolves with ID
  let promise = new Promise(async function(resolve, reject) {
    if (xRateLimitRemaining < 100) await asleep(60000)
    const req = request.post('http://hotsapi.net/api/v1/replays', function(err, resp, body) {
      if (err) reject(err)
      else if (resp.statusCode !== 200) reject(new Error(resp.statusCode))
      else resolve(JSON.parse(body).id)
      xRateLimitRemaining = resp.headers['x-ratelimit-remaining']
    })
    const form = req.form()
    form.append('file', fs.createReadStream(filePath))
  })
  return promise
}

exports.postReplay = postReplay
