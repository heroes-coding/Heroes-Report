import React, { Component } from 'react'
import { sToM } from '../../helpers/smallHelpers'

class ChatLog extends Component {
  render() {
    const { colors, handles, heroNames, chat } = this.props
    return (
      <div className="chatLog">
        <div className="chatTitle">Allied Chat History</div>
        {chat.map((c,i) => {
          let [ loops, h, line ] = c
          line = line.split(':').join('<').split(':').join('>')
          const style = {color:colors[h]}
          const handle = handles[h]
          const hero = heroNames[h]
          const time = sToM(loops)
          const key = `Chat ${i}`
          return (
            <div key={key} className="chatLine">
              <span className="handleSpan">{handle}</span> (<span style={style}>{hero}</span>) <span className="timeSpan">[{time}]</span>:&nbsp;&nbsp;&nbsp;{line}
            </div>
          )
        })}
      </div>
    )
  }
}

export default ChatLog
