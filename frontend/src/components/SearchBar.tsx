import React from 'react'

import "../styles/SearchBar.css"

type Props = {
    placeholder: string;
    onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const SearchBar = (props: Props) => {
  return (
    <div className="search-bar-container">
      <input
        type="text"
        placeholder={props.placeholder}
        onChange={props.onChange}
        className="search-bar-input"
      />
      <button className="search-bar-button">Search</button>
    </div>
  )
}

export default SearchBar