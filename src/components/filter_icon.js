import React from 'react'

export default (props) => {
  return (
    <div id="filterButtonHolder">
      <span className="input-group-btn">
        <button
          className='btn btn-small btn-link iconFilter'
          onClick={(event) => {
            event.preventDefault()
            props.updateFilter(props.id)
          }}
        >
          <img
            src={`https://heroes.report/appIcons/${props.name}.png`}
            alt={props.name}
            className={`iconBorder ${props.selected ? 'selectedImage' : 'unselectedImage'}`}
          ></img>
        </button>
      </span>
    </div>
  )
}
