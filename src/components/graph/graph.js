import * as d3 from "d3"
import React from 'react'

export default (props) => {
  console.log(props)
  const { points, linePoints, graphClass, yLabel, xLabel, xRatio, yRatio, xOff, yOff, title, formatter, noArea, yFormatter, multiLines, colors, lineLabels, bars } = props
  const xStart = 70
  const toMap = points || bars || linePoints || [].concat(...multiLines)
  if (!toMap.length) {
    return <div></div>
  }
  const simple = bars || false
  const xs = toMap.map(e => e[0])
  const ys = toMap.map(e => e[1])
  let xMin = d3.min(xs)
  let xMax = d3.max(xs)
  xMin = bars ? xMin - 0.5 : xMin
  xMax = bars ? xMax + 0.5 : xMax
  const xRange = xMax-xMin
  const yMin = d3.min(ys)
  const yMax = d3.max(ys)
  const yRange = yMax-yMin
  const xPad = xRange*0.0
  const yPad = yRange*0.0
  const xScale = d3.scaleLinear().range([xOff+1, xRatio]).domain([xMin-xPad,xMax+xPad])
  const xTicks = xScale.ticks(8)
  const xTickOffset = xTicks[xTicks.length-1].toString().length > 2 ? 5 : 0
  const xTickRotation = xTicks[xTicks.length-1].toString().length <= 2 ? "rotate(-90)" : "rotate(-45)"
  const yScale =
  d3.scaleLinear().range([yRatio-yOff-1, 0]).domain([yMin-yPad,yMax+yPad])
  const yMaxCoord = yScale(yMin)
  const yTicks = yScale.ticks(5)
  window.myYS = yScale
  let lines, line
  if (linePoints) {
    line = d3.line().curve(d3.curveBasis).x(function(d) { return xScale(d[0]) }).y(function(d) { return yScale(d[1]) })(linePoints)
  }
  if (multiLines) {
    lines =multiLines.map(linePoints => { return d3.line().curve(d3.curveBasis).x(function(d) { return xScale(d[0]) }).y(function(d) { return yScale(d[1]) })(linePoints) })
  }
  return (
    <div className="graphHolder">
      <svg
        className={graphClass}
        viewBox={`0 0 ${xRatio} ${yRatio}`}
        preserveAspectRatio="xMinYMin meet"
      >
        <rect
          width={xRatio-xOff}
          height={yRatio-yOff}
          x={xOff}
          className="graphRect"
        />
        {!simple&&<g transform={`translate(0,${yRatio-yOff})`}>
          {xTicks.map((x,i) => {
            const tick = formatter(x).toString()
            x = xScale(x)
            return (
              <g key={x} transform={`translate(${x},0)`}>
                {<line x1={0} y1={0} x2={0} y2={5} className="tick" />}
                <text
                  y={xTickOffset}
                  x={xTickOffset}
                  className="tickText"
                  transform={xTickRotation}
                  dy=".4em"
                  dx="-.8em"
                >
                  {tick}
                </text>
                <line x1={x} y1={0} x2={x} y2={-(yRatio-yOff)} className="tickLine" />
              </g>
            )
          })}
        </g>}
        {!simple&&yTicks.map((y,i) => {
          const tick = yFormatter ? yFormatter(y) : y
          y = yScale(y)
          return (
            <g key={y}>
              <line x1={xOff-5} y1={y} x2={xOff} y2={y} className="tick" />
              <text x={xOff-10} y={y+20} className="tickText">{tick}</text>
              <line x1={xOff} y1={y} x2={xRatio} y2={y} className="tickLine" />
            </g>
          )
        })}
        {points && points.map((p,i) => {
          return (
            <circle
              key={i}
              cx={xScale(p[0])}
              cy={yScale(p[1])}
              className="graphPoint"
            />
          )
        })}
        {bars && bars.map((p,i) => {
          let [ x, y, stroke ] = p
          x = xScale(x)
          y = yScale(y)
          const style={stroke}
          return (
            <line
              key={x}
              x1={x}
              y1={yMaxCoord}
              x2={x}
              y2={yMaxCoord-y}
              style={style}
              className="barLine"
            />
          )
        })}
        <line x1={xOff} y1={yRatio-yOff} x2={xRatio} y2={yRatio-yOff} className="axisLine" />
        {!simple&&<line x1={xOff} y1={yRatio-yOff} x2={xOff} y2="0" className="axisLine" />}
        {line&&<path d={line} className={noArea ? 'line' : 'areaLine'} />}
        {lines&&lines.map((line,i) => <path key={i} d={line} className='line' style={{stroke:colors[i]}} />)}
        {!simple&&<text x={-yRatio+yOff+20} y={xRatio-10} className="axisText" transform="rotate(-90)">{yLabel}</text>}
        <text x={xOff+10} y={yRatio-yOff-10} className="axisText" >{xLabel}</text>
        <text onMouseEnter={() => { console.log(title) }} x={(xRatio+xOff)/2} y={30} className="graphTitle" >{title}</text>
      </svg>
    </div>
  )
}
