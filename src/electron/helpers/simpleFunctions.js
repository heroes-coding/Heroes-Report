function formatDate(value) {
  let month = value.getMonth()+1
  month = month < 10 ? `0${month}` : month
  let day = value.getDate()
  day = day < 10 ? `0${day}` : day
  return `${value.getYear()-100}-${month}-${day}`
}

function formatTime(value) {
  let hours = value.getHours()
  const dayNight = hours > 11 ? 'pm' : 'am'
  hours = hours%12
  hours = hours === 0 ? 12 : hours
  let minutes = value.getMinutes()
  minutes = minutes > 9 ? minutes : `0${minutes}`
  return `${hours}˸${minutes}${dayNight}`
}

const fakeLaunchDate = (new Date(2015, 5, 1, 20, 0, 0, 0)).getTime()
const minSinceLaunchToDate = function(minSinceLaunch) {
  return new Date(fakeLaunchDate + minSinceLaunch*60000)
}

exports.formatDate = formatDate
exports.formatTime = formatTime
exports.minSinceLaunchToDate = minSinceLaunchToDate
