import { mean, deviation } from 'd3'

const ALPHA = 0.01
const ALPHAcutoff = Math.round(Math.log(0.01)/(Math.log(1-ALPHA)))
const expDen = [1]
const expVals = [1]
for (let i=1;i<=ALPHAcutoff;i++) {
  const newWeight = expVals[i-1]*(1-ALPHA)
  expVals.push(newWeight)
  expDen.push(expDen[i-1]+newWeight)
}

export function exponentialSmoothingCP(timedData,shouldSmooth=0,filterZeroes) {
  // console.log('exponential smoothing CP called',window.moduleLoaded)
  const nTime = timedData.length
  let buf, timedPoints, error
  try {
    buf = window.Module._malloc(nTime*32,4) // this HAS to be sufficient for internal manipulation in C++.  Setting it lower results in unpredictable errors that are very hard to predict.  (ALONG WITH A BUNCH OF OTHER THINGS THAT CAN CAUSE MEMORY ERRORS.  C++ is a little bit deep for me...)
    let data = [].concat(...timedData)
    data = new Float32Array(data)
    window.Module.HEAPF32.set(data,buf >> 2)
    const pointsPointer = window.Module._getExponentiallySmoothedData(buf, nTime,shouldSmooth,filterZeroes)
    let o = pointsPointer/4
    const nPoints = window.Module.HEAPF32[o]
    const points = window.Module.HEAPF32.slice(o+1, o+1+nPoints*2)
    timedPoints = []
    let pMSL = 0
    for (let p=0;p<nPoints;p++) {
      let MSL = points[p*2]
      if (MSL < pMSL) {
        console.log(p,MSL,pMSL)
      }
      pMSL = MSL
      timedPoints.push([points[p*2],points[p*2+1]])
    }
    window.timedPoints = timedPoints
  } catch (e) {
    error = e
  } finally {
    window.Module._free(buf)
  }
  if (error) throw error
  // console.log(timedPoints)
  return timedPoints
}

export function exponentialSmoothing(timedData, shouldSmooth=1,statName) {
  window.timedData = timedData
  const filterZeroes = ["Healing","Self Healing","Protection","CC Seconds","Stun Seconds", "Root Time", "Silence Time", "Time on Fire", "Out#d Deaths", "TF Hero Dam.", "TF Dam.Rec.","Vengeances"].includes(statName) ? 1 : 0
  // console.log(statName,filterZeroes)
  window.exponentialSmoothingCP = exponentialSmoothingCP
  timedData.sort((x,y) => x[0] < y[0] ? -1 : 1)
  if (timedData.length < 4) {
    return []
  }
  return exponentialSmoothingCP(timedData, shouldSmooth, filterZeroes) // fixed ??
  const nTime = timedData.length
  if (nTime>500) {
    let minTime = timedData[0][0]
    let maxTime = timedData[nTime-1][0]
    let inc = (maxTime-minTime)/500
    const newData = []
    let bin = minTime + inc
    let count = 0
    let wins = 0
    let totalMSL = 0
    for (let t=0;t<nTime;t++) {
      const [ time, won ] = timedData[t]
      while (time > bin) {
        bin += inc
        if (count !== 0) {
          newData.push([totalMSL/count,wins/count])
          count = 0
          wins = 0
          totalMSL = 0
        }
        wins += won
        count += 1
        totalMSL += time
      }
    }
    if (count > 0) {
      newData.push([totalMSL/count,wins/count])
    }
    timedData = newData
  }
  // timed data should be [date,value]. needs to be time sorted first
  var timedPoints = []
  const ys = []
  for (var x=1;x<timedData.length;x++) {
    let num = timedData[x][1]
    const den = expDen[Math.min(ALPHAcutoff,x)]
    let exp = 1
    for (var y=x-1;y>-1;y--) {
      num += timedData[y][1]*expVals[exp] // (1-A)**exp
      exp += 1
      if (exp >= ALPHAcutoff) {
        break
      }
    }
    if (x===1) {
      continue
    }
    timedPoints.push([timedData[x][0],num/den])
    ys.push(num/den)
  }
  let mu = mean(ys)
  let sigma = deviation(ys)
  let newTimedPoints = []
  let nP = timedPoints.length
  for (let t=0;t<nP;t++) {
    if (Math.abs(timedPoints[t][1] - mu) < 2*sigma) {
      newTimedPoints.push(timedPoints[t])
    }
  }
  return newTimedPoints
}
