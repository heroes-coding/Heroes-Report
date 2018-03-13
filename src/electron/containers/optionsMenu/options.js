import React, { Component } from 'react'
import { connect } from 'react-redux'
import { renderNothing } from '../../../components/filterComponents'
import FilterDropDown from '../../../containers/filter_drop_down'
import TrafficLights from '../navigation/trafficLights'
const electron = window.require('electron')
const { ipcRenderer, remote } = electron
class OptionsMenu extends Component {
  componentDidMount() {
    window.document.getElementsByClassName('electronBody')[0].style.overflowY = "hidden"
  }
  constructor(props) {
    super(props)
    this.state = { options: [], accounts: [] }
    this.updateOption = this.updateOption.bind(this)
    ipcRenderer.on('options',(e,options) => {
      const { prefs, accounts } = options
      const optionKeys = Object.keys(prefs)
      let newOptions = []
      let showUploads = true
      for (let k=0;k<optionKeys.length;k++) {
        const key = optionKeys[k]
        let { value, index, name } = prefs[key]
        if (key === 'uploads') showUploads = value
        const isBool = value === true || value === false
        const vals = { key, name, index, value, isBool }
        value = isBool ? (value ? 'Yes' : 'No') : value
        const dropdown = isBool ? [{name: 'Yes', id: true, data:{...vals, value: true}}, {name: 'No', id: false, data:{...vals, value: false}}] : Array(remote.getGlobal('nCPU')).fill(0).map((x,i) => i+1).map(x => {
          return {name: x, id: x, data: {...vals, value: x}}
        })
        newOptions.push({key, name, index, value, isBool, dropdown})
      }
      newOptions.sort((x,y) => x.index < y.index ? -1 : 1)
      newOptions = newOptions.filter(x => showUploads || x.key !== 'simUploads')
      this.setState({options: newOptions, accounts})
    })
  }
  updateOption(data) {
    const { key, name, index, value, isBool } = data
    const newOptions = [...this.state.options]
    newOptions[index] = { key, name, index, value: isBool ? (value ? 'Yes' : 'No') : value, isBool, dropdown: newOptions[index].dropdown }
    this.setState({ ...this.state, options: newOptions })
    ipcRenderer.send('option:update',{key, value: isBool ? value : parseInt(value)})
  }
  render() {
    return (
      <div className="overall optionsDiv">
        <div className="electronHeader">
          <TrafficLights window={remote.getCurrentWindow()} noMax={true} noMin={true} />
          <div className="optionsTitle">Program Options</div>
        </div>
        <div className="row dataFilters">
          {this.state.options.map(o => {
            const {key, name, index, value, dropdown} = o
            return (
              <FilterDropDown
                key={key}
                currentSelection={value}
                name={`${name}: `}
                id='gameMode'
                dropdowns={dropdown}
                updateFunction={this.updateOption}
                leftComponentRenderer={renderNothing}
                rightComponentRenderer={renderNothing}
                renderDropdownName={true}
                currentID={index}
              />
            )
          })}
        </div>
        <div className="ReactTable -striped -highlight accountList">
          <div className="rt-table" >
            <div className="rt-thead -header">
              <div className="rt-tr">
                <div className="rt-th replayFileList">Replay Folder</div>
                <div className="rt-th parsedList -cursor-pointer">
                  Rename Replays
                  <i title="Renaming replays is not retroactive" className="fa fa-info-circle infoButton" aria-hidden="true"></i>
                </div>
                <div className="rt-th parsedList -cursor-pointer">
                  Delete Path
                  <i title="Deleting a replay path will not remove previously parsed replays from your history.  It will just prevent further parsing and replay path monitoring upon program restart." className="fa fa-info-circle infoButton" aria-hidden="true"></i>
                </div>
              </div>
            </div>
            <div className="rt-tbody">
              {this.state.accounts.map((x,i) => {
                return (
                  <div key={i} className="rt-tr-group">
                    <div className="rt-tr replayItem">
                      <div className={`rt-td replayPath`}>
                        {x.replayPath.split("\\").join("\\ ")}
                      </div>
                      <div
                        className={`rt-td parsedPath addPath`}
                        onClick={() => {
                          console.log(x.renameFiles)
                          ipcRenderer.send('account:renameFilesToggle',x)
                        }}
                      >
                        <i className={`fa fa-toggle-${x.renameFiles ? 'on' : 'off'}`} aria-hidden="true"></i>
                      </div>
                      <div
                        className={`rt-td parsedPath addPath`}
                        onClick={() => {
                          console.log('delete account',x)
                          ipcRenderer.send('account:deleteReplayPath',x)
                        }}
                      >
                        <i className="fa fa-minus-square" aria-hidden="true"></i>
                      </div>
                    </div>
                  </div>
                )
              })}
              <div className="rt-tr-group">
                <div className="rt-tr replayItem addPath">
                  <div className={`rt-td addPath`}
                    onClick={() => {
                      ipcRenderer.send('account:selectReplayPath',true)
                    }}
                  >
                    Add new replays folder &nbsp;&nbsp;<i className="fa fa-plus" aria-hidden="true"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

function mapStateToProps(state, ownProps) {
  return {...ownProps}
}

export default connect(mapStateToProps)(OptionsMenu)
