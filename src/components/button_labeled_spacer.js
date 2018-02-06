import React from 'react'

export default (props) => {
  return (
    <form className={`input-group filterGroup buttonSpacer ${props.overclass ? props.overclass : ''}`}>
      <button
        className='btn btn-small btn-link iconFilter'
        onClick={(event) => {
          event.preventDefault()
          if (props.onPress) {
            props.onPress()
          }
        }}
      >
        {props.filterName}&nbsp;&nbsp;&nbsp;
        <span className="iconOnButton">
          <i className={`fa ${props.faIcon}`} aria-hidden="true"></i>
        </span>
      </button>
    </form>
  )
}
