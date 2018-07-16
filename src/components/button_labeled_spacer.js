import React from 'react'

export default (props) => {
  return (
    <form
      className={`input-group filterGroup buttonSpacer ${props.overclass ? props.overclass : ''}`}
      onClick={(event) => {
        event.preventDefault()
        if (props.onPress) {
          props.onPress()
        }
      }}
    >
      <button
        className='btn btn-small btn-link iconFilter'
      >
        {props.filterName}{!props.noSpace &&<span>&nbsp;&nbsp;&nbsp;</span>}
        <span className="iconOnButton">
          <i className={`fa ${props.faIcon}`} aria-hidden="true"></i>
        </span>
        {props.info && <i title={props.info} className="fa fa-info-circle infoButton" aria-hidden="true"></i>}
      </button>
    </form>
  )
}
