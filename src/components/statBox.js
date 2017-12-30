import React from 'react'
import PercentBar from '../components/percent_bar'

function percentBar(props) {
  if (props.id===13) {
    return (
      <div className="statBoxLine">
        <PercentBar percent={props.percent} />
      </div>
    )
  }
}

export default (props) => {
  return (
    <div className='rt-td statBoxHolder'>
      <div
        className='statBox'
      >
        <div>
          {props.display}
        </div>
        {percentBar(props)}
      </div>
    </div>
  )
}
