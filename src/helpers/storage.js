import LZString from 'lz-string'
const isChrome = !!window.chrome && !!window.chrome.webstore
window.LZString = LZString

let openItems = {}
let totalStorage = 0
let maximumStorage = 5000000

let loadLocal = function(name,placeHolder) { // Returns json objects only
  if (!window.localStorage.hasOwnProperty(name)) {
    return placeHolder || false // is empty if nothing was passed
  } else {
    let file = window.localStorage[name]
    let fileSize = file.length
    if (!openItems.hasOwnProperty(name)) {
      totalStorage += fileSize
    }
    openItems[name] = fileSize
    let toReturn
    try {
      toReturn = JSON.parse(!isChrome ? LZString.decompressFromUTF16(file) : LZString.decompress(file))
    } catch (e) {
      return placeHolder || false
    }
    if (placeHolder) {
      let defaults = Object.keys(placeHolder)
      for (let d=0;d<defaults.length;d++) {
        if (!toReturn.hasOwnProperty(defaults[d])) {
          toReturn[defaults[d]] = placeHolder[defaults[d]]
        }
      }
    }
    return toReturn
  }
}

let saveLocal = function(obj,name) { // Accepts json objects only
  // need to load in any replays, at least in condensed form, before saving
  // this is to ensure that there is enough local storage space
  if (openItems.hasOwnProperty(name)) {
    totalStorage -= openItems[name]
  }
  var storageObject = !isChrome ? LZString.compressToUTF16(JSON.stringify(obj)) : LZString.compress(JSON.stringify(obj))
  var storageSize = storageObject.length
  if (totalStorage + storageSize > maximumStorage) {
    return false
    // need to re-implement deletion of old replays, but leaving alone for now
    // deleteItems(totalStorage + storageSize - maximumStorage)
  }
  totalStorage += storageSize
  openItems[name] = storageSize
  window.localStorage[name] = storageObject
  return true
}

let getStorage = function() {
  return totalStorage
}

window.getStorage = getStorage
window.loadLocal = loadLocal
window.saveLocal = saveLocal

export { loadLocal, saveLocal, getStorage }
