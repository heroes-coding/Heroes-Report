export function getRandomString() {return Math.random().toString(36).replace(/[^a-z]+/g, '')}

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
  return `${data < 0 ? Math.ceil(data/10) : Math.floor(data/10)}.
          ${data < 0 ? -1*data%10 : data%10}%`
}

export const formatStat = function(num) {
  if (num<10) {
    return num
  } else if (num<100) {
    return Math.round(num,1)
  }
  return commify(Math.round(num))
}

export const sToM = function(secs) {
  const mins = Math.floor(secs/60)
  secs = secs%60
  secs = secs < 10 ? "0" + secs : secs
  return mins + ":" + secs
}
