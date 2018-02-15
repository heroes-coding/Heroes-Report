import React from 'react'
import Arc from '../../components/arc'

export default (props) => {
  let { name, id, color, updateFunction } = props
  return (
    <div className={`rt-td`} >
      {updateFunction &&<i
        className="fa fa-line-chart"
        aria-hidden="true"
        onClick={() => updateFunction(id,name,color)}
      />}
      &nbsp;
      <span
        className='heroName'
        style={{color:color}}
        onClick={() => { if (updateFunction) updateFunction(id,name,color) }}
      >
        {name}
      </span>
    </div>
  )
}
