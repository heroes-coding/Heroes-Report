export default function getBuilds(buildsArray, nBuilds) {

  let buf, error, results
  try {
    buf = window.Module._malloc(nBuilds*8*32,4)
    window.Module.HEAP32.set(buildsArray,buf >> 2)
    const replaysPointer = window.Module._getBuilds(buf,nBuilds)
    let o = replaysPointer/4
    const nTalents = window.Module.HEAPU32[o]
    const nFull = window.Module.HEAPU32[o+1]
    const nPartial = window.Module.HEAPU32[o+2]
    const talentCounts = [3,4,5,6,7,8,9].map(x => window.Module.HEAPU32[o+x])
    o = o+10
    const talents = []
    for (let l=0;l<7;l++) {
      talents.push([])
      for (let c=0;c<talentCounts[l];c++) {
        talents[l].push(window.Module.HEAPU32.slice(o,o+7))
        o += 7
      }
    }
    const fullBuilds = window.Module.HEAPU32.slice(o,o+nFull*11)
    const partialBuilds = window.Module.HEAPU32.slice(o+nFull*11,o+nFull*11+nPartial*9)
    results = {nTalents,nFull,nPartial,talentCounts,talents,fullBuilds,partialBuilds}
  } catch (e) {
    error = e
  } finally {
    window.Module._free(buf)
  }
  if (error) throw error
  return results
}
