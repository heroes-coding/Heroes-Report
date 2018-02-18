import * as d3 from "d3"
import React from 'react'
import Graph from './graph'
import getKernelDensity from '../../helpers/getKDensity'

function kernelDensityEstimator(kernel, X) {
  // X here are the "bins" for the kDensity function
  return function(V) {
    // V here, the outer parameter, is the entire dataset
    return X.map(function(x) {
      // d3.mean here is a mean of a mapping of the elements of V, which are every point in the dataset.  For small amounts of data, javascript would probably be fine, but if you are talking many 100,000s of points of data, this will slow down to a crawl.  Need to rewrite it in C
      return [x, d3.mean(V, function(v) {
        return kernel(x - v)
      })]
    })
  }
}

function kernelEpanechnikov(k) {
  // k here is the first parameter passed in, kind of the smoothness of the kernel function
  return function(v) {
    // and v is the value of a given point
    v = Math.abs(v/k)
    return v <= 1 ? 0.75 * (1 - v * v) / k : 0
  }
}

export default (props) => {
  let { X, graphClass, xLabel, xRatio, yRatio, xOff, yOff, title, formatter, yFormatter } = props
  if (["Healing","Self Healing","Protection","CC Time","Stun Time", "Root Time", "Silence Time", "Time on Fire", "Out#d Deaths", "TF Hero Dam.", "TF Dam.Rec.","Vengeances"].includes(xLabel)) {
    X = X.filter(x => x)
  }
  const xMin = d3.min(X)
  const xMax = d3.max(X)
  const xRange = xMax-xMin
  const xPad = xRange*0.05
  const xScale = d3.scaleLinear().range([40, 480]).domain([xMin-xPad,xMax+xPad])
  const xTicks = xScale.ticks(25).filter(x => x >= 0)
  /*
  let expTime = window.performance.now()
  let densityPoints = kernelDensityEstimator(kernelEpanechnikov(7), xTicks)(X)
  window.timings['KDensity calc for ' + xLabel] = Math.round(window.performance.now()*100 - 100*expTime)/100
  */
  let expTime = window.performance.now()
  let densityPointsC = getKernelDensity(7,xTicks,X)
  window.timings['KDensity C++ calc for ' + xLabel] = Math.round(window.performance.now()*100 - 100*expTime)/100
  let densityPoints = xTicks.map((x,i) => [x,densityPointsC[i]])
  let endPoint = densityPoints[densityPoints.length-1]
  if (!endPoint) {
    return <div></div>
  }
  endPoint[1] = 0
  if (densityPoints.length > 2) {
    densityPoints = [[0,0], ...densityPoints, endPoint]
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
      yFormatter={yFormatter}
    />
  )
}
