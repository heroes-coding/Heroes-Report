import * as d3 from "d3"
import React from 'react'
import Graph from './graph'

function kernelDensityEstimator(kernel, X) {
  return function(V) {
    return X.map(function(x) {
      return [x, d3.mean(V, function(v) { return kernel(x - v) })]
    })
  }
}

function kernelEpanechnikov(k) {
  return function(v) {
    return Math.abs(v /= k) <= 1 ? 0.75 * (1 - v * v) / k : 0
  }
}

export default (props) => {
  const { X, graphClass, xLabel, xRatio, yRatio, xOff, yOff, title, formatter } = props
  const xMin = d3.min(X)
  const xMax = d3.max(X)
  const xRange = xMax-xMin
  const xPad = xRange*0.05
  const xScale = d3.scaleLinear().range([40, 480]).domain([xMin-xPad,xMax+xPad])
  let densityPoints = kernelDensityEstimator(kernelEpanechnikov(7), xScale.ticks(50))(X)
  let normalPoints = densityPoints.filter(x => x[0] > 0)
  let endPoint = normalPoints[normalPoints.length-1]
  endPoint[1] = 0
  let startY = densityPoints.filter(x => x[0] <= 0)
  let startPoint = startY.length ? [0,startY.map(x => x[1]).reduce((x,y) => x+y)] : [0,0]
  if (densityPoints.length > 2) {
    densityPoints = [[0,0],startPoint, ...normalPoints, endPoint]
  }
  return (
    <Graph
      graphClass={graphClass}
      linePoints={densityPoints}
      yLabel='K Density'
      xLabel={xLabel}
      title={title}
      xRatio={xRatio}
      yRatio={yRatio}
      xOff={xOff}
      yOff={yOff}
      formatter={formatter}
    />
  )
}
