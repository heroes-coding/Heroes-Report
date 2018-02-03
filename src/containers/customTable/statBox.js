import React from 'react'
import PercentBar from '../../components/percent_bar'
import { hiddenColumns } from '../../helpers/definitions'

function percentBar(props) {
  if (props.id===13) {
    return (
      <div className="statBoxLine">
        <PercentBar percent={props.percent} />
      </div>
    )
  }
}

export default (props) => {
  return (
    <div className={`rt-td statBoxHolder ${(hiddenColumns.includes(props.id) || (props.cat === 'Overall' && [14,16,17].includes(props.id))) ? 'd-none d-sm-block' : ''}`}>
      <div
        className='statBox'
      >
        <div>
          {props.display}
        </div>
        {percentBar(props)}
      </div>
    </div>
  )
}
