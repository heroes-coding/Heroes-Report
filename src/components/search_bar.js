import React, { Component } from 'react'

class SearchBar extends Component {
  constructor(props) {
    super(props)
    this.state = { term: '' }
    this.clearSearch = this.clearSearch.bind(this)
  }
  clearSearch() {
    this.setState({term: ''})
  }
  componentWillUnmount() {
    if (this.clearTimeout) {
      clearTimeout(this.clearTimeout)
    }
  }
  render() {
    return (
      <input
        placeholder={ this.props.placeholder }
        className={this.props.overClass || "searchInput"}
        value = { this.state.term }
        onChange={ event => {
          this.onInputChange(event.target.value)
        }}
        style={ this.props.style }
      />
    )
  }
  onInputChange(term) {
    this.setState({term})
    this.props.onSearchTermChange(term)
    if (!this.props.noautoclear) {
      if (this.clearTimeout) clearTimeout(this.clearTimeout)
      this.clearTimeout = setTimeout(this.clearSearch, 5000)
    }
  }
}

export default SearchBar
