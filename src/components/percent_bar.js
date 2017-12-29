import React from 'react'

export default (props) => {
  return (
    <svg className="percentSVG" height="10px" width="80%" viewBox="0 0 100 10" preserveAspectRatio="none">
      <path d= "M 10 2 L 90 2 L 90 8 L 10 8 Z" className="percentPathHolder" />
      <line x1="10" y1="5" x2={(90*props.percent).toString()} y2="5" className="percentPath" stroke={props.barColor} />
    </svg>
  )
}
