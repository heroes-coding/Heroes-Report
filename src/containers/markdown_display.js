import Remarkable from 'remarkable'
import React, { Component } from 'react'
const parser = new Remarkable({html: true,linkify: true, breaks: true, xhtmlOut: true})

class Markdown extends Component {
  componentWillMount() {
    const path = this.props.path
    window.fetch(path)
      .then(response => {
        return response.text()
      })
      .then(text => {
        console.log(text)
        this.setState({
          markdown: parser.render(text)
        })
      })
  }
  constructor(props) {
    super(props)
    this.state = { markdown: null }
  }
  render() {
    const { markdown } = this.state
    return (
      <div className="overall">
        <div className="row d-flex justify-content-end" id="playerPageHolder">
          <div className="container-fluid col-12 col-md-12 col-lg-12" id="talentBox">
            <div className="container-fluid col-12 col-md-12 col-lg-12" id="talentBox">
              <div dangerouslySetInnerHTML={{__html:markdown}} />
            </div>
          </div>
        </div>
      </div>
    )
  }
}

export default Markdown
