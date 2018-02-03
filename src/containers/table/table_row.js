import React, { Component } from 'react'
import Arc from '../../components/arc'
import StatBox from './statBox'
import WLStatBox from './WLstatBox'
import { roundedPercent, formatStat, sToM } from '../../helpers/smallHelpers'
import { updatePreferences, selectTalent } from '../../actions'
import { withRouter } from 'react-router-dom'
import { connect } from 'react-redux'

const display = function(value,s) {
  let display
  if (s === 5) {
    // ban rec rankings
    display = value
  } else if (s === 6) {
    // time
    display = sToM(value)
  } else if (s < 6) {
    // unchanged
    display = formatStat(value)
  } else if (s < 14) {
    // percents
    display = roundedPercent(value)
  } else {
    // raw stats
    display = formatStat(value/100)
  }
  return display
}

class TableRow extends Component {
  constructor(props) {
    super(props)
    this.updateHero = this.updateHero.bind(this)
  }
  updateHero(newHero) {
    this.props.updatePreferences('hero', newHero)
    this.props.selectTalent('reset')
    if (this.props.history.location.pathname.includes('heroes')) {
      this.props.getHeroTalents(newHero,this.props.prefs)
    }
    this.props.history.push(`/heroes/${newHero}`)
  }

  shouldComponentUpdate(nextProps) {
    if (nextProps.showWL !== this.props.showWL || nextProps.id !== this.props.id || this.props.id.length < 4) {
      return true
    }
    return false
  }
  render() {
    const { id, color, name, stats } = this.props.row
    const showWL = this.props.showWL
    const nameStyle = {'color': color}
    return (
      <div id={`row${id}`} className="rt-tr-group">
        <div className="rt-tr">
          <div className="rt-td roundedPort">
            <img
              className='roundedPort'
              alt={name}
              src={`https://heroes.report/squareHeroes/${id}.jpg`}
            />
            <Arc
              dim={38}
              translate="(20,21)"
              color={color}
              id={id}
            />
          </div>
          <div className={`rt-td d-none d-md-block`} >
            <span
              className='heroName'
              style={nameStyle}
              onClick={() => { this.updateHero(id) }}
            >
              {name}
            </span>
          </div>
          {stats && stats.map(stat => {
            let { value, id, lValue, wValue } = stat
            if (showWL && wValue) {
              return (
                <WLStatBox
                  key={stat.id}
                  id={stat.id}
                  cat={this.props.cat}
                  wValue={display(wValue,id)}
                  lValue={display(lValue,id)}
                />
              )
            } else {
              return (
                <StatBox
                  key={stat.id}
                  id={stat.id}
                  cat={this.props.cat}
                  display={display(value,id)}
                  percent={stat.percent}
                />
              )
            }
          }
          )}
        </div>
      </div>
    )
  }
}

function mapStateToProps(state, ownProps) {
  return ownProps
}

export default withRouter(connect(mapStateToProps, {updatePreferences, selectTalent })(TableRow))
