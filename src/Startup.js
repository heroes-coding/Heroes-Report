window.isElectron = window.process
if (window.isElectron) {
  document.body.style.overflow = 'hidden'
  window.remote = window.require('electron').remote
}
export default undefined
