const returnIDs = function(lobbyText) {
  const matches = lobbyText.match(/.{4,30}#\d{2,25}/g || []).filter(x => !x.includes("T:"))
  const handles = []
  const battleTags = []
  const teams = []
  for (let m=0;m<matches.length;m++) {
    const bareText = matches[m]
    const battleTagIndex = bareText.lastIndexOf("#")
    const battleTag = bareText.slice(battleTagIndex+1,)
    battleTags.push(battleTag)
    const nameText = bareText.slice(0,battleTagIndex)
    const nameStart = Math.max.apply(null,["\x00","\x01","\x02","\x03","\x04","\x05","\x06","\x07","\x08","\x09","\x0a","\x0b","\x0c","\x0d","\x0e","\x0f","\x10","\x11","\x12","\x13","\x14","\x15","\x16","\x17","\x18","\x19","\x1a","\x1b","\x1c","\x1d","\x1e","\x1f","\x00","\x01","\x02","\x03","\x04","\x05","\x06","\x07","\x08","\x09","\x0a","\x0b","\x0c","\x0d","\x0e","\x0f","\x10","\x11","\x12","\x13","\x14","\x15","\x16","\x17","\x18","\x19","\x1a","\x1b","\x1c","\x1d","\x1e","\x1f","%","#",";",")","(","/","+","$","*","'","!","'","!","%","#",";",")","(","/","+","$","*"," "].map(c => nameText.lastIndexOf(c)))
    const handle = nameText.slice(nameStart+1,)
    handles.push(handle)
    const handleIndex = lobbyText.indexOf(`${handle}`)
    const teamGibberish = lobbyText.slice(handleIndex-9,handleIndex-1)
    teams.push(teamGibberish)
  }
  const teamCounts = {}
  for (let t=0;t<10;t++) {
    const team = teams[t]
    if (!teamCounts.hasOwnProperty(team)) teamCounts[team] = 0
    teamCounts[team]++
  }
  const teamNumbers = []
  for (let t=0;t<2;t++) {
    const usedTeams = []
    for (let p=0;p<5;p++) {
      const team = teams[t*5+p]
      const usedIndex = usedTeams.indexOf(team)
      const count = teamCounts[team]
      if (usedIndex === -1 && count > 1) {
        usedTeams.push(team)
        const teamNumber = usedTeams.length
        teamNumbers.push(teamNumber)
      } else if (count > 1) {
        teamNumbers.push(usedIndex+1)
      } else teamNumbers.push(0)
    }
  }
  return { handles, teamNumbers, battleTags }
}

exports.returnIDs = returnIDs
