import 'react-table/react-table.css'
import React, { Component } from 'react'
import { connect } from 'react-redux'
import { updateToken } from '../../actions'
// import { getHeroTalents } from '../../actions'
import DataFiltersBar from '../../containers/data_filters_bar'
import AdvancedTable from './advanced_table'
import OauthPopup from './oauth_popup'

class Advanced extends Component {
  componentDidMount() {
    window.addEventListener("message", event => {
      console.log({data: event.data}, event.data.VIP)
    }, false)
    console.log('advanced mounted')
    const pathname = window.location.pathname
    if (pathname !== '/advanced') {
      try {
        const [ id, temppassword, vip ] = window.location.pathname.split('advanced/')[1].split(',')
        this.props.updateToken({id, temppassword, vip})
      } catch (e) {
        console.log(e)
      }
    }
  }
  render() {
    let heroID = this.props.match.params.id
    if (!window.HOTS) {
      return (
        <div className="overall">
          <div className="filtersHolder">
            <DataFiltersBar menu={2} />
          </div>
        </div>
      )
    } else {
      if (isNaN(heroID)) {
        heroID = window.HOTS.heroDic[heroID]
      }
    }
    return (
      <div className="overall">
        <div className="filtersHolder">
          <DataFiltersBar menu={3} />
        </div>
        {false&&<OauthPopup><div>Click me to open a Popup</div></OauthPopup>}
        <div className="row d-flex justify-content-end" id="playerPageHolder">
          <div className="container-fluid col-12 col-md-12 col-lg-12 order-lg-last" id="talentBox">
            <AdvancedTable />
          </div>
        </div>
      </div>
    )
  }
}

function mapStateToProps({ HOTS }, ownProps) {
  return {ownProps, HOTS}
}

export default connect(mapStateToProps, {updateToken})(Advanced)
