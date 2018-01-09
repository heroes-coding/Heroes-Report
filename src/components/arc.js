import * as d3 from "d3"
import React from 'react'

let drawArc = function(iRad,oRad,endPercent) {
  return d3.arc().innerRadius(iRad).outerRadius(oRad).startAngle(0).endAngle(Math.PI*2*endPercent)()
}
export default (props) => {
  const half = Math.round(props.dim/2)
  return (
    <svg width={props.dim} height={props.dim} className={props.extraClass ? props.extraClass : "heroArc"}>
      <path transform={`translate${props.translate}`} className="percentPathHolder" d={drawArc(half,half+3,1)}></path>
      <path transform={`translate${props.translate}`} fillOpacity={0.3} fill={props.color} d={drawArc(half+1,half+2,1)}></path>
    </svg>
  )
}
