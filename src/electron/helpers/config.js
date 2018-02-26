const path = require('path')
const fs = require('fs')
const { app } = require('electron')
const dataPath = app.getPath('userData')
const optionsPath = path.join(dataPath,'userOptions.json')

let userOptions = {
  maxSimultaneousUploads: 5,
  accountPaths: []
}
if (fs.existsSync(optionsPath)) userOptions = JSON.parse(fs.readFileSync(userOptions))

const saveOptions = () => fs.writeFileSync(optionsPath,JSON.parse(userOptions), 'utf8', (err) => { if (err) console.log(err) })

exports = { userOptions, saveOptions }
