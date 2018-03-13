const fs = require('fs')
const path = require('path')

const openReplays = function(replaysFolder) {
  let promise = new Promise(async function(resolve, reject) {
    if (fs.existsSync(replaysFolder)) {
      const replayPaths = fs.readdirSync(replaysFolder)
      const nReps = replayPaths.length
      let sent = 0
      const toSend = []
      for (let r=0;r<nReps;r++) {
        const repPath = path.join(replaysFolder,replayPaths[r])
        // let's try one at a time
        try {
          const replay = fs.readFileSync(repPath)
          toSend.push(JSON.parse(replay))
        } catch (e) {
          console.log(e)
        }
        /*
        fs.readFile(repPath, async(e,replay) => {
          if (e) return console.log(e)
          try {
            const jReplay = JSON.parse(replay)
            toSend.push(jReplay)
            sent++
          } catch (e) {
            sent++
            console.log(e)
          } finally {
            if (sent === nReps-1) resolve(toSend)
          }
        })
        */
      }
      resolve(toSend)
    }
  })
  return promise
}

process.on('message', async(replaysFolder) => {
  const toSend = await openReplays(replaysFolder)
  process.send({toSend})
})

exports.openReplays = openReplays
