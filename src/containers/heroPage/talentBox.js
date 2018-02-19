import * as d3 from "d3"
import React from 'react'
import { formatNumber } from '../../helpers/smallHelpers'

export default (props) => {
  const { width, height, tal, count, percent, selected, highlighted, popularityBar, winrateBar } = props
  return (
    <svg className="CalcTalentHolder"
      style={{border:highlighted ? "1px solid #D75813" : "1px solid black"}}
    >
      <rect width={width-2} height={height-2} x={1} y={1} className="buildGraphTal" />
      <image width={width-4}
        xlinkHref={`https://heroes.report/singleTalents/${tal}.jpg`}
        x={1} y={1}
        className="buildGraphTal">
      </image>
      <text className="tIconP" x={4} y={93}>&#xf0c0;</text>
      <text className="tIconW" x={6} y={121}>&#xf013;</text>
      <text className="tText" x={26} y={93}>{selected ? formatNumber(count) : "---------"}</text>
      <text className="tText" x={26} y={121}>{selected ? percent : "---------"}</text>
      <rect
        width={width} height={height}
        className="ShadingRect"
        fill="#000"
        style={{opacity:selected ? 0 : 0.8}}
      />
      {selected&&<rect
        width={(width-8)*popularityBar}
        className="popularityBar"
        height={3}
        x={4}
        y={98}
      />}
      {selected&&<rect
        width={(width-8)*winrateBar}
        className="winrateBar"
        height={3}
        x={4}
        y={126}
      />}
      {false&&selected&&<rect
        width={3}
        className="popularityBar"
        height={(height-1)*popularityBar}
        x={-4}
        y={height-height*popularityBar}
      />}
      {false&&selected&&<rect
        width={3}
        className="winrateBar"
        height={height*winrateBar}
        x={width+1}
        y={height-height*winrateBar-1}
      />}
    </svg>
  )
}
