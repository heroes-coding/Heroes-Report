import React, { Component } from 'react'
import { renderNothing } from '../../../components/filterComponents'
import FilterDropDown from '../../../containers/filter_drop_down'
import TrafficLights from '../navigation/trafficLights'
const electron = window.require('electron')
const { ipcRenderer, remote } = electron
const parseResults = {0: 'Corrupt', 1: 'BadBans', 2: 'Versus AI', 3: 'Incomplete', 4: 'Unsupported', 9: 'Parsed'}

class ParsingLog extends Component {
  flipPage(curPage) {
    const currentPage = this.props.curPage
    if (currentPage === curPage) return
    this.setState({...this.state, curPage})
  }
  constructor(props) {
    super(props)
    this.state = { sort: 1, states: {0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 9: 0}, reverse: true, files: {}, Parsed: 0, Uploaded: 0, CanUpload: 0, AlreadyUploaded: 0, list: [], pageNames:[], curPage: 0 }
    this.nFiles = 0
    this.nPerPage = 25
    this.reorder = this.reorder.bind(this)
    this.flipPage = this.flipPage.bind(this)
    this.renderItem = this.renderItem.bind(this)
    ipcRenderer.on('parsing',(e,newFiles) => {
      let {Parsed, states, Uploaded, CanUpload, AlreadyUploaded, files} = this.state
      files = {...files}
      states = {...states}
      let newFileKeys = Object.keys(newFiles)
      newFileKeys.map(x => {
        const f = newFiles[x]
        if (files.hasOwnProperty(x)) {
          if (files[x].result === null && f.result !==null) {
            states[f.result] += 1
            if (f.result === 9) CanUpload += 1
            Parsed += 1
          }
          if (f.uploaded === 1 && files[x].uploaded !== 1) {
            // was uploading (4), now uploaded (1)
            Uploaded += 1
          } else if (f.uploaded === 2 && files[x].uploaded !== 2) {
            AlreadyUploaded += 1
          }
        } else {
          if (f.result !== null) {
            states[f.result] += 1
            Parsed += 1
            if (f.result === 9) CanUpload += 1
          }
          if (f.uploaded) {
            if (f.uploaded === 1) Uploaded += 1
            else if (f.uploaded === 2) AlreadyUploaded += 1
          }
        }
        files[x] = f
      })
      let fileKeys = Object.keys(files)

      const list = []
      fileKeys.map(x => {
        const { index, result, uploaded, filePath } = files[x]
        const fParts = filePath.split("\\")
        const file = fParts[fParts.length-1]
        list.push({index, result, uploaded, file})
      })
      list.sort((x,y) => x.index < y.index ? 1 : -1)
      const newState = {...this.state, Parsed, Uploaded, CanUpload, AlreadyUploaded, files, states, list}
      let newNFiles = list.length
      if (newNFiles !== this.nFiles) {
        this.nFiles = newNFiles
        let pageNames = []
        for (let n=0;n<Math.ceil(newNFiles/this.nPerPage);n++) {
          pageNames.push({
            name: `Files ${1+n*this.nPerPage} - ${Math.min((n+1)*this.nPerPage,newNFiles)}`,
            id: n
          })
        }
        newState.pageNames = pageNames
      }
      this.setState(newState)
      window.files = files
    })
  }
  renderItem(x) {
    const { index, result, uploaded, file } = x
    let uploadStatus, uploadClass, parsedStatus, parsedClass
    if (uploaded === 4) {
      uploadStatus = 'Uploading'
      uploadClass = 'uploading'
    } else if (uploaded === 1) {
      uploadStatus = 'Uploaded'
      uploadClass = 'uploaded'
    } else if (uploaded === 2) {
      uploadStatus = 'Other Uploaded'
      uploadClass = 'uploaded'
    } else if (uploaded === 3) {
      uploadStatus = 'Pending...'
      uploadClass = 'uploading'
    } else if (uploaded === 5) {
      uploadStatus = 'Error'
      uploadClass = 'error'
    } else {
      uploadStatus = 'Not Uploaded'
      uploadClass = 'notUploaded'
    }
    if (result === 9) {
      parsedStatus = 'Parsed'
      parsedClass = 'parsed'
    } else if (result === 8) {
      parsedStatus = 'Other Account'
      parsedClass = 'vsai'
    } else if (result===null) {
      parsedStatus = 'Parsing...'
      parsedClass = 'parsing'
    } else if (result===2) {
      parsedStatus = 'VS AI'
      parsedClass = 'vsai'
    } else {
      parsedStatus = parseResults[result]
      parsedClass = 'failedParse'
    }
    return (
      <div key={`${index}${result}${uploaded}`} className="rt-tr-group">
        <div className="rt-tr replayItem">
          <div className={`rt-td replayFileList -cursor-pointer`} >
            {file.replace('˸',':').replace('-','/').replace('-','/').replace('.StormReplay','')}
          </div>
          <div className='rt-td statBoxHolder parsedList'>
            <span className={parsedClass} >{parsedStatus}</span>
          </div>
          <div className='rt-td statBoxHolder uploadList'>
            <span className={uploadClass} >{uploadStatus}</span>
          </div>
        </div>
      </div>
    )
  }
  reorder(id, reverse) {
    if (this.state.sort === id) {
      this.setState({...this.state,reverse:!this.state.reverse})
    } else {
      this.setState({...this.state, sort:id, reverse})
    }
  }
  render() {
    const { Uploaded, CanUpload, AlreadyUploaded, Parsed, list, curPage, pageNames, states } = this.state
    window.states = states
    const nItems = list.length
    return (
      <div className="overall parsingDiv">
        <div className="electronHeader">
          <TrafficLights window={remote.getGlobal('parserPopup').parserWindow} />
          <div className="parserTitle">Parsed ({Parsed}/{nItems}) and Uploaded ({Uploaded+AlreadyUploaded}/{CanUpload} - {Uploaded} by You)</div>
        </div>
        <div className="container-fluid col-12 parserPopup">
          <div className="ReactTable -striped -highlight">
            <div className="rt-table" >
              <div className="rt-thead -header">
                <div className="rt-tr parserInfo">
                  <div className="rt-th">Parsed: {states[9]}</div>
                  <div className="rt-th">VS AI: {states[2]}</div>
                  <div className="rt-th">Incomplete: {states[3] + states[1]}</div>
                  <div className="rt-th">Corrupt: {states[0] + states[1]}</div>
                  <div className="rt-th">Unsupported: {states[4]}</div>
                </div>
              </div>
            </div>
          </div>
          <FilterDropDown
            currentSelection={`Files ${1+curPage*this.nPerPage} - ${Math.min((curPage+1)*this.nPerPage,nItems)} out of ${nItems} files`}
            buttonLabel=''
            name=''
            id='mmrSelection'
            dropdowns={pageNames}
            updateFunction={this.flipPage}
            leftComponentRenderer={renderNothing}
            rightComponentRenderer={renderNothing}
            renderDropdownName={true}
            currentID={99}
            containerClass='regionList -cursor-pointer'
          />
          <div className="ReactTable -striped -highlight">
            <div className="rt-table" >
              <div className="rt-thead -header">
                <div className="rt-tr">
                  <div onClick={() => this.reorder(0,false)} className="rt-th replayFileList -cursor-pointer">Replay</div>
                  <div onClick={() => this.reorder(3,true)} className="rt-th parsedList -cursor-pointer">Parsed</div>
                  <div onClick={() => this.reorder(2,true)} className="rt-th uploadList -cursor-pointer">Uploaded</div>
                </div>
              </div>
              <div className="rt-tbody">
                {list.slice(curPage*this.nPerPage,(curPage+1)*this.nPerPage).map(x => this.renderItem(x))}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

export default ParsingLog
