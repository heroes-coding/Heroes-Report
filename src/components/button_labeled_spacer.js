import React from 'react'

export default (props) => {
  return (
    <form className="input-group filterGroup buttonSpacer">
      <button
        className='btn btn-small btn-link iconFilter'
        onClick={(event) => { event.preventDefault() }}
      >
        <span className="iconOnButton">
          <i className={`fa ${props.faIcon}`} aria-hidden="true"></i>&nbsp;&nbsp;
        </span>
        {props.filterName}:
      </button>
    </form>
  )
}
