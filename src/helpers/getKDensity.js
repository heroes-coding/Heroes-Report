export default function getKDensity(k, bins, values) {
  const nBins = bins.length
  const nVals = values.length
  if (nBins < 3 || nVals < 3) {
    console.log('Not enough data for kDensity')
    return []
  }
  let buf, error, kDensities
  try {
    buf = window.Module._malloc((nBins+nVals+1)*16,4)
    let data = [].concat(k,bins,values)
    data = new Float32Array(data)
    const kDensity = {nK:(nBins+nVals+1)*16, nBins, nVals, data}
    window.kDensity = kDensity
    window.Module.HEAPF32.set(data,buf >> 2)
    // const replaysPointer = window.Module.ccall('getKernelDensity', "number", ["array", "number", "number"], [new Int8Array(kDensity.data),kDensity.nBins,kDensity.nVals], {heapIn: "HEAPF32", heapOut: "HEAPF32", returnArraySize: kDensity.nVals*4})
    const replaysPointer = window.Module._getKernelDensity(buf, nBins, nVals)
    let o = replaysPointer/4
    kDensities = window.Module.HEAPF32.slice(o,o+nBins)
  } catch (e) {
    error = e
  } finally {
    if (!window.isElectron) window.Module._free(buf)
  }
  if (error) throw error
  // window.Module._free((nBins+nVals+1)*4)
  return kDensities
}
