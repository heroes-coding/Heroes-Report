import React from 'react'
import PercentBar from '../components/percent_bar'

export default (props) => {
  return (
    <div className='statBoxHolder'>
      <div
        className='statBox'
        style={{'color': props.color ? props.color : 'white'}}
      >
        <div>
          {props.display}
        </div>
        <div className="statBoxLine">
          <PercentBar percent={props.percent} barColor={props.barColor} />
        </div>
      </div>
    </div>
  )
}
