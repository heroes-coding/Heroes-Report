import React, { Component } from 'react'
import { connect } from 'react-redux'

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
  render() {
    const { id, color, name, stats, rowClass } = this.props.row
    const { nameRenderer, picRenderer, cellRenderer } = this.props
    return (
      <div id={id} className={rowClass}>
        <div className="rt-tr">
          {picRenderer(id,color)}
          {nameRenderer(id,name,color)}
          {stats && stats.map(stat => {
            let { value, id } = stat
            return cellRenderer(value,id)
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

export default connect(mapStateToProps, {})(TableRow)
