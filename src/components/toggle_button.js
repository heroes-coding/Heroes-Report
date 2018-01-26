import React from 'react'

export default (props) => {
  return (
    <button
      className={props.containerClass}
      onClick={(event) => {
        event.preventDefault()
        props.toggleFunction()
      }}
    >
      {props.toggleText}
      {props.active ? props.activeIcon : props.inactiveIcon}
    </button>
  )
}
