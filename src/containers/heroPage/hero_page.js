import 'react-table/react-table.css'
import React, { Component } from 'react'
import { connect } from 'react-redux'
// import { getHeroTalents } from '../../actions'
import DataFiltersBar from '../../containers/data_filters_bar'
import TalentCalculator from './talentCalculator'
import { HeroStatList, MatchupTable } from '../stat_list/hero_stats'

class HeroHolder extends Component {
  componentDidMount() {
  }
  render() {
    let heroID = this.props.match.params.id
    return (
      <div className="overall">
        <div className="filtersHolder">
          <DataFiltersBar menu={2} />
        </div>
        <div className="row d-flex justify-content-end" id="playerPageHolder">
          <div className="container-fluid col-12 col-md-12 col-lg-9 order-lg-last" id="talentBox">
            <TalentCalculator curHero={heroID} />
            <MatchupTable curHero={heroID} />
          </div>
          <HeroStatList curHero={heroID} />
        </div>
      </div>
    )
  }
}

function mapStateToProps(state, ownProps) {
  return {ownProps}
}

export default connect(mapStateToProps)(HeroHolder)
