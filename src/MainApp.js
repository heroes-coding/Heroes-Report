import React from 'react'
import ReactDOM from 'react-dom'
import Startup from './Startup'
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
window.timings = {}
window.d3 = d3
window.debug = function(msg) {
  if (process.env.NODE_ENV !== "production") {
    console.log(msg)
  }
}
console.log(window.location)

const createStoreWithMiddleware = applyMiddleware(ReduxPromise)(createStore)

ReactDOM.render(
  <Provider store={createStoreWithMiddleware(reducers)}>
    <App />
  </Provider>, document.getElementById('root')
)
