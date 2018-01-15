import React from 'react'
import { Link } from 'react-router-dom'

export default (props) => {
  return (
    <Link
      to={props.link}
      className='nav-link navMenuText brightButton'
      style={props.style ? props.style : {}}
      onClick={(event) => {
        if (props.clickFunction) {
          event.preventDefault()
          props.clickFunction()
        }
      }}
    >
      {props.name}
    </Link>
  )
}
