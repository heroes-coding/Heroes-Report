import { formatNumber, roundedPercentPercent } from '../../helpers/smallHelpers'
const formatters = [formatNumber, roundedPercentPercent]
function getStat(type, mean, id, sigma) {
  let o = sigma ? formatters[type](sigma) : null
  let display = mean ? formatters[type](mean) : '-'
  return { sigma: o, display, value: mean, id }
}

export default (rustyStats) => {
  window.stats = rustyStats
  const HOTS = window.HOTS
  if (!HOTS) return []
  const nHeroes = window.HOTS.fullHeroNames.length
  return Array(nHeroes+1).fill().map((x,i) => {
    const [ matches, winPercent, f10WinPercent, f20WinPercent, fFortWinPercent,
      avgLevDiff, avgLevDiffSigma, strucs, strucsSigma, globes, globesSigma, mercs, mercsSigma, kda,
      kdaSigma, mmr, mmrSigma, lengths, lengthsSigma ] = rustyStats.slice(i*19, (i+1)*19)
    // console.log({i, range:`${i*19}:${(i+1)*19}`, matches, winPercent, f10WinPercent, f20WinPercent, fFortWinPercent, avgLevDiff, avgLevDiffSigma, strucs, strucsSigma, globes, globesSigma, kda, kdaSigma, mmr, mmrSigma, lengths, lengthsSigma} )
    if (matches === 0) return null
    return {
      name: i === nHeroes ? 'All Heroes' : HOTS.nHeroes[i],
      id: i === nHeroes ? -1 : i,
      color: i === nHeroes ? '#ffffff' : HOTS.ColorsDic[i],
      stats: [
        getStat(0,i === nHeroes ? matches/5 : matches, 0),
        getStat(1,winPercent, 1),
        getStat(1,f10WinPercent, 2),
        getStat(1,f20WinPercent, 3),
        getStat(1,fFortWinPercent, 4),
        getStat(0,kda, 5, kdaSigma),
        getStat(0,strucs, 6, strucsSigma),
        getStat(0,globes, 7, globesSigma),
        getStat(0,mercs, 8, mercsSigma),
        getStat(0,lengths, 9, lengthsSigma)
      ]
    }
  }).filter(x => x) // nulls are not returned
}
