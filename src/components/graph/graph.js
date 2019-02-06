import * as d3 from "d3"
import React from 'react'
import Popup from '../popup'

class Graph extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      popupOpen:false,
      updateRusty:0,
      popupY:5,
      popupName: '',
      popupDesc: '',
      popupPic: '',
    }
    this.openPopup = this.openPopup.bind(this)
    this.closePopup = this.closePopup.bind(this)
    this.messagePopup = this.messagePopup.bind(this)
  }
  openPopup(x,y, popupName, popupDesc, popupPic,isTalent) {
    if (this.popupTimeout) {
      clearTimeout(this.popupTimeout)
      this.popupTimeout = null
    }
    const { xRatio, yRatio } = this.props
    const bRect = this.div.getBoundingClientRect()
    const { width, height } = bRect
    const xPerc = width/xRatio*0.8

    x = x*xPerc
    y = y*height/yRatio+85
    this.setState({
      ...this.state,
      popupOpen:true,
      popupX: x,
      popupY:y,
      popupName,
      popupDesc,
      popupPic,
    })
  }
  componentWillUnmount() {
    if (this.popupTimeout) {
      clearTimeout(this.popupTimeout)
    }
  }
  messagePopup() {
    this.popupTimeout = setTimeout(this.closePopup, 500)
  }
  closePopup() {
    this.visualChange = true
    this.setState({
      ...this.state,
      popupOpen:false,
    })
  }
  render() {
    const props = this.props
    let { singlePoint, midline, points, linePoints, graphClass, yLabel, xLabel, xRatio, yRatio, xOff, yOff, title, formatter, noArea, yFormatter, multiLines, colors, lineLabels, bars, yMax, step, xMin, xMax, yMin, containerClass, labelPoints, stackedBars, errorBars } = props
    if (bars) {
      console.log({bars})
    }
    let toMap = points || bars || linePoints || [].concat(...multiLines)
    toMap = toMap.filter(x => x)
    if (!toMap.length) {
      return <div></div>
    }
    const simple = bars || false
    const xs = toMap.map(e => e[0])
    const ys = toMap.map(e => e[1])
    if (xMin===undefined) {
      xMin = d3.min(xs)
    }
    if (xMax===undefined) {
      xMax = d3.max(xs)
    }
    xMin = bars ? xMin - 0.5 : xMin
    xMax = bars ? xMax + 0.5 : xMax
    const xRange = xMax-xMin
    if (yMin===undefined) {
      yMin = bars ? 0 : errorBars ? d3.min(errorBars.map(y => y[1])): d3.min(ys)
    }
    if (yMax===undefined) {
      yMax = errorBars ? d3.max(errorBars.map(y => y[2])) : d3.max(ys.filter(y => y < Infinity))
    }
    const yRange = yMax-yMin
    const xPad = xRange*0.025
    const yPad = yRange*0.025
    const xScale = d3.scaleLinear().range([toMap.length === 1 ? xRatio/2 : xOff+1, xRatio]).domain([xMin-xPad,xMax+xPad])
    const xTicks = xScale.ticks(8)
    if (xTicks.length < 3 && !singlePoint) {
      return <div></div>
    }
    const xTickOffset = xTicks[xTicks.length-1].toString().length > 2 ? 5 : 0
    const xTickRotation = xTicks[xTicks.length-1].toString().length <= 2 ? "rotate(-90)" : "rotate(-45)"
    const yScale =
    d3.scaleLinear().range([yRatio-yOff-1, 0]).domain([yMin-yPad,yMax+yPad])
    const yMaxCoord = yScale(yMin)
    let yTicks = yScale.ticks(5)
    let usedTicks = []
    window.myYS = yScale
    let lines, line
    if (linePoints) {
      line = d3.line().curve(step ? d3.curveStepBefore : d3.curveCatmullRom).x(function(d) { return xScale(d[0]) }).y(function(d) { return yScale(d[1]) })(linePoints)
    }
    if (multiLines) {
      lines =multiLines.map(linePoints => {
        return (
          d3.line().curve(step ? d3.curveStepBefore : d3.curveCatmullRom).x(function(d) { return xScale(d[0]) }).y(function(d) { return yScale(d[1]) })(linePoints)
        )
      })
    }
    window.xScale = xScale
    return (
      <div ref={div => { this.div = div }} className={containerClass || "graphHolder"}>
        {labelPoints&&<Popup
          name={this.state.popupName}
          desc={this.state.popupDesc}
          extendedDesc={this.state.popupExtendedDesc}
          classo="graphPopup"
          open={this.state.popupOpen}
          x={this.state.popupX}
          y={this.state.popupY}
          pic={this.state.popupPic}
        />}
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
                  <line x1={0} y1={0} x2={0} y2={-(yRatio-yOff)} className="tickLine" />
                </g>
              )
            })}
          </g>}
          {!simple&&yTicks.reverse().map((y,i) => {
            const tick = yFormatter ? yFormatter(y) : y
            if (usedTicks.includes(tick)) {
              return <g key={i}></g>
            }
            usedTicks.push(tick)
            y = yScale(y)
            return (
              <g key={y}>
                <line x1={xOff-5} y1={y} x2={xOff} y2={y} className="tick" />
                <text x={xOff-10} y={y+5} className="tickText">{tick}</text>
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
          {errorBars && errorBars.map((p,i) => {
            let [ x, yMin, yMax ] = p
            x = xScale(x)
            return (
              <g key={x}>
                <line
                  x1={x}
                  y1={yScale(yMin)}
                  x2={x}
                  y2={yScale(yMax)}
                  className="errorBar"
                />
                <line
                  x1={x-5}
                  y1={yScale(yMax)}
                  x2={x+5}
                  y2={yScale(yMax)}
                  className="errorBar"
                />
                <line
                  x1={x-5}
                  y1={yScale(yMin)}
                  x2={x+5}
                  y2={yScale(yMin)}
                  className="errorBar"
                />
              </g>
            )
          })}
          {bars && bars.map((p,i) => {
            let [ x, y, stroke, hero ] = p
            x = xScale(x)
            const yCoord = yScale(y > yMax ? yMax : y)
            const style={stroke}
            const yVal = yFormatter(y)
            return (
              <g key={x}>
                <line
                  x1={x}
                  y1={yMaxCoord}
                  x2={x}
                  y2={yCoord}
                  style={style}
                  className="barLine"
                  onMouseEnter={(event) => {
                    event.preventDefault()
                    const { pageX, pageY } = event
                    this.props.openPopup(pageX,pageY,`${window.HOTS.nHeroes[hero]} - ${yVal}`,`(${title})`,this.div,'bar')
                  }}
                  onMouseLeave={(event) => {
                    event.preventDefault()
                    this.props.messagePopup()
                  }}
                />
                <text className="barText" x={x} y={yMaxCoord+25}>{yVal}</text>
              </g>
            )
          })}
          {labelPoints && labelPoints.map((p,i) => {
            const { name, desc, size, color } = p
            const style={fill: color, r:size, cursor: "pointer"}
            const x = xScale(p[0])

            const y = yScale(p[1])
            return (
              <circle
                key={i}
                style={style}
                cx={x}
                cy={y}
                className="graphPoint"
                onMouseEnter={(event) => {
                  event.preventDefault()
                  this.openPopup(x,y,name,desc,null,true)
                }}
                onMouseLeave={(event) => {
                  event.preventDefault()
                  this.messagePopup()
                }}
              />
            )
          })}
          {stackedBars && stackedBars.map(t => {
            return t.map((bars,c) => {
              return bars.map((b,i) => {
                let { x, y0, y1 } = b
                x = xScale(x)
                y0 = yScale(y0)
                y1 = yScale(y1)
                const style ={stroke: colors[c+2]}
                return (
                  <line
                    key={i}
                    x1={x}
                    y1={y0}
                    x2={x}
                    y2={y1}
                    style={style}
                    className="XPBarLine"
                  />
                )
              })
            })
          })}
          <line x1={xOff} y1={yRatio-yOff} x2={xRatio} y2={yRatio-yOff} className="axisLine" />
          {midline && <line x1={xOff} y1={yScale(midline)-yOff} x2={xRatio} y2={yRatio-yOff} className="midLine" />}
          {!simple&&<line x1={xOff} y1={yRatio-yOff} x2={xOff} y2="0" className="axisLine" />}
          {line&&<path d={line} className={noArea ? 'line' : 'areaLine'} />}
          {lines&&lines.map((line,i) => <path key={i}d={line} className='line multiline' style={{stroke:colors[i]}} />)}
          {lineLabels&&lineLabels.map((lineLabel,i) => {
            const fill = {fill:colors[i]}
            const xO = 15
            const yO = 45
            return (
              <g key={i}>
                <circle
                  className="legendPoint"
                  cx={xOff+xO}
                  cy={yO+25*i}
                  r={8}
                  style={fill}
                />
                <text
                  x={xOff+xO+18}
                  y={yO+5+25*i}
                  className="legendText"
                >{lineLabel}</text>
              </g>
            )
          })}
          {!simple&&<text x={-yRatio+yOff+20} y={xRatio-10} className="axisText" transform="rotate(-90)">{yLabel}</text>}
          <text x={xOff+10} y={yRatio-yOff-10} className="axisText" >{xLabel}</text>
          <text onMouseEnter={() => { console.log(title) }} x={(xRatio+xOff)/2} y={bars ? 35 : 30} className="graphTitle" >{title}</text>
        </svg>
      </div>
    )
  }
}

export default Graph
