import React from 'react'

export default (props) => {
  return (
    <button
      className={props.containerClass}
      onClick={(event) => {
        event.preventDefault()
        props.toggleFunction(props.active)
      }}
    >
      {props.toggleText}
      {props.active ? props.activeIcon : props.inactiveIcon}
      {props.info && <i title={props.info} className="fa fa-info-circle infoButton" aria-hidden="true"></i>}
    </button>
  )
}
