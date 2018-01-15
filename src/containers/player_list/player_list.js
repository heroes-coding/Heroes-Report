import React, { Component } from 'react'
import { connect } from 'react-redux'
import { dispatchPlayerSearch } from '../../actions'
import { Link } from 'react-router-dom'
import FilterDropDown from '../../containers/filter_drop_down'
import { renderNothing } from '../../components/filterComponents'


const regions = ['NOWHERE','US','EU','KR','TW','CN']
const MMRDropdowns = [
  {name: 'QM MMR | Perc.', id: 'q'},
  {name: 'HL MMR | Perc.', id: 'h'},
  {name: 'TL MMR | Perc.', id: 't'},
  {name: 'UD MMR | Perc.', id: 'u'}
]
export const MMRNames = {}
MMRDropdowns.map(x => { MMRNames[x.id] = x.name })

export function formatPercentile(perc) {
  let suffix = "th"
  if (perc%10 === 1) {
    suffix = "st"
  } else if (perc%10 === 2) {
    suffix = "nd"
  } else if (perc%10 === 3) {
    suffix = "rd"
  }
  return `${perc}${suffix}`
}

class PlayerPage extends Component {
  constructor(props) {
    super(props)
    this.state = { sort: 1, reverse: true, mmrType: 'HL MMR | Perc.', mmrID: 'h' }
    this.sendSearch = this.sendSearch.bind(this)
    this.reorder = this.reorder.bind(this)
    this.reorderMMR = this.reorderMMR.bind(this)
  }
  reorderMMR(id) {
    console.log('Should be reordering',id)
    if (this.state.sort===4) {
      if (this.state.mmrID === id) {
        this.setState({...this.state, reverse: !this.state.reverse})
      } else {
        this.setState({ sort: 4, reverse:true, mmrType: MMRNames[id], mmrID:id })
      }
    } else {
      this.setState({ sort: 4, reverse:true, mmrType: MMRNames[id], mmrID:id })
    }
  }
  reorder(id, reverse) {
    console.log('Should be reordering by: ',id)
    if (this.state.sort === id) {
      this.setState({...this.state,reverse:!this.state.reverse})
    } else {
      this.setState({...this.state, sort:id, reverse})
    }
  }
  sendSearch(playerid) {
    console.log(`got a player search ${playerid}`)
  }
  componentDidMount() {
    const {id} = this.props.match.params
    this.sendSearch(id)
  }
  renderItem(x,i) {
    const mmr = x[4][this.state.mmrID]
    return (
      <div id={i} key={i} className="rt-tr-group">
        <div className="rt-tr replayItem">
          <div className={`rt-td handleList -cursor-pointer`} >
            <Link className='nav-link' to={`/players/${x[1]}`}>{x[0]}</Link>
          </div>
          <div className='rt-td statBoxHolder matchesList'>
            {x[3]}
          </div>
          <div className='rt-td statBoxHolder regionList'>
            {regions[x[2]]}
          </div>
          <div className='rt-td statBoxHolder mmrList'>
            { mmr ? `${mmr.mmr}\u00A0\u00A0\u00A0|\u00A0\u00A0\u00A0${formatPercentile(mmr.percentile)}` : 'Unavailable' }
          </div>
        </div>
      </div>
    )
  }

  render() {
    const status = this.props.playerSearchResults.status
    const results = this.props.playerSearchResults
    console.log(results)
    if (!status && results) {
      if (this.state.sort===4) {
        results.sort((x,y) => {
          let mmrX = x[this.state.sort][this.state.mmrID]
          let mmrY = y[this.state.sort][this.state.mmrID]
          mmrX = mmrX ? mmrX.mmr : 0
          mmrY = mmrY ? mmrY.mmr : 0
          return mmrX < mmrY ? -1 : 1
        })
      } else {
        results.sort((x,y) => x[this.state.sort] < y[this.state.sort] ? -1 : 1)
      }
      if (this.state.reverse) {
        results.reverse()
      }
    }
    return (
      <div className="overall">
        <div className="container-fluid col-12 col-md-10 col-lg-8">
          <div className="ReactTable -striped -highlight">
            <div className="rt-table" >
              <div className="rt-thead -header">
                <div className="rt-tr">
                  <div onClick={() => this.reorder(0,false)} className="rt-th handleList -cursor-pointer">Handle</div>
                  <div onClick={() => this.reorder(3,true)} className="rt-th matchesList -cursor-pointer">Matches</div>
                  <div onClick={() => this.reorder(2,true)} className="rt-th regionList -cursor-pointer">Region</div>
                  <FilterDropDown
                    currentSelection={this.state.mmrType}
                    buttonLabel=''
                    name=''
                    id='mmrSelection'
                    dropdowns={MMRDropdowns}
                    updateFunction={this.reorderMMR}
                    leftComponentRenderer={renderNothing}
                    rightComponentRenderer={renderNothing}
                    renderDropdownName={true}
                    currentID={99}
                    containerClass='regionList -cursor-pointer'
                  />
                </div>
              </div>
              <div className="rt-tbody">
                {!status && results && results.map((x,i) => this.renderItem(x,i))}
                {status && <span>{status===400 ? 'Player handles have at least three characters' : 'Player not found'}</span>}
                {!results && <span>Searching...</span>}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

function mapStateToProps({playerSearchResults}, ownProps) {
  return {...ownProps, playerSearchResults}
}

export default connect(mapStateToProps,{dispatchPlayerSearch})(PlayerPage)
