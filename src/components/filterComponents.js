import React from 'react'
import { commify } from '../helpers/smallHelpers'
import { mmrDic } from '../helpers/definitions'

export function renderPeep(selected,x) {
  return <i className={`fa fa-user${selected ? ' fa-lg': '-o'}`} key={x} aria-hidden="true"></i>
}

export function renderCogs(selected, x) {
  return <span><i className="fa fa-cogs iconOnButton" key={x} aria-hidden="true"></i>&nbsp;&nbsp;</span>
}

export function renderPeeps(id) {
  // {this.props.iconList.map(d => this.renderIcon(d))}
  return (
    <span className="starHolder">
      {[0,1,2,3,4].map(x => renderPeep(mmrDic[id].stars.includes(x),x))}
    </span>
  )
}

export function renderTinyHero(id) {
  return <img className="tinyHero" src={`https://heroes.report/squareHeroes/${id}.jpg`}></img>
}

export function renderTime(id) {
  if (!window.builds) {
    return
  }
  return (
    <div className='timeHolder'>
      <div className='timeLabelHolder'>{window.builds[id].name}</div>
      <div className='timeInfoHolder'>
        <div className='dateHolder'>{
          `${window.builds[id].dates[0].toString().slice(4, 10)}
           - ${window.builds[id].dates[1].toString().slice(4, 10)}`
        }</div>
        <div className='replayCountHolder'>{`(${commify(window.builds[id].count)} Replays)`}</div>
      </div>
    </div>
  )
}

export function renderTinyMap(id) {
  return <img className="tinyMap" src={`https://heroes.report/mapPostsTiny/${id}.png`}></img>
}

export function renderNothing() {
}
