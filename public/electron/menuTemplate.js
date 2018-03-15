const { showParsingMenu, parserPopup } = require('./containers/parsingLogger/parseAndUpdateManager.js')
const menuTemplate = [
  {
    label: 'Windows',
    submenu: [
      {
        label: 'Parsed and Uploaded Status',
        accelerator: 'CommandOrControl+F',
        click(item, focusedWindow) {
          if (parserPopup.parserWindow) parserPopup.parserWindow.close()
          else showParsingMenu()
        }
      }
    ]
  },
  {
    label: 'Options',
    accelerator: 'CommandOrControl+O',
    submenu: [
      {
        label: 'Debug Console',
        accelerator: 'CommandOrControl+D',
        click(item, focusedWindow) { focusedWindow.toggleDevTools() }
      }
    ]
  }
]

module.exports = menuTemplate
