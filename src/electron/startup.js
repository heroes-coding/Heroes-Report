const fs = require('fs')
const path = require('path')
const { app, dialog } = require('electron')
const regions = ['NOWHERE','US','EU','KR','TW','CN']
const { Protocol, MPQArchive } = require('./parser/protocol.js')
const protoProto = require('./parser/proto.json')
const superGet = require('./parser/superGet.js')
const userDataPath = app.getPath('userData')

function showDialog() {
  dialog.showOpenDialog({defaultPath: '/Users/Jeremy/Desktop', buttonLabel: 'Select Replay Path', title: 'Select your replay path for Heroes of the Storm', properties: ['openDirectory']}, (openPath) => {
    console.log(openPath)
  })
}

let HOTSPromise = (async function getHOTS() {
  let promise = new Promise(async function(resolve, reject)  {
    let configPromise = superGet('https://heroes.report/stats/config.json')
    const configPath = path.join(userDataPath,'config.json')
    let config
    if (fs.existsSync(configPath)) {
      config = JSON.parse(fs.readFileSync(configPath))
    }
    let newConfig = await configPromise
    newConfig = JSON.parse(newConfig)
    let HOTS
    const HOTSPath = path.join(userDataPath,'HOTS.json')
    if (!config || newConfig.version > config.version) {
      console.log('getting new version of HOTS dictionary...')
      HOTS = await superGet('https://heroes.report/stats/HOTS.json')
      fs.writeFileSync(HOTSPath,HOTS, 'utf8', (err) => { if (err) console.log(err) })
      fs.writeFileSync(configPath,JSON.stringify(newConfig), 'utf8', (err) => { if (err) console.log(err) })
      HOTS = JSON.parse(HOTS)
    }
    else HOTS = JSON.parse(fs.readFileSync(HOTSPath))
    if (!HOTS.nickDic) {
      HOTS.nickDic = {}
      const nickKeys = Object.keys(HOTS.nickNames)
      for (let n=0;n<nickKeys.length;n++) HOTS.nickDic[HOTS.nickNames[nickKeys[n]]] = parseInt(nickKeys[n])
    }
    if (!HOTS.talentN) {
      HOTS.heroDic['布雷泽'] = 75
      HOTS.talentN = {
        // why are the devs messing around with already established talent names?
        'rehgarlightningshieldearthshield': 1029,
        'rehgarearthbindtotemearthgrasptotem': 1036,
        'rehgarearthbindtotemcolossaltotem': 1030,
        'rehgarwolfrun': 1037,
        'rehgarferalheart': 1025,
        'rehgarancestralhealing': 1038,
        'rehgarbloodandthunder': 1027,
        'rehgarancestralhealingfarseersblessing': 1039,
        'rehgarhealingtotem': 1018,
        'rehgarlightningshieldelectriccharge': 1020,
        'rehgarlightningshieldrisingstorm': 1033,
        'rehgarlightningshieldstormcaller': 1019,
        'rehgarbloodlust': 1026,
        'rehgarfarsight': 1024,
        "rehgargladiatorswarshout": 1032
        }
      const talentKeys = Object.keys(HOTS.nTalents)
      const nTal = talentKeys.length
      for (let t =0;t<nTal;t++) {
        const key = parseInt(talentKeys[t])
        HOTS.talentN[HOTS.nTalents[key]]=key
      }
    }
    resolve(HOTS)
  })
  return promise
}())




function getUsername(replayPath,bnetID) {
  let replays = fs.readdirSync(replayPath).filter(x => x.includes('.StormReplay'))
  const nReplays = replays.length
  let handle = undefined
  const proto = protoProto
  if (nReplays) {
    const file = fs.readFileSync(path.join(replayPath,replays[0]))
    const archive = new MPQArchive(file)
    const details = Protocol.decodeReplayDetails(archive.readFile('replay.details'),proto.typeInfos,proto.dID)
    for (var i=0; i<10; i++) {
      const pID = details['m_playerList'][i]['m_toon']['m_id']
      const name = details['m_playerList'][i]['m_name'].toString()
      if (pID === bnetID) handle = name
    }
  }
  return { nReplays, handle }
}

function showAccountSelection() {
  let promise = new Promise(async function(resolve, reject) {
    let accounts = getAccountPaths()
    let buttons = ['Select Other Replay Path']
    accounts.map((a,i) => {
      const {region, bnetID, replayPath, nReplays, handle} = a
      buttons.push(`${handle ? handle : bnetID} (${regions[region]} region) - ${nReplays} replays (Path: ${replayPath})`)
    })
    /*dialog.showMessageBox({buttons, title: 'Welcome to Heroes Report', message: 'Please select one of the account folders below to begin parsing and uploading!', checkboxLabel:'Rename files'}, (buttonIndex, renameFiles) => {
      console.log(buttonIndex,renameFiles)
      resolve(accounts[buttonIndex-1])
    })
    */
  })
  return promise
}

function getAccountPaths() {
  const heroesPath = path.join(app.getPath('documents'),'Heroes of the Storm/Accounts')
  try {
    const accounts = fs.readdirSync(heroesPath)
    const idPaths = []
    accounts.map(account => {
      const accountPath = path.join(heroesPath,account)
      let folders = fs.readdirSync(accountPath)
      folders = folders.filter(x => x.includes('-Hero-') && x.split("-")[0] !== '98')
      folders.map(x => {
        const replayPath = path.join(accountPath,x,'Replays','Multiplayer')
        if (!fs.existsSync(replayPath)) return
        const [region, _, __, bnetID] = x.split("-")
        const { nReplays, handle } = getUsername(replayPath,parseInt(bnetID))
        if (!nReplays) return
        idPaths.push({region:parseInt(region), bnetID:parseInt(bnetID), replayPath, nReplays, handle })
      })
    })
    return idPaths
  } catch (e) {
    console.log(e)
    return []
  }
}

module.exports = { showAccountSelection, HOTSPromise }
