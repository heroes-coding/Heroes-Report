const fs = require('fs')

let summaries = fs.readFileSync(`C:\\Users\\Jeremy\\AppData\\Roaming\\Heroes Report\\replaySummaries.json`)
summaries = JSON.parse(`[${summaries.slice(0,summaries.length-1)}]`)



var playerSortingTime = window.performance.now()
window.matchupResults = sortObjectListByProperty(window.matchupResults, 'nMatches', true)
console.log(`It took ${Math.round(window.performance.now()*100 - 100*playerSortingTime)/100} just to sort player matchup stuff`)
