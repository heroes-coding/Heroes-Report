export default function getTalentWinrates(talentData,toIgnore,ignoreCounts) {

  const {nTalents, nFull, nPartial, talentCounts, talents, partialBuilds, fullBuilds} = talentData
  // console.log('refilter talents called',nFull,nPartial,!nFull,!nPartial)
  if (!nFull || !nPartial) {
    // console.log('should be returning')
    return []
  }
  console.log('refilter talents called ',window.moduleLoaded)
  // let selectTime = window.performance.now()
  window.toIgnore = toIgnore
  // console.log(talentCounts)
  let startArray = new Int32Array([].concat(ignoreCounts,toIgnore,talentCounts))
  let arrayLength = 14+toIgnore.length + nTalents*7 +nFull*11+nPartial*9
  // console.log(arrayLength,'arrayLength')
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
  let buf, error, returnees
  try {
    buf = window.Module._malloc(arrayLength*4,4)
    window.Module.HEAP32.set(fullArray,buf >> 2)
    const talentsPointer = window.Module._getTalentWinrates(buf,nFull,nPartial,nTalents)
    let o = talentsPointer/4
    returnees = []
    for (let l=0;l<7;l++) {
      returnees.push([])
      for (let c=0;c<talentCounts[l];c++) {
        returnees[l].push(window.Module.HEAP32.slice(o,o+7))
        o += 7
      }
    }
    // console.log(`It took ${Math.round(window.performance.now()*100 - 100*selectTime)/100} ms to get talent winrates`)
    window.returnees = returnees
  } catch (e) {
    error = e
  } finally {
    window.Module._free(buf)
  }
  if (error) throw error
  return returnees
}
