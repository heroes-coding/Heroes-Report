import React from 'react'
import { hiddenColumns } from '../../helpers/definitions'

export default (props) => {
  return (
    <div className={`rt-td statBoxHolder ${(hiddenColumns.includes(props.id) || (props.cat === 'Overall' && [14,16,17].includes(props.id))) ? 'd-none d-sm-block' : ''}`}>
      <div
        className='WLBox'
      >
        <div className="WBox">
          {props.wValue}
        </div>
        <div className="LBox">
          {props.lValue}
        </div>
      </div>
    </div>
  )
}
