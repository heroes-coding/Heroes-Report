import React from 'react'
import * as d3 from 'd3'

const makeSlider = (that, holderClass, updateFunction, min, max, title, className, xTicks) => {
  if (!d3.select("svg."+className).empty()) {
    d3.select("svg."+className).remove()
  }
  const width = 150
  const height = 30
  const x = d3.scaleLinear().domain([min,max]).range([0,width])
  window.x = x
  const SliderHolder = d3.select("."+holderClass).append("svg")
    .attr("viewBox",`0 0 ${width} ${height}`)
    .attr("class",className)
    .attr("preserveAspectRatio", "none")
  const SliderSVG = SliderHolder.append("svg").attr("width", width).attr("height", height)
  const brush = SliderSVG.append("g")
    .attr("class", "brush")
    .call(d3.brushX()
      .extent([[0, 0], [width, height]])
      .on("end", brushended))
  SliderSVG.selectAll("g").data(xTicks).enter().append("g").append("text").attr("class","sliderTicks")
      .attr("transform","rotate(-90)")
      .attr("dy",function(d) { return x(d) + 5 })
      .attr("dx","-20")
      .text(function(d) { return d })

  function brushended() {
    if (!d3.event.sourceEvent) {
      return // Only transition after input.
    }
    if (!d3.event.selection) {
      updateFunction('reset')
      return
    }
    let d1 =  d3.event.selection
    updateFunction(x.invert(d1[0]),x.invert(d1[1]))
  }
}

class TimeLine extends React.Component {
  componentWillUnmount() {
    d3.select("svg."+this.props.className).remove()
  }
  componentDidUpdate() {
    const { updateFunction, left, right, min, max, title, className, holderClass, info, xTicks } = this.props
    makeSlider(this,holderClass, updateFunction, min, max, title, className, xTicks)
  }
  render() {
    const { updateFunction, left, right, min, max, title, className, holderClass, info, xTicks } = this.props
    return (
      <div className="sliderHolder">
        <div className="sliderResetHolder"><i className="fa fa-undo iconOnButton"
          aria-hidden="true"
          onClick={() => { updateFunction('reset') }}
        ></i></div>
        <div className="sliderTitle">{title}</div>
        <div className="sliderTextRange">{`${left} to ${right}`}</div>
        <div className={holderClass}></div>
        <i title={info} className="fa fa-info-circle infoButton" aria-hidden="true"></i>
      </div>
    )
  }
}

export default TimeLine
