import React from 'react'

export default (props) => {
  return (
    <div className='double-cell'>
      <div
        className='inner-double'
        color={props.topColor ? props.topColor : 'white'}
      >
        {props.topValue}
      </div>
      <div
        className='inner-double'
        color={props.bottomColor ? props.bottomColor : 'white'}
      >
        {props.bottomValue}
      </div>
    </div>
  )
}
