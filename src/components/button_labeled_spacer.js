import React from 'react'

export default (props) => {
  return (
    <form className="input-group filterGroup buttonSpacer">
      <button
        className='btn btn-small btn-link iconFilter'
        onClick={(event) => { event.preventDefault(); props.onPress() }}
      >
        {props.filterName}:&nbsp;&nbsp;&nbsp;
        <span className="iconOnButton">
          <i className={`fa ${props.faIcon}`} aria-hidden="true"></i>
        </span>
      </button>
    </form>
  )
}
