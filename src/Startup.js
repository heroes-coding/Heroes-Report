window.isElectron = window.process ? true : false
if (window.isElectron) {
  document.body.style.overflow = 'hidden'
  window.remote = window.require('electron').remote
  window.windowID = window.remote.getCurrentWindow().windowID
}
export default undefined
