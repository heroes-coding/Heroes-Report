import React from 'react'

function DropdownItem(props) {
  const { d, updateFunction, dropdownClass } = props
  const dClass = `dropdown-item dropdownHolder ${dropdownClass || ''}`
  return (
    <button
      className={dClass}
      type="button"
      key={d.id}
      onClick={(event) => {
        event.preventDefault()
        updateFunction(d.data ? d.data : d.id)
      }}
    >
      {d.name}
    </button>
  )
}

function renderButtonLabel(props) {
  if (props.buttonLabel) {
    return <span>{props.buttonLabel}&nbsp;&nbsp;</span>
  }
  return (
    <span className={props.textClass}>
      {props.name}{props.currentSelection}&nbsp;&nbsp;
    </span>
  )
}

export default (props) => {
  return (
    <div className={`${props.containerClass ? props.containerClass : 'input-group filterGroup '}` + ' justify-content-center'}>
      <button
        className={`roleButton btn btn-small btn-link ${props.overClass ? props.overClass : 'iconFilter'}`}
        id={props.id}
        data-toggle="dropdown"
        aria-haspopup="true"
        aria-expanded="false"
        title={props.title}
        onClick={(event) => { event.preventDefault() }}
      >
        {renderButtonLabel(props)}
        {!props.hideArrow&&<span className="iconOnButton"><i className="fa fa-chevron-circle-down" aria-hidden="true"></i></span>}
      </button>
      <div className="dropdown-menu" aria-labelledby={props.id}>
        {props.dropdowns.map((d,i) => {
          return (
            <DropdownItem
              key={i}
              d={d}
              updateFunction={props.updateFunction}
              dropdownClass={props.dropdownClass}
            />
          )
        })}
      </div>
    </div>
  )
}
