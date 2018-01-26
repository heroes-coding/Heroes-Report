import React from 'react'

function renderDropdown(d, updateFunction, leftComponentRenderer, rightComponentRenderer, renderName) {
  return (
    <button
      className="dropdown-item dropdownHolder"
      type="button"
      key={d.id}
      onClick={(event) => {
        event.preventDefault()
        updateFunction(d.data ? d.data : d.id)
      }}
    >
      {leftComponentRenderer(d.id)}
      {renderName ? d.name : ''}
      {rightComponentRenderer(d.id)}
    </button>
  )
}

function renderButtonLabel(props) {
  if (props.buttonLabel) {
    return <span>{props.buttonLabel}&nbsp;&nbsp;</span>
  }
  return (
    <span className={props.textClass}>
      {props.leftComponentRenderer(props.currentID)}
      {props.name}{props.currentSelection}&nbsp;&nbsp;
      {props.rightComponentRenderer(props.currentID)}
    </span>
  )
}

export default (props) => {
  return (
    <form className={`${props.containerClass ? props.containerClass : 'input-group filterGroup '}` + ' justify-content-center'}>
      {props.resetFunction && <button
        className='btn btn-small btn-link iconFilter'
        onClick={(event) => {
          event.preventDefault()
          props.resetFunction('A')
        }}
      ><i className="fa fa-undo iconOnButton" aria-hidden="true"></i><span className=" d-none d-sm-block"> {props.updateType && `${props.updateType}:`}</span></button>}
      <button
        className={`btn btn-small btn-link ${props.overClass ? props.overClass : 'iconFilter'}`}
        id={props.id}
        data-toggle="dropdown"
        aria-haspopup="true"
        aria-expanded="false"
        onClick={(event) => { event.preventDefault() }}
      >
        {renderButtonLabel(props)}
        {!props.hideArrow&&<span className="iconOnButton"><i className="fa fa-chevron-circle-down" aria-hidden="true"></i></span>}
      </button>
      <div className="dropdown-menu" aria-labelledby={props.id}>
        {props.dropdowns.map(d => renderDropdown(d, props.updateFunction, props.leftComponentRenderer, props.rightComponentRenderer, props.renderDropdownName))}
      </div>
    </form>
  )
}
