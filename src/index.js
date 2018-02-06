import React from 'react'
import ReactDOM from 'react-dom'
import App from './App'
import * as d3 from 'd3'
import { Provider } from 'react-redux'
import { createStore, applyMiddleware } from 'redux'
import ReduxPromise from 'redux-promise'
import reducers from './reducers'
import '../node_modules/bootstrap/dist/css/bootstrap.min.css'
import '../node_modules/font-awesome/css/font-awesome.min.css'
import * as styles from './style/style.css'

window.styles = styles

window.save = function(data, filename) {
  if(!data) {
      console.error('Console.save: No data')
      return;
  }

  if(!filename) filename = 'console.json'

  if(typeof data === "object"){
      data = JSON.stringify(data, undefined, 4)
  }

  var blob = new Blob([data], {type: 'text/json'}),
      e    = document.createEvent('MouseEvents'),
      a    = document.createElement('a')

  a.download = filename
  a.href = window.URL.createObjectURL(blob)
  a.dataset.downloadurl =  ['text/json', a.download, a.href].join(':')
  e.initMouseEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null)
  a.dispatchEvent(e)
}

window.d3 = d3
window.debug = function(msg) {
  if (process.env.NODE_ENV !== "production") {
    console.log(msg)
  }
}

const createStoreWithMiddleware = applyMiddleware(ReduxPromise)(createStore)

ReactDOM.render(
  <Provider store={createStoreWithMiddleware(reducers)}>
    <App />
  </Provider>, document.getElementById('root')
)
