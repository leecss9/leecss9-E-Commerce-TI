import React from "react";
import { Search as SearchIcon } from "lucide-react";
import "../styles/Search.css";

function SearchBar({ searchTerm, setSearchTerm }) {
  return (
    <div className="search-container">
      <input
        type="text"
        placeholder="Buscar productos..."
        className="search-input"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <SearchIcon className="search-icon" />
    </div>
  );
}

export default SearchBar;



