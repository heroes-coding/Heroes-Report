export default function getTalentWinrates(talentData,toIgnore,ignoreCounts) {
  const {nTalents, nFull, nPartial, talentCounts, talents, partialBuilds, fullBuilds} = talentData
  // let selectTime = window.performance.now()
  console.log({nTalents, nFull, nPartial, talentCounts, talents, partialBuilds, fullBuilds})
  window.toIgnore = toIgnore
  // console.log(talentCounts)
  let startArray = new Int32Array([].concat(ignoreCounts,toIgnore,talentCounts))
  let arrayLength = 14+toIgnore.length + nTalents*7 +nFull*11+nPartial*9
  let fullArray = new Int32Array(arrayLength)
  fullArray.set(startArray)
  // console.log(startArray,talentCounts)
  let offset = 14+toIgnore.length
  for (let l=0;l<7;l++) {
    const talCount = talentCounts[l]
    for (let t=0;t<talCount;t++) {
      fullArray.set(talents[l][t],offset)
      offset += 7
    }
  }
  fullArray.set(partialBuilds,offset)
  fullArray.set(fullBuilds,offset+nPartial*9)
  // console.log(fullArray,'FULL ARRAY')
  const buf = window.Module._malloc(arrayLength*4,4)
  window.Module.HEAP32.set(fullArray,buf >> 2)
  const talentsPointer = window.Module._getTalentWinrates(buf,nFull,nPartial,nTalents)
  let o = talentsPointer/4
  const returnees = []
  for (let l=0;l<7;l++) {
    returnees.push([])
    for (let c=0;c<talentCounts[l];c++) {
      returnees[l].push(window.Module.HEAPU32.slice(o,o+7))
      o += 7
    }
  }
  console.log(returnees)
  // console.log(`It took ${Math.round(window.performance.now()*100 - 100*selectTime)/100} ms to get talent winrates`)
  window.returnees = returnees
  return returnees
}
