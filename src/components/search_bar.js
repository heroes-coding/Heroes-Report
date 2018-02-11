import React, { Component } from 'react'

class SearchBar extends Component {
  constructor(props) {
    super(props)
    this.state = { term: '' }
  }
  render() {
    return (
      <input
        placeholder={ this.props.placeholder }
        className="searchInput"
        value = { this.state.term }
        onChange={ event => this.onInputChange(event.target.value)}
        style={ this.props.style }
      />
    )
  }
  onInputChange(term) {
    console.log('onINputChange called',term)
    this.setState({term})
    this.props.onSearchTermChange(term)
  }
}

export default SearchBar
