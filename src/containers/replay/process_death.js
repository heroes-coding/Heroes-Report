import * as d3 from 'd3'

const getWheelData = function(yourTeam,slot,heroes, deaths) {
  const { nickNames, nHeroes, ColorsDic, normalColors } = window.HOTS
  const deathData = {
    'name':'Wheel of Death',
    "children":[
      {'name':'Allies','color':"#00ff00",'children':[],'team':0},
      {'name':'Enemies','color':"#ff0000",'children':[],'team':1},
    ]}
  const murderData = {
    'name':'Wheel of Murder',
    "children":[
      {'name':'Allies','color':"#00ff00",'children':[],'team':0},
      {'name':'Enemies','color':"#ff0000",'children':[],'team':1},
    ]}

  // change to correct slot order, or suffer the consequences
  for (let h=0;h<10;h++) {
    const team = yourTeam === Math.floor(h/5) ? 0 : 1
    const hero = heroes[h][0]
    const name = heroes[h][3]
    murderData.children[team].children.push({'nick':nickNames[hero],'pname':name,'name':nHeroes[hero],'color':ColorsDic[hero],'children':[],'you':h===slot,'team':team})
    deathData.children[team].children.push({'nick':nickNames[hero],'pname':name,'name':nHeroes[hero],'color':ColorsDic[hero],'children':[],'you':h===slot,'team':team})
    for (var o=0;o<5;o++) {
      const oh = (1-Math.floor(h/5))*5 + o
      const otherHero = heroes[oh][0]
      const otherName = heroes[oh][3]
      murderData.children[team].children[h%5].children.push({'pname':otherName,'name':nHeroes[otherHero],'color':normalColors[otherHero],'size':0,'times':[],'you':o===slot,'team':team-1})
      deathData.children[team].children[h%5].children.push({'pname':otherName,'name':nHeroes[otherHero],'color':normalColors[otherHero],'size':0,'times':[],'takedowns':0,'you':o===slot,'team':team-1})
    }
  }
  for (let p=0;p<10;p++) {
    const pDeaths = deaths[p]
    for (let d=0;d<pDeaths.length;d++) {
      const TOD = pDeaths[d][0]
      const killers = pDeaths[d][3]
      for (let k=0;k<killers.length;k++) {
        const killer = killers[k]
        if (killer <0 || killer > 9) {
          continue // sometimes, killer is -1.
        }
        const killersTeam = Math.floor(killer/5) === yourTeam ? 0 : 1
        const diersTeam = 1 - killersTeam
        murderData.children[killersTeam].children[killer%5].children[p%5].size += 1
        deathData.children[diersTeam].children[p%5].children[killer%5].size += 1/killers.length
        deathData.children[diersTeam].children[p%5].children[killer%5].takedowns += 1
        murderData.children[killersTeam].children[killer%5].children[p%5].times.push(TOD)
        deathData.children[diersTeam].children[p%5].children[killer%5].times.push(TOD)
      }
    }
  }
  let deathRoot = d3.hierarchy(deathData)
  deathRoot.sum(function(d) { return d.size })
  let murderRoot = d3.hierarchy(murderData)
  murderRoot.sum(function(d) { return d.size })
  return { murderData, deathData, deathRoot, murderRoot }
}

export { getWheelData }

/*
var wheelDefs = {'width':600,'height':600,'yOffset':XPGraph.yOffset+XPGraph.height + XPGraph.padding,'padding':10}
wheelDefs.radius = (Math.min(wheelDefs.width, wheelDefs.height) / 2) - 50

var xWheelScale = d3.scaleLinear().range([0, 2 * Math.PI]);
var yWheelScale = d3.scaleSqrt().range([0, wheelDefs.radius]);
var xWheelDeathScale = d3.scaleLinear().range([0, 2 * Math.PI]);
var yWheelDeathScale = d3.scaleSqrt().range([0, wheelDefs.radius]);

function getCoordinates (percX,radius,isDeath) {
  var theta = (Math.PI*0.5 - (isDeath ? xWheelDeathScale (percX) : xWheelScale (percX)))%(2*Math.PI)
  return [Math.round(radius*Math.cos(theta)),-Math.round(radius*Math.sin(theta))]
}

function getArcPath (d,isDeath) {
  var percY= d.y0+(d.y1-d.y0)*2/5
  var radius = Math.round( isDeath ? yWheelDeathScale(percY) : yWheelScale(percY))
  d.tempRadius = radius
  var start = getCoordinates(d.x0,radius, isDeath)
  var finish = getCoordinates(d.x1,radius, isDeath)
  var curveType = (d.x1-d.x0 >= 0.5 || d.tempx1-d.tempx0 >= Math.PI) ? " 0 1, 1" : " 0 0, 1 "
  return "M " + start[0] + "," + start[1] + " A " + radius + ", " + radius + curveType + finish[0] + "," + finish[1]
}


var wheelColors = d3.scaleOrdinal(d3.schemeCategory20);
var deathPartition = d3.partition();
var murderPartition = d3.partition();

var arcWheel = d3.arc()
  .startAngle(function(d) { d.tempx0 = Math.max(0, Math.min(2 * Math.PI, xWheelScale(d.x0))); return d.tempx0 })
  .endAngle(function(d) { d.tempx1 = Math.max(0, Math.min(2 * Math.PI, xWheelScale(d.x1))); return d.tempx1 })
  .innerRadius(function(d) { d.tempy0 = Math.max(0, yWheelScale(d.y0)); return d.tempy0 })
  .outerRadius(function(d) { d.tempy1 = Math.max(0, yWheelScale(d.y1)); return d.tempy1 });
var arcDeathWheel = d3.arc()
  .startAngle(function(d) { d.tempx0 = Math.max(0, Math.min(2 * Math.PI, xWheelDeathScale(d.x0))); return d.tempx0 })
  .endAngle(function(d) { d.tempx1 = Math.max(0, Math.min(2 * Math.PI, xWheelDeathScale(d.x1))); return d.tempx1 })
  .innerRadius(function(d) { d.tempy0 = Math.max(0, yWheelDeathScale(d.y0)); return d.tempy0 })
  .outerRadius(function(d) { d.tempy1 = Math.max(0, yWheelDeathScale(d.y1)); return d.tempy1 });

function getContrastYIQ(hexcolor){
  var r = parseInt(hexcolor.substr(1,2),16);
  var g = parseInt(hexcolor.substr(3,2),16);
  var b = parseInt(hexcolor.substr(5,2),16);
  var yiq = ((r*299)+(g*587)+(b*114))/1000;
  return (yiq >= 128) ? 'black' : 'white';
}


function addWheelText(wheelGroups,newDepth,isDeath) {
  // this should be a first time only thing
  wheelGroups.append("path").attr("class","wheelTextPaths")
    .attr("id",function(d,i) {return d.depth + "WTP" + i + (isDeath ? "D" : "") }).attr("d",function(d,i) {if (d.depth===0) return "M -75,0 A 75, 75 0 0, 1 75,0"; return getArcPath(d,isDeath) }).attr("fill","none")
  wheelGroups.append("text").append("textPath").style("text-anchor","middle").attr("startOffset", "50%")
    .attr("class","wheelTextPaths").attr("pointer-events","none")
    .attr("xlink:href",function(d,i){return "#" + d.depth + "WTP" + i + (isDeath ? "D" : "")})
    .attr("font-family","Roboto Condensed").attr("font-size",function(d,i) {return 15+10*(Math.max(2-d.depth,0))})
    .text(function(d){if (d.depth===0) return d.data.name;var arcSpan = (d.tempx1 - d.tempx0)*d.tempRadius;d.maxLetters = Math.floor(15*(arcSpan/10)/(15+10*(Math.max(2-d.depth,0))));return d.data.name.slice(0,d.maxLetters)  })
    .attr("fill",function(d) {if (d.depth===3) return getContrastYIQ(d.data.color);return d.data.color})
    .attr("stroke","none")
    .attr("opacity",function(d) {if (d.depth===3) return 0;return 1})
}



function clickWheel(d,SVG,wheelGroups,isDeath) {
  var newDepth = d.depth
  wheelGroups.selectAll(".wheelTextPaths").transition().duration(250).attr("opacity",0)
  SVG.transition().duration(750).tween("scale", function() {
    if (isDeath) {
    var xd = d3.interpolate(xWheelDeathScale.domain(), [d.x0, d.x1]),
      yd = d3.interpolate(yWheelDeathScale.domain(), [d.y0, 1]),
      yr = d3.interpolate(yWheelDeathScale.range(), [d.y0 ? 50 : 0, wheelDefs.radius]);
    }
    else {
    var xd = d3.interpolate(xWheelScale.domain(), [d.x0, d.x1]),
      yd = d3.interpolate(yWheelScale.domain(), [d.y0, 1]),
      yr = d3.interpolate(yWheelScale.range(), [d.y0 ? 50 : 0, wheelDefs.radius]);
    }
    if (isDeath)
    return function(t) {xWheelDeathScale.domain(xd(t)); yWheelDeathScale.domain(yd(t)).range(yr(t)); };
    else
    return function(t) {xWheelScale.domain(xd(t)); yWheelScale.domain(yd(t)).range(yr(t)); };
    })
  .selectAll("path.wheelPaths").style("stroke-width",function(e) {return e.depth <= newDepth ? 0 : 2})
    .attrTween("d", function(d) { return function() { return isDeath ? arcDeathWheel(d) : arcWheel(d); }; })
    .on("end", function(e, i) {
    if (e.x0 >= d.x0 && e.x0 < (d.x1) && e.depth >= newDepth && !(e.depth===3&&newDepth===0)) {
      e.tempRadius = Math.round(isDeath ? yWheelDeathScale(e.y0+(e.y1-e.y0)*2/5) : yWheelScale(e.y0+(e.y1-e.y0)*2/5)) // pulled from getArcPath
      e.tempArcSpan = (e.tempx1 - e.tempx0)*e.tempRadius
      if (e.depth===0)
        e.tempArcSpan = 200
      if (e.depth===newDepth)
        d3.select(this).style("stroke-width",2)
      d3.select(this.parentNode).selectAll(".wheelTextPaths").transition().duration(200).attr("opacity",1)
      d3.select(this.parentNode).select("path.wheelTextPaths").attr("d",function(d,i) {if (e.depth===newDepth)
      return "M -75,0 A 75, 75 0 0, 1 75,0";var newArcPath = getArcPath(e,isDeath);  return newArcPath })
      d3.select(this.parentNode).select("textPath").style("font-size",function(d,i) {return 15+10*(Math.max(2+newDepth-d.depth,0))})
        .text(function() {if (e.depth===0) return e.data.name;e.maxLetters = Math.floor(15*(e.tempArcSpan/10)/(15+10*(Math.max(2+newDepth-e.depth,0))));return e.data.name.slice(0,e.maxLetters)  }).attr("opacity",1)
    }
        })


  }
var murderWheelSVG = reportSVG.append("svg").attr("x",600-wheelDefs.padding).attr("width", wheelDefs.width).attr("height", wheelDefs.height).attr("y",wheelDefs.yOffset).append("g").attr("transform", "translate(" + wheelDefs.width / 2 + "," + (wheelDefs.height / 2) + ")").attr("id","murderWheel");


var murderWheelGroups = murderWheelSVG.selectAll("g").data(murderPartition(murderRoot).descendants()).enter().append("g")
murderWheelGroups.append("path")
  .attr("d", arcWheel).attr("class","wheelPaths").style("fill", function(d,i) {return d.parent ? d.data.color : "#000000"; })
  .attr("opacity",function (d,i) {return d.depth > 2 ? 1 : 0.15})
  .style("stroke","#000").style("stroke-width",2)
  .on("click", function (d) {clickWheel(d,murderWheelSVG,murderWheelGroups)})
  .on('mouseenter', function(d,i) {
    var coordinates = d3.mouse(this);
    if (d.depth===0)
      d3.select("#awardPopupNameFull").text("Welcome to the wheel of ").attr("fill","#fff").append("tspan").attr("fill","#ff0000").text("Murder")
    else if (d.depth===1)
      d3.select("#awardPopupNameFull").text("Your " + (d.data.team ? "enemies" : "team") ).attr("fill",d.data.team ? "#ff0000" : "#00ff00").append("tspan").text(" had ").attr("fill","white").append("tspan").text(Math.round(d.value)).attr("fill","#ff0000").append("tspan").text(" cumulative takedowns").attr("fill","white")
    else if (d.depth===2)
      d3.select("#awardPopupNameFull").text(d.data.you ? "Your " : (d.data.team ? "Their team's " : "Your team's ")).attr("fill",d.data.team ? "#ff0000" : "#00ff00").append("tspan").text(d.data.name).attr("fill",d.data.color).append("tspan").text(" (" +d.data.pname + ") had ").attr("fill","white").append("tspan").text(Math.round(d.value)).attr("fill","#ff0000").append("tspan").text(" takedowns").attr("fill","white")
    else if (d.depth===3)
      d3.select("#awardPopupNameFull").text(d.parent.data.name).attr("fill",d.parent.data.color).append("tspan").text(" had ").attr("fill","white").append("tspan").text(Math.round(d.value)).attr("fill","#ff0000").append("tspan").text(" takedowns against ").attr("fill","white").append("tspan").text(d.data.name).attr("fill",d.data.color).append("tspan").text(" (" +d.data.pname + ")").attr("fill","white")


    var awardPopupWidth = d3.select("#awardPopupNameFull").node().getBBox().width + 20
    awardPopupBox.attr("width",awardPopupWidth)
    awardPopup.attr("y",wheelDefs.yOffset+Math.min(coordinates[1],260)+wheelDefs.radius).attr("x",coordinates[0]-awardPopupWidth/2+wheelDefs.width)

    awardPopup.moveToFront().transition().duration(150).attr("opacity",1)

    })
  .on('mouseout', function(d,i) {awardPopup.transition().duration(0).attr("opacity",0)})

addWheelText(murderWheelGroups,0)

var deathWheelSVG = reportSVG.append("svg").attr("x",wheelDefs.padding).attr("width", wheelDefs.width).attr("height", wheelDefs.height).attr("y",wheelDefs.yOffset).append("g").attr("transform", "translate(" + wheelDefs.width / 2 + "," + (wheelDefs.height / 2) + ")").attr("id","deathWheel");


var deathWheelGroups = deathWheelSVG.selectAll("g").data(murderPartition(deathRoot).descendants()).enter().append("g")
deathWheelGroups.append("path")
  .attr("d", arcWheel).attr("class","wheelPaths").style("fill", function(d,i) {return d.parent ? d.data.color : "#000000"; })
  .attr("opacity",function (d,i) {return d.depth > 2 ? 1 : 0.15})
  .style("stroke","#000").style("stroke-width",2)
  .on("click", function (d) {clickWheel(d,deathWheelSVG,deathWheelGroups,true)})
  .on('mouseenter', function(d,i) {
    var coordinates = d3.mouse(this);
    if (d.depth===0)
      d3.select("#awardPopupNameFull").text("Welcome to the wheel of ").attr("fill","#fff").append("tspan").attr("fill","#ff0000").text("Death")
    else if (d.depth===1)
      d3.select("#awardPopupNameFull").text("Your " + (d.data.team ? "enemies" : "team") ).attr("fill",d.data.team ? "#ff0000" : "#00ff00").append("tspan").text(" had ").attr("fill","white").append("tspan").text(Math.round(d.value)).attr("fill","#ff0000").append("tspan").text(" deaths").attr("fill","white")
    else if (d.depth===2)
      d3.select("#awardPopupNameFull").text(d.data.you ? "Your " : (d.data.team ? "Their team's " : "Your team's ")).attr("fill",d.data.team ? "#ff0000" : "#00ff00").append("tspan").text(d.data.name).attr("fill",d.data.color).append("tspan").text(" (" +d.data.pname + ") died ").attr("fill","white").append("tspan").text(Math.round(d.value)).attr("fill","#ff0000").append("tspan").text(" times").attr("fill","white")
    else if (d.depth===3)
      d3.select("#awardPopupNameFull").text(d.data.name).attr("fill",d.data.color).append("tspan").text(" (" +d.data.pname + ") contributed ").attr("fill","white").append("tspan").text(Math.round(100*d.value)/100).attr("fill","#ff0000").append("tspan").text(" of ").attr("fill","white").append("tspan").text(d.parent.data.name +"'s").attr("fill",d.parent.data.color).append("tspan").text(" deaths").attr("fill","white")



    var awardPopupWidth = d3.select("#awardPopupNameFull").node().getBBox().width + 20
    awardPopupBox.attr("width",awardPopupWidth)
    awardPopup.attr("y",wheelDefs.yOffset+Math.min(coordinates[1],260)+wheelDefs.radius).attr("x",coordinates[0]-awardPopupWidth/2+wheelDefs.width)

    awardPopup.moveToFront().transition().duration(150).attr("opacity",1)

    })
  .on('mouseout', function(d,i) {awardPopup.transition().duration(0).attr("opacity",0)})

addWheelText(deathWheelGroups,0,true)
*/
