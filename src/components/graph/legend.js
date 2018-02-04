import * as d3 from "d3"
import React from 'react'

export default (props) => {
  let { data, xRatio, yRatio, legendClass } = props
  const xScale = d3.scaleLinear().range([0, xRatio]).domain([-0.5,data.length+0.5])
  const yScale =
  d3.scaleLinear().range([0, yRatio]).domain([0.475,0.55])
  return (
    <div className="legendHolder">
      <svg
        className={legendClass}
        viewBox={`0 0 ${xRatio} ${yRatio}`}
        preserveAspectRatio="xMinYMin meet"
      >
        <rect
          width={xRatio}
          height={yRatio}
          className="legendRect"
        />
        {data.map((d,i) => {
          const { color, pic, label } = d
          const stroke={stroke: color}
          const fill = {fill:color}
          return (
            <g key={label} transform={`translate(${xScale(i+1)},${yScale(0.5)})`}>
              <circle
                cx={10}
                cy={-10}
                r={5}
                style={fill}
              />
              <text
                className="legendText"
                x={0}
                y={0}
                transform="rotate(-30)"
                style={fill}
              >{label}</text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}
