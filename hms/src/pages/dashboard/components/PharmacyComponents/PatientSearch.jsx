import React from "react";
import { FiSearch } from "react-icons/fi";

const PatientSearch = ({ searchId, setSearchId, handleSearch, isLoading }) => {
  return (
    <div className="ph-search-container">
      <div className="ph-search-group">
        <FiSearch className="ph-search-icon" />
        <input
          type="text"
          className="ph-search-input"
          value={searchId}
          onChange={(e) => setSearchId(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          placeholder="Enter Patient ID or Phone"
          disabled={isLoading}
        />
        <button 
          className="ph-search-button" 
          onClick={handleSearch}
          disabled={isLoading}
        >
          {isLoading ? "Searching..." : "Search"}
        </button>
      </div>
    </div>
  );
};

export default PatientSearch;