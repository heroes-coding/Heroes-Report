import * as d3 from "d3"
import React from 'react'

let drawArc = function(iRad,oRad,endPercent) {
  return d3.arc().innerRadius(iRad).outerRadius(oRad).startAngle(0).endAngle(Math.PI*2*endPercent)()
}
let emptyArc = drawArc(18,23,1)

export default (props) => {
  return (
    <svg width="38" height="38" className="heroArc">
      <path transform="translate(20, 21)" className="percentPathHolder" d={emptyArc}></path>
      <path transform="translate(20, 21)" fillOpacity={0.3} fill={props.color} d={drawArc(20,21,1)}></path>
    </svg>
  )
}

/*
<img
  className='roundedPort'
  alt={row.original.name}
  src={`https://heroes.report/squareHeroes/${row.value}.jpg`}
  style={{
    'border': `2px solid ${row.original.darkColor}`,
    'visibility': heroes.length ? 'visible' : 'hidden'
  }}
/>
</div>
*/
