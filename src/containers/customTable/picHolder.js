import React from 'react'
import Arc from '../../components/arc'

export default (props) => {
  const { id, color, baseLink } = props
  return (
    <div className="rt-td roundedPort">
      <img
        className='roundedPort'
        alt={id}
        src={`${baseLink}${id}.jpg`}
        id={`image${id}`}
      />
      <Arc
        dim={38}
        translate="(20,21)"
        color={color}
        id={id}
      />
    </div>
  )
}
