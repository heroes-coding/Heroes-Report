const makeModern = function(oldDateString) {
  return new Date(`${oldDateString.slice(0, 6)}20${oldDateString.slice(6, )}`)
}

let reverseSeasons
const getSeason = function(HOTS, build) {
  if (!reverseSeasons) {
    reverseSeasons = HOTS.seasonCutoffs.slice(0,).reverse()
  }
  for (let s = 0; s < reverseSeasons.length; s++) {
    let cOff = reverseSeasons[s]
    if (build >= cOff) {
      return HOTS.seasons[cOff]
    }
  }
}

export default function(HOTS, buildsData) {
  const bKeys = Object.keys(buildsData).map(x => parseInt(x,10))
  const builds = {}
  const seasons = Object.values(HOTS.seasons).reverse()
  for (let s = 0; s < seasons.length; s++) {
    const season = seasons[s]
    // year 2286 bug =>
    builds[season] = {name: season, id: season, count: 0, dates: [9999999999999, 0]}
  }
  builds['All'] = {name: 'All Time', id: 'All', count: 0, dates: [9999999999999, new Date()]}
  let currentBuild = Object.keys(buildsData).map(function(x) { return parseInt(x,10) }).reduce(function(a, b) { return Math.max(a, b) })
  const buildsArray = []
  for (let b = 0; b < bKeys.length; b++) {
    let build = bKeys[b]
    let count = buildsData[build][1] / 10
    let stringDates = buildsData[build][0].split('-')
    let minDate = makeModern(stringDates[0])
    let maxDate = makeModern(stringDates[1])
    let name
    if (build > 90) {
      name = HOTS.heroReleases.hasOwnProperty(build)
        ? `${HOTS.nHeroes[HOTS.heroReleases[build]]} Patch`
        : `${build}${HOTS.patchDic.hasOwnProperty(build) ? ` | ${HOTS.patchDic[build]}` : ''}`
      let season = getSeason(HOTS, build)
      builds[season].count += count
      builds['All'].count += count
      builds[season].dates[0] = minDate < builds[season].dates[0] ? minDate : builds[season].dates[0]
      builds[season].dates[1] = maxDate > builds[season].dates[1] ? maxDate : builds[season].dates[1]
      builds['All'].dates[0] = minDate < builds['All'].dates[0] ? minDate : builds['All'].dates[0]
    } else {
      name = `Last ${build} Days`
      const today = new Date()
      minDate = new Date(today.setDate(today.getDate() - build))
      maxDate = new Date()
    }
    const finalBuild = {name: name, id: build, count: count, dates: [minDate, maxDate]}
    if (build > 90) {
      buildsArray.push(finalBuild)
    }
    builds[build] = finalBuild
  }
  builds[currentBuild].dates[1] = new Date()
  builds[currentBuild].name = 'Current Build'
  window.builds = builds
  const orderedBuildKeys = [currentBuild, 7, 30, 90, ...seasons, 'All', ...bKeys.filter(x => x > 90).sort().reverse().slice(1,)]
  const orderedBuilds = []
  for (let b = 0; b < orderedBuildKeys.length; b++) {
    const key = orderedBuildKeys[b]
    let build = builds[key]
    build.dates.push(new Date(build.dates[0] * 0.5 + build.dates[1] * 0.5))
    orderedBuilds.push(build)
  }
  return { times: orderedBuilds, builds, buildsArray }
}
