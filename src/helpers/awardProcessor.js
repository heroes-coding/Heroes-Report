export default function addAwards(replay,heroData) {
  const extraAwards = []
  if (heroData[56] && heroData[56] > 99)
    extraAwards.push("Big Talker")
  if (heroData[58] && Math.floor(heroData[58]/5) !== Math.floor(heroData[1]/5))
    extraAwards.push("Traitor")
  if (!heroData[0]===44 && heroData[51]/heroData[14] < 0.25) // 44 is for Abathur
    extraAwards.push("Loner Rebel")
  var mercCampCaptures = 0
  for (var p=0;p<5;p++)
    mercCampCaptures += replay[Math.floor(heroData[1]/5)*5+p][24]
  if (mercCampCaptures && mercCampCaptures === heroData[24])
    extraAwards.push("Lonely Jungler")
  var teamDeaths = 0
  for (var p=0;p<5;p++)
    teamDeaths += replay[Math.floor(heroData[1]/5)*5+p][6]
  if (heroData[6] > 5 && heroData[6] >= (teamDeaths-heroData[6])/2)
    extraAwards.push("Feeder")
  if (heroData[27] > 30)
    extraAwards.push('Globe Trotter')
  if (heroData[19] > 42000)
    extraAwards.push('Troll Blood')
  if (heroData[17] + heroData[14] > 200000)
    extraAwards.push('Destroyer')
  if (heroData[55] > 42)
    extraAwards.push('Pinger')
  var teamDamage = 0
  for (var p=0;p<5;p++)
    teamDamage += replay[Math.floor(heroData[1]/5)*5+p][14]
  if (heroData[14] < 0.1*(teamDamage-heroData[14]))
    extraAwards.push('Wet Noodle')
  if (window.HOTS.roles[heroData[0]]==="Support" && heroData[14] > (teamDamage-heroData[14])/4)
    extraAwards.push('Dangerous Nurse')
  const finishedAwards = []
  for (let a=0;a<extraAwards.length;a++) {
    const award = extraAwards[a]
    finishedAwards.push([award,window.HOTS.customAwardDic[award]])
  }
  return finishedAwards
}
