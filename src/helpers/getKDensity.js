export default function getKDensity(k, bins, values) {
  const nBins = bins.length
  const nVals = values.length
  const buf = window.Module._malloc((nBins+nVals+1)*4,4)
  let data = [].concat(k,bins,values)
  data = new Float32Array(data)
  window.Module.HEAPF32.set(data,buf >> 2)
  const replaysPointer = window.Module._getKernelDensity(buf, nBins, nVals)
  let o = replaysPointer/4
  const kDensities = window.Module.HEAPF32.slice(o,o+nBins)
  return kDensities
}
