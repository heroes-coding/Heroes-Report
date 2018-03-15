const https = require('https')
const Promise = require('promise')

function superGet(url) {
  let promise = new Promise(function(resolve, reject) {
    let timeout = setTimeout(() => {
      console.log('problem with', url)
      reject(new Error('Timeout'))
    },10000)
    let request = https.get(url, function(response) {
      let results = []
      response.setEncoding('utf8')
      response.on('data', data => results.push(data))
      response.on('error', function(err) { return reject(err) })
      response.on('end', function() {
        clearTimeout(timeout)
        if (results[0].includes('404: Not Found')) return reject(new Error('404'))
        let joinedData = results.join('')
        resolve(joinedData)
      })
    })
    request.on('error', err => { return reject(err) })
  })
  return promise
}

module.exports = superGet
