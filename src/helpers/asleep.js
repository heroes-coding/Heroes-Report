export default function asleep(ms) {
  let promise = new Promise(function(resolve, reject) {
    setTimeout(function() { resolve(true) }, ms)
  })
  return promise
}
