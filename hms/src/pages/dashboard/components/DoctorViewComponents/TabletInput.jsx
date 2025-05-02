import React, { useState, useEffect,useImperativeHandle,forwardRef } from "react";
import axios from "axios";

const TabletInput = forwardRef((props, ref) => {
  const [tablets, setTablets] = useState([]);
  const [medicineOptions, setMedicineOptions] = useState([
    { id: 1, name: "Paracetamol", dosage: "500mg" },
    { id: 2, name: "Amoxicillin", dosage: "250mg" },
    { id: 3, name: "Azithromycin", dosage: "500mg" },
    { id: 4, name: "Cetirizine", dosage: "10mg" },
    { id: 5, name: "Ibuprofen", dosage: "400mg" },
    { id: 6, name: "Metformin", dosage: "500mg" },
    { id: 7, name: "Pantoprazole", dosage: "40mg" },

  ]);
  const [activeIndex, setActiveIndex] = useState(null);
  const [searchTerms, setSearchTerms] = useState([]); 



  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const response = await axios.get("http://localhost:8080/api/medicines");
        setMedicineOptions(response.data);
      } catch (error) {
        console.error("Error fetching medicine options:", error);
      }
    };
    fetchOptions();
  }, []);

  const handleTabletCountChange = (count) => {
    const tabletCount = parseInt(count) || 0;
    const updatedTablets = Array.from({ length: tabletCount }, () => ({
      name: "",
      count: "",
      dosage: "",
      customMedicine: "",
    }));
    setTablets(updatedTablets);
    setSearchTerms(Array(tabletCount).fill("")); 
  };

  const handleTabletChange = (index, field, value) => {
    const updatedTablets = [...tablets];
    updatedTablets[index][field] = value;
    setTablets(updatedTablets);
  };

  useImperativeHandle(ref, () => ({
    getTabletData: () => tablets,
    resetTabletData: () => setTablets([])
  }));
  

  const handleSearchChange = (index, value) => {
    const updatedSearchTerms = [...searchTerms];
    updatedSearchTerms[index] = value;
    setSearchTerms(updatedSearchTerms);
    handleTabletChange(index, "name", value);
    setActiveIndex(index); // set current active index
  };


  

  return (
    <div className="tablet-input-section">
      <h3>Tablets</h3>


      <div className="form-group">

        <label>Number of Tablets:</label>
        <input
          type="number"
          min="0"
          onChange={(e) => handleTabletCountChange(e.target.value)}
        />
      </div>

      {tablets.map((tablet, index) => {
        const filteredOptions = medicineOptions.filter(option =>
          option.name.toLowerCase().includes((searchTerms[index] || "").toLowerCase())
        );

        return (
          <div key={index} className="tablet-row">
            <div className="form-group">
              <label>Medicine Name</label>
              <div className="autocomplete">
                <input
                  type="text"
                  value={tablet.name}
                  onChange={(e) => handleSearchChange(index, e.target.value)}
                  onFocus={() => setActiveIndex(index)} // activate dropdown on focus
                  placeholder="Search medicine..."
                />
                {activeIndex === index && searchTerms[index] && (
                  <div className="autocomplete-dropdown">
                    <>
  {filteredOptions.map((option) => (
    <div
      key={option.id}
      className="dropdown-item"
      onClick={() => {
        handleTabletChange(index, "name", option.name);
        handleTabletChange(index, "dosage", option.dosage);
        setSearchTerms((prev) => {
          const newTerms = [...prev];
          newTerms[index] = "";
          return newTerms;
        });
        setActiveIndex(null);
      }}
    >
      {option.name} ({option.dosage})
    </div>
  ))}
  
  <div
    className="dropdown-item"
    style={{ fontStyle: "italic", color: "#666" }}
    onClick={() => {
      handleTabletChange(index, "name", "");
      handleTabletChange(index, "dosage", "");
      setSearchTerms((prev) => {
        const newTerms = [...prev];
        newTerms[index] = ""; 
        return newTerms;
      });
      setActiveIndex(null);
    }}
  >
    Other (Enter Custom Name)
  </div>
</>

                  </div>
                )}
              </div>
            </div>

            <div className="form-group">
              <label>Count</label>
              <input
                type="number"
                min="1"
                value={tablet.count}
                onChange={(e) => handleTabletChange(index, "count", e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Dosage</label>
              <select
                value={tablet.dosage}
                onChange={(e) => handleTabletChange(index, "dosage", e.target.value)}
              >
                <option value="">Select Dosage</option>
                <option value="100mg">100mg</option>
                <option value="250mg">250mg</option>
                <option value="500mg">500mg</option>
                <option value="1000mg">1000mg</option>
              </select>
            </div>
          </div>
        );
      })}
    </div>
  );
});

export default TabletInput;
