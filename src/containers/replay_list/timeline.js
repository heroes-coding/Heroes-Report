import React from 'react'
import * as d3 from 'd3'
import { connect } from 'react-redux'
import { minSinceLaunchToDate, DateToMSL } from '../../helpers/smallHelpers'
import { getHOTSDictionary, updateTime } from '../../actions'

class TimeLine extends React.Component {
  constructor(props) {
    super(props)
    this.makeTimeLine = this.makeTimeLine.bind(this)
    this.udpateDates = this.updateDates.bind(this)
    this.resetDates = this.resetDates.bind(this)
  }
  shouldComponentUpdate(nextProps) {
    if (this.props.minMSL !== nextProps.minMSL || !this.timelineOut) {
      return true
    }
    return false
  }
  updateDates(newStart,newEnd) {
    this.props.updateTime([DateToMSL(newStart),DateToMSL(newEnd)+1439,newStart,newEnd])
  }
  resetDates() {
    this.props.updateTime('reset',null)
  }
  componentWillUnmount() {
    d3.select(this.TimeLineHolder).remove()
  }
  makeTimeLine() {
    const { minMSL, maxMSL } = this.props
    const that = this
    if (maxMSL < minMSL || !this.props.buildsList) {
      return <div></div>
    }
    if (!d3.select(".TimeLineSVG").empty()) {
      d3.select(".TimeLineSVG").remove()
    }
    this.timelineOut = true
    const minDate = minSinceLaunchToDate(minMSL)
    const maxDate = minSinceLaunchToDate(maxMSL)
    const width = 1000
    const height = 50
    const x = d3.scaleTime().domain([minDate, maxDate]).rangeRound([0, width])
    const TimeLineHolder = d3.select(this.div).append("svg")
      .attr("viewBox",`0 0 ${width} ${height}`)
      .attr("class","TimeLineSVG")
      .attr("preserveAspectRatio", "none")
    this.TimeLineHolder = TimeLineHolder
    const TimeLineSVG = TimeLineHolder.append("svg").attr("width", width).attr("height", height)
    const bList = this.props.buildsList
    const builds = []
    const nBuilds = bList.length
    let minIndex
    for (let b=0;b<nBuilds;b++) {
      const build = bList[b]
      if (build.dates[2] > minDate) {
        minIndex = b
        break
      }
    }
    let start = 0
    for (let b=minIndex;b<nBuilds;b++) {
      const build = bList[b]
      const [ min, max, mid ] = build.dates
      let { name, id, count } = build
      let color = "none"
      let label = ""
      if (window.HOTS.heroReleases.hasOwnProperty(id)) {
        const hero = window.HOTS.heroReleases[id]
        label = window.HOTS.nHeroes[hero]
        color = window.HOTS.darkColors[hero]
      }
      const start = x(min)
      builds.push({
        x0: start > 0 ? start : 0,
        x1: x(max),
        color,
        name,
        label,
        count
      })
    }
    const buildRects = TimeLineSVG.selectAll("g").data(builds).enter().append("g")
      .attr("transform", function(d) { return `translate(${d.x0},0)` })
    // buildRects.attr("x", function(d) { return d.x0 })
    // .attr("transform", function(d) { return `translate(${d.x0},0)` })
    const brush = TimeLineSVG.append("g")
      .attr("class", "brush")
      .call(d3.brushX()
        .extent([[0, 0], [width, height]])
        .on("end", brushended))
    buildRects.append("rect").attr("class","buildHolders")
      .attr("width",function(d) { return d.x1-d.x0 })
      .attr("height","100%")
      .attr("fill",function(d) { return d.color })
      .on('mouseenter', function(d) {
        console.log(d.name)
      })
    buildRects.append("text").attr("class","timeText")
      .attr("transform","rotate(-90)")
      .text(function(d) { return d.label })
      .attr("dy",function(d) { return (d.x1-d.x0)/2 + 4 })
      .attr("dx","-45")
    buildRects.on('mousedown', function(d) {
      const click = new window.Event('mousedown')
      click.pageX = d3.event.pageX
      click.clientX = d3.event.clientX
      click.pageY = d3.event.pageY
      click.clientY = d3.event.clientY
      brush.dispatchEvent(click)
    })

    function brushended() {
      if (!d3.event.sourceEvent) {
        return // Only transition after input.
      }
      if (!d3.event.selection) {
        that.resetDates()
        return //
      }
      let d0 = d3.event.selection.map(x.invert)
      let d1 = d0.map(d3.timeDay.round)
      // If empty when rounded, use floor & ceil instead.
      if (d1[0] >= d1[1]) {
        d1[0] = d3.timeDay.floor(d0[0])
        d1[1] = d3.timeDay.ceil(d1[0])
      }
      d3.select(this).transition().call(d3.event.target.move, d1.map(x))
      that.updateDates(d1[0],d1[1])
    }
  }
  render() {
    return (
      <div ref={div => { this.div = div }} className="timelineHolder">
        {this.div && this.makeTimeLine()}
      </div>
    )
  }
}

const mapStateToProps = state => {
  return {
    buildsList: state.HOTS.buildsArray,
    prefs: state.prefs
  }
}

export default connect(mapStateToProps,{getHOTSDictionary, updateTime})(TimeLine)
