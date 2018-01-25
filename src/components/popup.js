import React from 'react'

// {props.desc.replace('❢ Quest:','❢ Quest:')}
function descriptionator(desc) {
  window.desc = desc
  if (!desc.includes('❢')) {
    return <div className='popupDesc'>{desc}</div>
  }
  return <div className='popupDesc'>{desc.split('❢').map((x,i) => {
    return <span key={i}>{i > 1 ? <br/> : null}{i ? <span className='quest'>❢</span> : null}{x}</span>
  })}</div>
}

export default (props) => {
  return (
    <div className="popupHolder">
      <div
        className={`${props.classo} ${props.open ? 'popupAlive' : ''}`}
        style={{top:props.y,left:props.x}}
      >
        <div className='popupPicHolder'>
          <img
            src = {props.pic}
            className="popupPic"
            alt={props.pic}
          ></img>
        </div>
        <div className='popupText'>
          <div className='popupName'>{props.name}</div>
          <div className='popupDesc'>{descriptionator(props.desc)}</div>
        </div>
      </div>
    </div>
  )
}
