import createIDB from './indexeddb'
import { loadRustyReplays } from '../containers/advanced/connectors'
import asleep from './asleep'
import { dateToDSL } from './smallHelpers'
import axios from 'axios'
let rustyPromise
let retrievedReplays = 0
const retrievedData = []

export default async function getReplayBinary(dates, modeTypes, partial=true) {
  // gets local copy of data, if exists, and augments it with call to your partial file server
  const start = dateToDSL(dates.startDate)
  const end = dateToDSL(dates.endDate)
  const days = []
  const modes = []
  for (let day=start;day<=end;day++) {
    for (let j=0;j<modeTypes.length;j++) {
      const mode = modeTypes[j]
      const key = `${day}-${mode}`
      if (retrievedData.includes(key)) continue
      retrievedData.push(key)
      days.push(day)
      modes.push(mode)
    }
  }
  let promise = new Promise(async function(resolve, reject) {
    if (!days.length) return resolve(retrievedReplays)
    if (!rustyPromise) rustyPromise = loadRustyReplays()
    const database = await createIDB()
    let offsets = []
    let results = []
    for (let i=0;i<days.length;i++) {
      const key = `${days[i]}-${modes[i]}`
      let result = await database.getFull(key)
      if (result && result.data) {
        results.push(result.data)
        offsets.push(result.data.byteLength)
      } else {
        results.push(new Uint32Array())
        offsets.push(0)
      }
    }

    // const data = `day=${days.join(",")}&mode=${modes.join(",")}&offset=${offsets.join(",")}`
    const data = { day: days, mode: modes, offset: offsets, vip:0, id:123, pw: 'hiya' }
    console.log({data})
    // const result = await axios.post('http://localhost:3333/', params, { headers: { 'Content-Type':'text/plain' } })
    const result = await axios.request({
      responseType: 'arraybuffer',
      data,
      url: 'https://heroes.report/full', // 'http://localhost:3333/',
      method: 'post',
      /*
      headers: {
        'Content-Type':'text/plain',
      },
      */
    })
    window.result = result
    console.log({result})
    const arrayBuffer = result.data
    window.aBuffer = arrayBuffer
    let realInts = []
    let offset = 0
    for (let d=0;d<days.length;d++) {
      let length = new Uint32Array(arrayBuffer.slice(offset,offset+4))[0]
      offset = offset + 4
      const newBuffer = new Uint32Array((offsets[d] + length)/4)
      newBuffer.set(results[d])
      newBuffer.set(new Uint32Array(arrayBuffer.slice(offset,offset+length)), offsets[d]/4)
      realInts.push(newBuffer)
      await database.addFull({ dayMode: `${days[d]}-${modes[d]}`, data:newBuffer })
      offset += length
    }
    await rustyPromise
    while (!window.HOTS) await asleep(50)
    window.rustyReplays.addBasics(window.HOTS)
    console.time(`${partial ? "Partial" : "Full"} Replay Adding`)
    if (partial) {
      for (let i=0;i<realInts.length;i++) {
        if (realInts[i].length === 0 || realInts[i].length % 16 !== 0) continue
        console.log({DSL: days[i]})
        retrievedReplays += window.rustyReplays.addReplays(realInts[i],days[i],modes[i])
      }
    } else {
      retrievedReplays += window.rustyReplays.addManyReplays(realInts,days,modes)
    }
    console.timeEnd(`${partial ? "Partial" : "Full"} Replay Adding`)
    console.log({retrievedReplays})
    resolve(retrievedReplays)
  })
  return promise
}
