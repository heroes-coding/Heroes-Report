import React from 'react'
import { Link } from 'react-router-dom'

export default (props) => {
  return (
    <li className="nav-item active text-center">
      <Link
        to={props.link}
        className='nav-link navMenuText brightButton'
        onClick={(event) => {
          if (props.clickFunction) {
            event.preventDefault()
            props.clickFunction()
          }
        }}
      >
        {props.name}
      </Link>
    </li>
  )
}
