import React from 'react'

export default (props) => {
  return (
    <li className="nav-item active text-center">
      <button
        className='active nav-link navMenuText brightButton'
        onClick={(event) => {
          event.preventDefault()
          props.clickFunction()
        }}
      >
        {props.name}
      </button>
    </li>
  )
}
