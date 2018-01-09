import React from 'react'

export default (props) => {
  return (
    <svg className="percentSVG" height="100%" width="80%" viewBox="0 0 100 10" preserveAspectRatio="none">
      <path d= "M 10 2 L 90 2 L 90 8 L 10 8 Z" className="percentPathHolder" />
      <line x1="11" y1="5" x2={(11 + 78*props.percent).toString()} y2="5" className="percentPath" stroke={props.barColor ? props.barColor : '#D75813'} />
    </svg>
  )
}
