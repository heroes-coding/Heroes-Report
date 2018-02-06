import React from 'react'
import * as d3 from 'd3'

const isChrome = (!!window.chrome && !!window.chrome.webstore) || (!!window.opr && !!window.opr.addons) || !!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0
const wheelDefs = {'width':600,'height':600}
wheelDefs.radius = (Math.min(wheelDefs.width, wheelDefs.height) / 2) - 50

function getContrastYIQ(hexcolor) {
  const r = parseInt(hexcolor.substr(1,2),16)
  const g = parseInt(hexcolor.substr(3,2),16)
  const b = parseInt(hexcolor.substr(5,2),16)
  const yiq = ((r*299)+(g*587)+(b*114))/1000
  return (yiq >= 128) ? 'black' : 'white'
}

function addWheelText(wheelGroups,newDepth,isDeath, getArcPath) {
  // this should be a first time only thing
  wheelGroups.append("path").attr("class",(isDeath ? "D" : "") + "wheelTextPaths")
    .attr("id",function(d,i) { return d.depth + "WTP" + i + (isDeath ? "D" : "") }).attr("d",function(d,i) { if (d.depth===0) return "M -75,0 A 75, 75 0 0, 1 75,0"; return getArcPath(d,isDeath) }).attr("fill","none")
  wheelGroups.append("text").append("textPath").style("text-anchor","middle").attr("startOffset", "50%")
    .attr("class",(isDeath ? "D" : "") + "wheelTextPaths").attr("pointer-events","none")
    .attr("xlink:href",function(d,i) { return "#" + d.depth + "WTP" + i + (isDeath ? "D" : "") })
    .attr("font-size",function(d,i) { return 15+10*(Math.max(2-d.depth,0)) })
    .text(function(d) { if (d.depth===0) return d.data.name;var arcSpan = (d.tempx1 - d.tempx0)*d.tempRadius;d.maxLetters = Math.floor(15*(arcSpan/10)/(15+10*(Math.max(2-d.depth,0))));return d.data.name.slice(0,d.maxLetters) })
    .attr("fill",function(d) { if (d.depth===3) return getContrastYIQ(d.data.color);return d.data.color })
    .attr("stroke","none")
    .attr("opacity",function(d) { if (d.depth===3) return 0;return 1 })
}

class Wheel extends React.Component {
  constructor(props) {
    super(props)
    this.makeWheel = this.makeWheel.bind(this)
    this.clickWheel = this.clickWheel.bind(this)
    this.getArcPath = this.getArcPath.bind(this)
    this.getCoordinates = this.getCoordinates.bind(this)
  }
  shouldComponentUpdate() {
    return !this.wheelsOut
  }
  componentWillUnmount() {
    d3.select(this.wheelHolder).remove()
  }
  getArcPath(d) {
    const percY= d.y0+(d.y1-d.y0)*2/5
    const radius = Math.round(this.yWheelScale(percY))
    d.tempRadius = radius
    const start = this.getCoordinates(d.x0,radius)
    const finish = this.getCoordinates(d.x1,radius)
    const curveType = (d.x1-d.x0 >= 0.5 || d.tempx1-d.tempx0 >= Math.PI) ? " 0 1, 1" : " 0 0, 1 "
    return "M " + start[0] + "," + start[1] + " A " + radius + ", " + radius + curveType + finish[0] + "," + finish[1]
  }
  clickWheel(d,SVG,wheelGroups, isDeath) {
    if (!isChrome || this.isAnimating) {
      return
    }
    this.isAnimating = true
    const that = this
    const newDepth = d.depth
    const { arcWheel, getArcPath, xWheelScale, yWheelScale } = this
    wheelGroups.selectAll((isDeath ? ".D" : ".") + "wheelTextPaths").transition().duration(250).attr("opacity",0)
    SVG.transition().duration(750).tween("scale", function() {
      const xd = d3.interpolate(xWheelScale.domain(), [d.x0, d.x1])
      const yd = d3.interpolate(yWheelScale.domain(), [d.y0, 1])
      const yr = d3.interpolate(yWheelScale.range(), [d.y0 ? 50 : 0, wheelDefs.radius])
      return function(t) { xWheelScale.domain(xd(t)); yWheelScale.domain(yd(t)).range(yr(t)) }
    })
      .selectAll((isDeath ? "path.D" : "path.") +"wheelPaths").style("stroke-width",function(e) { return e.depth <= newDepth ? 0 : 2 })
      .attrTween("d", d => { return function() { return arcWheel(d) } })
      .on("end", function(e, i) {
        if (e.x0 >= d.x0 && e.x0 < (d.x1) && e.depth >= newDepth && !(e.depth===3&&newDepth===0)) {
          e.tempRadius = Math.round(yWheelScale(e.y0+(e.y1-e.y0)*2/5)) // pulled from getArcPath
          e.tempArcSpan = (e.tempx1 - e.tempx0)*e.tempRadius
          if (e.depth===0) {
            e.tempArcSpan = 200
          }
          if (e.depth===newDepth) {
            d3.select(this).style("stroke-width",2)
          }
          d3.select(this.parentNode).selectAll((isDeath ? ".D" : ".") + "wheelTextPaths").transition().duration(200).attr("opacity",1)
          d3.select(this.parentNode).select((isDeath ? "path.D" : "path.") +"wheelTextPaths").attr("d",function(d,i) {
            if (e.depth===newDepth) {
              return "M -75,0 A 75, 75 0 0, 1 75,0"
            }
            const newArcPath = getArcPath(e)
            return newArcPath
          })
          d3.select(this.parentNode).select("textPath").style("font-size",function(d,i) {
            return 15+10*(Math.max(2+newDepth-d.depth,0))
          }).text(function() {
            if (e.depth===0) {
              return e.data.name
            }
            e.maxLetters = Math.floor(15*(e.tempArcSpan/10)/(15+10*(Math.max(2+newDepth-e.depth,0))))
            return e.data.name.slice(0,e.maxLetters)
          }).attr("opacity",1)
          that.isAnimating = false
        }
      })
  }
  getCoordinates(percX,radius) {
    const theta = (Math.PI*0.5 - (this.xWheelScale(percX)))%(2*Math.PI)
    return [Math.round(radius*Math.cos(theta)),-Math.round(radius*Math.sin(theta))]
  }
  makeWheel() {
    this.wheelsOut = true
    const that = this
    const xWheelScale = d3.scaleLinear().range([0, 2 * Math.PI])
    this.xWheelScale = xWheelScale
    const yWheelScale = d3.scaleSqrt().range([0, wheelDefs.radius])
    this.yWheelScale = yWheelScale
    const thisDiv = this.div
    this.arcWheel = d3.arc()
      .startAngle(function(d) { d.tempx0 = Math.max(0, Math.min(2 * Math.PI, xWheelScale(d.x0))); return d.tempx0 })
      .endAngle(function(d) { d.tempx1 = Math.max(0, Math.min(2 * Math.PI, xWheelScale(d.x1))); return d.tempx1 })
      .innerRadius(function(d) { d.tempy0 = Math.max(0, yWheelScale(d.y0)); return d.tempy0 })
      .outerRadius(function(d) { d.tempy1 = Math.max(0, yWheelScale(d.y1)); return d.tempy1 })
    this.wheelOut = true
    const { dataRoot, wheelName, isDeath, openPopup, messagePopup } = this.props
    const partition = d3.partition()
    const wheelHolder = d3.select(this.div).append("svg").attr("viewBox",`50 50 ${wheelDefs.width-100} ${wheelDefs.height-100}`).attr("class","wheelSVG")
    this.wheelHolder = wheelHolder
    const wheelSVG = wheelHolder.append("svg").attr("width", wheelDefs.width).attr("height", wheelDefs.height).append("g").attr("transform", "translate(" + wheelDefs.width / 2 + "," + (wheelDefs.height / 2) + ")")
    const wheelGroups = wheelSVG.selectAll("g").data(partition(dataRoot).descendants()).enter().append("g")
    wheelGroups.append("path")
      .attr("d", this.arcWheel).attr("class",(isDeath ? "D" : "") + "wheelPaths").style("fill", function(d,i) { return d.parent ? d.data.color : "#000000" })
      .attr("opacity",function(d,i) { return d.depth > 2 ? 1 : 0.15 })
      .style("stroke","#000").style("stroke-width",2)
      .on("click", (d) => { this.clickWheel(d,wheelSVG,wheelGroups,isDeath) })
      .each((d,i) => {
        if (!i) {
          this.clickWheel(d,wheelSVG,wheelGroups,isDeath)
        }
      })
      .on('mouseenter', function(d) {
        if (that.isAnimating) {
          return
        }
        const [ xCoord, yCoord ] = d3.mouse(this)
        const box = thisDiv.getBoundingClientRect()
        let x, y, popupName, popupDesc, popupPic
        x = (xCoord + 250)*box.width/500
        y = (yCoord + 250)*box.height/500 + box.top
        if (d.depth===0) {
          popupName = 'Wheel of ' + wheelName
          popupDesc = isChrome ? 'Click on or hover over the arcs for more detail' : 'Hover over the arcs for more detail (animations disabled for non-Chrome engine browsers because of buggy text and animations)'
        } else if (d.depth===1) {
          const val = Math.round(d.value)
          if (isDeath) {
            popupName = `${d.data.team ? "Enemies" : "Allies"}: ${val}`
            popupDesc = `${d.data.team ? "The enemy" : "The allied"} team had ${val} total deaths`
          } else {
            popupName = `${d.data.team ? "Enemies" : "Allies"}: ${val}`
            popupDesc = `${d.data.team ? "The enemy" : "The allied"} team had ${val} cumulative takedowns / kill participations`
          }
        } else if (d.depth===2) {
          const val = Math.round(d.value)
          if (isDeath) {
            popupName = `${d.data.you ? d.data.pname + "'s " + d.data.name: (d.data.team ? "Enemy " : "Ally ") + d.data.name}: ${val}`
            popupDesc = `${d.data.name + " (" + d.data.pname + ")"} died ${val} times`
          } else {
            popupName = `${d.data.you ? d.data.pname + "'s " + d.data.name: (d.data.team ? "Enemy " : "Ally ") + d.data.name}: ${val}`
            popupDesc = `${d.data.name + " (" + d.data.pname + ")"} had ${val} takedowns against the ${!d.data.team ? "enemy" : "allied"} team`
          }
        } else {
          const val = Math.round(100*d.value)/100
          if (isDeath) {
            popupName = `${d.data.name} vs. ${d.parent.data.name} - ${val}`
            popupDesc = `${d.data.name} (${d.data.pname}) contributed ${val} of ${d.parent.data.name}'s deaths`
          } else {
            popupName = `${d.parent.data.name} vs. ${d.data.name} - ${val}`
            popupDesc = `${d.parent.data.name} (${d.parent.data.pname}) had ${val} takedowns against ${d.data.name}`
          }
        }
        openPopup(null,null, popupName, popupDesc, popupPic,false, 50, y)
      })
      .on('mouseout', function(d,i) {
        messagePopup()
      })
    addWheelText(wheelGroups,0, isDeath,this.getArcPath)
  }
  render() {
    return (
      <div ref={div => { this.div = div }} className="wheelHolder">
        {this.div&& this.makeWheel()}
      </div>
    )
  }
}

export default Wheel
