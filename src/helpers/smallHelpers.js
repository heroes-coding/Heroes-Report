export function getRandomString() { return Math.random().toString(36).replace(/[^a-z]+/g, '') }

let fakeLaunchDate = (new Date(2015, 5, 1, 20, 0, 0, 0)).getTime()
export const minSinceLaunchToDate = function(minSinceLaunch) {
  return new Date(fakeLaunchDate + minSinceLaunch*60000)
}

export const dateToDSL = function(date) {
  return Math.floor((date - 60000*240 - fakeLaunchDate)/(60000*1440))
}

export const DateToMSL = function(date) {
  return (date - fakeLaunchDate)/(60000)
}

export const updatedTime = function(updatedTime) {
  let updatedMins = (new Date() - new Date(updatedTime))/60000
  if (updatedMins < 180) {
    return Math.round(updatedMins) + ' mins.'
  } else if (updatedMins < 72*60) {
    return Math.round(updatedMins/60) + ' hours'
  } else {
    return Math.round(updatedMins/60/24) + ' days'
  }
}

export function LightenDarkenColor(col,amt) {
  col = parseInt(col,16)
  return (((col & 0x0000FF) + amt) | ((((col>> 8) & 0x00FF) + amt) << 8) | (((col >> 16) + amt) << 16)).toString(16)
}

let daysAndMinutesSinceLaunch = function(minSinceLaunch) {
  let time = minSinceLaunch - 240
  let days = Math.floor(time/(1440))
  let mins = time%(1440)
  return [days,mins]
}

export function formatDate(value) {
  let month = value.getMonth()+1
  month = month < 10 ? `0${month}` : month
  let day = value.getDate()
  day = day < 10 ? `0${day}` : day
  return `${month}/${day}/${value.getYear()-100}`
}
export function formatTime(value) {
  let hours = value.getHours()
  const dayNight = hours > 11 ? 'pm' : 'am'
  hours = hours%12
  hours = hours === 0 ? 12 : hours
  let minutes = value.getMinutes()
  minutes = minutes > 9 ? minutes : `0${minutes}`
  return `${hours}:${minutes}${dayNight}`
}
export function formatLength(length, longForm) {
  let minutes = Math.floor(length/60)
  let seconds = Math.floor(length%60)
  minutes = minutes < 10 ? `0${minutes}` : minutes
  seconds = seconds < 10 ? `0${seconds}` : seconds
  return longForm ? `${minutes} minutes and ${seconds} seconds` : `${minutes}m${seconds}s`
}

export function MSLToDateString(d) {
  return formatDate(minSinceLaunchToDate(d))
}



export function simplePercent(p) {
  return `${Math.round(p*100)}%`
}

export function tinyPercent (p) {
  return `${Math.round(p*10000)/100}%`
}


export function getCounts(array) {
  const counts = {}
  let n = array.length
  for (let i=0;i<n;i++) {
    const e = array[i]
    if (!counts.hasOwnProperty(e)) {
      counts[e] = 1
    } else {
      counts[e] += 1
    }
  }
  return counts
}

export function binarySearch(array,value) {
  let max = array.length
  let min = 0
  let x = Math.floor(max/2)
  let i = 0
  while (true) {
    i += 1
    if (i===100) {
      return false
    }
    if (array[x] <= value) {
      if (value <= array[x+1]) {
        return x + 1
      }
      const tempMin = x
      x = Math.floor((max+x)/2)
      min = tempMin
    } else {
      const tempMax = x
      x = Math.floor((min+x)/2)
      max = tempMax
    }
  }
}

export function formatNumber(num) {
  switch (true) {
    case num === Infinity:
      return "∞"
    case isNaN(num):
      return num
    case num < 10:
      return Math.round(num*100)/100
    case num < 100:
      return Math.round(num*10)/10
    case num < 1000:
      return Math.round(num)
    case num < 10000:
      return Math.round(num/10)/100 + "K"
    case num < 100000:
      return Math.round(num/100)/10 + "K"
    default:
      return Math.round(num/1000) + "K"
  }
}

export function commify(number) {
  number = Math.round(number).toString()
  if (number === 'Infinity') {
    return "∞"
  }
  number = number.split('').reverse()
  const result = []
  for (let n = 0; n < number.length; n++) {
    if (n % 3 === 0 && n > 0) {
      result.push(',')
    }
    result.push(number[n])
  }
  return result.reverse().join('')
}

export function sortWithIndices(toSort) {
  for (var i = 0; i < toSort.length; i++) {
    toSort[i] = [toSort[i], i]
  }
  toSort.sort(function(left, right) {
    return left[0] < right[0] ? -1 : 1
  })
  var sortIndices = []
  for (var j = 0; j < toSort.length; j++) {
    sortIndices.push(toSort[j][1])
    toSort[j] = toSort[j][0]
  }
  return sortIndices
}

export const Around50 = function(percent) {
  var factor = 255/30
  var R = percent < 50 ? 255
    : (percent-50)*factor < 255 ? 255 - (percent-50)*factor : 0
  var G = percent > 50 ? 255
    : (50-percent)*factor < 255 ? 255 - (50-percent)*factor : 0
  var B = Math.abs(percent-50)*factor < 255 ? 255 - Math.abs(percent-50)*factor : 0
  return 'rgb(' + Math.round(R) + ',' + Math.round(G) + ',' + Math.round(B) + ')'
}


export const Dark50 = function(percent) {
  var factor = 255/10
  var R = percent < 50 ? Math.min((50-percent)*factor*2,255) : 0
  var G = percent > 50 ? Math.min((percent-50)*factor*1.5,210) : 0
  return 'rgb(' + Math.round(R) + ',' + Math.round(G) + ',0)'
}

export const roundedPercent = function(data) {
  data = Math.round(data)
  return `${data < 0 ? Math.ceil(data/10) : Math.floor(data/10)}.${data < 0 ? -1*data%10 : data%10}%`
}

export const roundedPercentPercent = function(num) {
  return roundedPercent(num*1000)
}

export const formatStat = function(num) {
  if (num<10) {
    return num
  } else if (num<100) {
    return Math.round(num,1)
  }
  return commify(Math.round(num))
}

export const formatStatNumber = function(num) {
  return formatNumber(num/100)
}

export const sToM = function(secs) {
  secs = Math.round(secs)
  const mins = Math.floor(secs/60)
  secs = secs%60
  secs = secs < 10 ? "0" + secs : secs
  return mins + ":" + secs
}

export const statSToM = function(secs100) {
  return sToM(Math.round(secs100/100))
}
