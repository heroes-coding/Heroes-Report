import React from 'react'

export default (props) => {
  return (
    <div className={`col-12 col-sm-6 col-xl-6 noPadding ${props.extraClass}`} align="center">
      {props.childComponent}
    </div>
  )
}
