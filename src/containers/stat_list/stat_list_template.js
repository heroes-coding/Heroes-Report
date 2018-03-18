import React from 'react'
const spacesLeft = 18
const spacesMiddle = 7

let getSpace = function(spaces) {
  if (spaces<0) {
    return ""
  }
  return Array(spaces).fill('\u00A0').join("")
}

export default (props) => {
  const { title, subTitle, data, graphs, clickFunction, dropdown } = props
  return (
    <div className='statItem col-12 col-sm-6 col-lg-12'>
      <div className='handleHolder statBarHolder statBarTitle'>
        {title}
        {title&&<br />}
        <div className='statListDropdown'>{dropdown}</div>
        {subTitle&&<span id="winrate"><i
          className="fa fa-line-chart"
          aria-hidden="true"
          onClick={() => clickFunction('winrate', 'Win rate')}
        />&nbsp;{subTitle}</span>}
      </div>
      {graphs}
      {data.map((c,ci) => {
        const { category, left, right, hasGraphs, stats, title } = c
        if (!stats.length) {
          return <div key={ci}></div>
        }
        return (
          <div key={ci} >
            {title&&<div className='statBarHolder statBarMiniTitle'>{title}</div>}
            <div className='statBarHolder statBarTitle'>
              {hasGraphs ? getSpace(1) : getSpace(2)}
              <span className="underline">{category}</span>
              {getSpace(spacesLeft-category.length-3)}
              <span className="underline">{left}</span>
              {getSpace(spacesMiddle-left.length)}
              <span className="underline">{right}</span>
            </div>
            {stats.map((x,i) => {
              const { name, left, right, statName } = x
              if ((!isNaN(left) && !parseInt(left) && !parseInt(right)) || right==="0:00") {
                return <div key={i}></div>
              }
              if (!name || !left || !right) return <div key={i}></div>
              console.log(name,statName,left,right)
              const spaceLeft = spacesLeft - name.length - left.length
              const spaceMiddle = spacesMiddle-right.length
              return (
                <div className='statBarHolder' key={name}>
                  {hasGraphs ? <i
                    className="fa fa-line-chart"
                    aria-hidden="true"
                    onClick={() => clickFunction(statName, name)}
                  /> : null}
                  {hasGraphs ? getSpace(1) : getSpace(2)}
                  <span className="statName">{name}:</span>
                  {getSpace(spaceLeft)}
                  <span className="statValue">{left}</span>
                  {getSpace(spaceMiddle)}
                  <span className="stdValue">{right}</span>
                </div>
              )
            })}
          </div>
        )
      })}
    </div>
  )
}
