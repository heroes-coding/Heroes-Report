export function sortArrayReturnIndices(array,desc) {
  if (isNaN(desc)) desc = desc ? 1 : 0 // take care of true / false conversion
  // console.log('exponential smoothing CP called',window.moduleLoaded)
  const N = array.length
  let buf, error, sortedIndices
  try {
    buf = window.Module._malloc(N*4,4)
    const data = new Int32Array(array)
    window.Module.HEAP32.set(data,buf >> 2)
    const arrayPointer = window.Module._sortArrayReturnIndices(buf, N, desc)
    let o = arrayPointer/4
    sortedIndices = window.Module.HEAP32.slice(o,o+N)
  } catch (e) {
    error = e
  } finally {
    if (!window.isElectron) window.Module._free(buf)
  }
  if (error) throw error
  return sortedIndices
}

export function sortObjectListByProperty(array, prop, desc) {
  // array is an array with dictionaries inside.  Prop is the name of the element to sort by.  Desc is descending (true)
  const propsArray = array.map(x => x[prop])
  const propsIndexes = sortArrayReturnIndices(propsArray, desc)
  // need to convert back to a normal array for mapping to work properly
  return Array.from(propsIndexes).map(i => array[i])
}
