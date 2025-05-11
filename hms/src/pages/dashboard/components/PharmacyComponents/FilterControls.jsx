import React from "react";
import { FiFilter } from "react-icons/fi";

const FilterControls = ({ 
  filterId, 
  setFilterId, 
  filterDate, 
  setFilterDate, 
  handleFilter,
  isLoading 
}) => {
  return (
    <div className="ph-filter-container">
      <div className="ph-filter-group">
        <FiFilter className="ph-filter-icon" />
        <input
          type="text"
          className="ph-filter-input"
          value={filterId}
          onChange={(e) => setFilterId(e.target.value)}
          placeholder="Patient ID or Phone"
          disabled={isLoading}
        />
      </div>
     
      <button 
        className="ph-filter-button" 
        onClick={handleFilter}
        disabled={isLoading}
      >
        {isLoading ? "Filtering..." : "Apply Filters"}
      </button>
    </div>
  );
};

export default FilterControls;