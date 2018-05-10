if (!window.indexedDB) { window.alert("Your browser doesn't support a stable version of IndexedDB. Don't try to use it with this replay viewer. Switch to Chrome or Firefox") }

export default () => {
  let IDB
  const database = {IDB}
  database.addFull = (fullDateData) => {
    let promise = new Promise(function(resolve, reject) {
      const transaction = database.IDB.transaction("fullReplays", "readwrite").objectStore("fullReplays")
      const request = transaction.put(fullDateData) // Must be an object with the form {dayMode: "999-2", data: UInt32Array}
      request.onerror = function(event) { console.log("Could not add", fullDateData, "to local DB", event); resolve(false) }
      request.onsuccess = function(event) { resolve(true) }
    })
    return promise
  }
  database.getFull = (dayMode) => {
    let promise = new Promise(function(resolve, reject) {
      const transaction = database.IDB.transaction(["fullReplays"]).objectStore("fullReplays")
      const request = transaction.get(dayMode)
      request.onsuccess = function(event) { resolve(event.target.result) }
      request.onerror = function(event) { console.log("Could not get", dayMode, "to local DB", event); resolve(null) }
    })
    return promise
  }
  let promise = new Promise(function(resolve, reject) {
    let IDBrequest = window.indexedDB.open("fullReplays",5)
    IDBrequest.onerror = function(event) {
      window.alert("Please enable indexed DB on your next visit to cut down on data usage and speed up your experience")
      resolve(null)
    }
    IDBrequest.onsuccess = function(event) {
      database.IDB = event.target.result
      resolve(database)
    }
    IDBrequest.onupgradeneeded = function(event) {
      database.IDB = event.target.result
      console.log("Creating indexed database for full replays...")
      database.IDB.createObjectStore("fullReplays", { keyPath: "dayMode" })
      resolve(database)
    }
  })
  return promise
}
