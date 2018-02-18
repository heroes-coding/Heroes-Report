/*
export default function(hero,buildName,positiveScore,total) {
  let wilsonTime = window.performance.now()
  let result = wilsonJS(positiveScore,total)
  window.timings[`WilsonJS calc for ${hero} on ${buildName}: ${positiveScore}/${total}`] = Math.round(window.performance.now()*100 - 100*wilsonTime)/100
  return result
}
*/
export default function(positiveScore, total) {
  // phat is the proportion of successes
  // in a Bernoulli trial process
  const phat = positiveScore / total

  // z is 1-alpha/2 percentile of a standard
  // normal distribution for error alpha=5%
  const z = 1.96

  // implement the algorithm
  // (http://goo.gl/kgmV3g)
  const a = phat + z * z / (2 * total)
  const b = z * Math.sqrt((phat * (1 - phat) + z * z / (4 * total)) / total)
  const c = 1 + z * z / total

  return [(a - b) / c, (a + b) / c]
}
