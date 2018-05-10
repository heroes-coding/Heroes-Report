// I'm saving this stuff here as it looks like I will need to implement it in rust soon

function sumSquares (regData,index1,index2) {
  var sum = 0
  for (var d=0;d<regData.length;d++)
    sum += regData[d][index1]*regData[d][index2]
  return sum
}

function regMean(regData,index) {
  var sum = 0
  for (var d=0;d<regData.length;d++)
    sum += regData[d][index]
  return sum/regData.length
}

function getCoefficients (regData) {
  var denom =sumSquares(regData,1,1)*sumSquares(regData,2,2) - (sumSquares(regData,1,2))**2
  var b1 = (sumSquares(regData,1,0)*sumSquares(regData,2,2) - sumSquares(regData,2,0)*sumSquares(regData,1,2))/denom
  var b2 = (sumSquares(regData,2,0)*sumSquares(regData,1,1) - sumSquares(regData,1,0)*sumSquares(regData,1,2))/denom
  var intercept = regMean(regData,0) - b1*regMean(regData,1) - b2*regMean(regData,2)
  return {'b1':b1,'b2':b2,'b0':intercept}
}


function sortTime (rIDs,isEnemy) {
  var times = []
  for (var r=0;r<rIDs.length;r++)
    times.push(replays.minSinceLaunch[rIDs[r]])
  var timedIndices = sortWithIndices(times) // sorts oldest first
  var timedData = []
  for (var r=0;r<timedIndices.length;r++) {
    var result = replays.won[timedIndices[r]] ? 1 : 0
    timedData.push([rIDs[timedIndices[r]],isEnemy ? Math.abs(result-1) : result])
  }
  return timedData
}

function daysDiff (date1,date2) {
  var diff = date1 - date2
  return Math.ceil(diff / (1000 * 3600 * 24))
}

var curDates
function getTimeSpan (timedData) {
  // timedData is an array of "arrays full of dictionaries" created by exponential smoothing below
  var minDate = 9999999999999
  var maxDate = 0
  for (var series=0;series<timedData.length;series++) {
    var serie = timedData[series] //ha ha ha
    if (serie.length===0)
      continue
    minDate = serie[0].t < minDate ? serie[0].t : minDate
    maxDate = serie[serie.length-1].t > maxDate ? serie[serie.length-1].t : maxDate
    }
  diff = maxDate - minDate
  minDate = new Date (minDate - diff*0.01)
  maxDate = new Date (maxDate - (- diff*0.01))
  curDates = [minDate,maxDate]
  return [minDate,maxDate]
}



var ALPHA = 0.05
var ALPHAcutoff = Math.round(Math.log(0.01)/(Math.log(1-ALPHA)))
var expDen = [1]
var expVals = [1]
for (var i=1;i<=ALPHAcutoff;i++) {
  var newWeight = expVals[i-1]*(1-ALPHA)
  expVals.push(newWeight)
  expDen.push(expDen[i-1]+newWeight)
}

function exponentialSmoothing (timedData,heroOrRole,color,map,stat,selfData,isDate) {
  let unpackTime = window.performance.now()
  // timed data should be [date,value]. needs to be time sorted first
  var WROT = []
  var s = timedData[0][1]
  var A = ALPHA

  var timedPoints = []
  for (var x=1;x<timedData.length;x++) {
    var num = timedData[x][1]
    var den = expDen[Math.min(ALPHAcutoff,x)]
    var exp = 1
    for (var y=x-1;y>-1;y--) {
      num += timedData[y][1]*expVals[exp]  //(1-A)**exp
      exp += 1
      if (exp >= ALPHAcutoff)
        break
    }
    if (x===1)
      continue
    timedPoints.push({'t': isDate ? new Date(timedData[x][0]) : new Date(HOTS.dates[timedData[x][0]]),'v':num/den,'c':color,'s':stat,'m':map,'n':heroOrRole,'self': selfData,'won':timedData[x][1]})
    WROT.push(num/den)
    }
  console.log(`It took ${Math.round(window.performance.now()*100 - 100*unpackTime)/100} ms to smooth exponentially`)
  return timedPoints

}

function LDAScore (x,muX,sigma,prior) {
  return x * muX/(sigma**2) - (muX**2)/(2*sigma**2) + Math.log(prior)
}



function GetLDAPoints (timedData,min,max,heroOrRole,color,lineType) {
  let unpackTime = window.performance.now()
  // This function first estimates the parameters for a linear discriminant analysis discriminant score
  // Then, it estimates probabilities for the range of game lengths of the data to form a fit LDA line similar to (but easier to calculate than) a logistic regression fit line
  ns = [0,0]
  n = 0
  var indexes = [[],[]]
  xSums = [0,0]
  for (var i=0;i<timedData.length;i++) {
    var obs = timedData[i]
    ns[obs[0]] += 1
    n += 1
    indexes[obs[0]].push(i)
    xSums[obs[0]] += obs[1]
  }
  var priors = [ns[0]/n,ns[1]/n]
  var xMeans = [xSums[0]/ns[0],xSums[1]/ns[1]]
  var SSR = [0,0]
  for (var w=0;w<2;w++) {
    for (var i=0;i<ns[w];i++)
      SSR[w] += (timedData[indexes[w][i]][1] - xMeans[w])**2
  }
  var xVariances = [SSR[0]/(ns[0]-1),SSR[1]/(ns[1]-1)]
  var variance = xVariances[0]*(ns[0]-1)/(n-1) + xVariances[1]*(ns[1]-1)/(n-2)
  var min = Math.floor(min)
  var max = Math.ceil(max)
  var fitProbabilityLine = []
  var probMin = 1
  var probMax = 0
  for (var t = min;t<=max;t++) {
    var eW = Math.E ** LDAScore (t,xMeans[1],variance,priors[1])
    var eL = Math.E ** LDAScore (t,xMeans[0],variance,priors[0])
    var estProb = eW/(eW+eL)
    if (isNaN(estProb))
      break
    fitProbabilityLine.push({'t':t,'p':estProb,'n':heroOrRole,'c':color,'l':lineType})
    probMin = estProb < probMin ? estProb : probMin
    probMax = estProb > probMax ? estProb : probMax
  }
  console.log(`It took ${Math.round(window.performance.now()*100 - 100*unpackTime)/100} ms to get LDA points`)
  return ([fitProbabilityLine,probMin,probMax])
}
