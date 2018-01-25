import * as d3 from "d3"
import React from 'react'
import { formatNumber } from '../../helpers/smallHelpers'

export default (props) => {
  const { width, height, tal, count, percent, selected, highlighted } = props
  return (
    <svg className="CalcTalentHolder"
      style={{border:highlighted ? "1px solid #D75813" : "1px solid black"}}
    >
      <rect width={width} height={height} x={1} y={1} className="buildGraphTal" />
      <image width={width-4}
        xlinkHref={`https://heroes.report/singleTalents/${tal}.jpg`}
        x={2} y={2}
        className="buildGraphTal">
      </image>
      <text className="tIcon" x={4} y={93}>&#xf0c0;</text>
      <text className="tIcon" x={6} y={120}>&#xf013;</text>
      <text className="tText" x={26} y={93}>{selected ? formatNumber(count) : "---------"}</text>
      <text className="tText" x={26} y={121}>{selected ? percent : "---------"}</text>
      <rect
        width={width} height={height}
        className="ShadingRect"
        fill="#000"
        style={{opacity:selected ? 0 : 0.8}}
      />
    </svg>
  )
}
