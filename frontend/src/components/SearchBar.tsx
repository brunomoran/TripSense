import { useState } from "react";

import "../styles/SearchBar.css"

type Props = {
    placeholder: string;
    onSearch: (searchText: string) => void;
    isLoading?: boolean;
}

const SearchBar = ({ placeholder, onSearch, isLoading = false }: Props) => {
  const [searchText, setSearchText] = useState("");

  return (
    <div className="search-bar-container">
      <input
        type="text"
        placeholder={placeholder}
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
        className="search-bar-input"
      />
      <button className="search-bar-button" onClick={() => onSearch(searchText)}>Buscar</button>
    </div>
  )
}

export default SearchBar