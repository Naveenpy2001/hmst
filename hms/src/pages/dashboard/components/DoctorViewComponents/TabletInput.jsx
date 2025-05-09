import React, {
  useState,
  useEffect,
  useImperativeHandle,
  forwardRef,
} from "react";
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
    { id: 8, name: "Dolo 650", dosage: "650mg" },
    { id: 9, name: "Combiflam", dosage: "400mg" },
    { id: 10, name: "Crocin", dosage: "500mg" },
    { id: 11, name: "Saridon", dosage: "250mg" },
    { id: 12, name: "Cyclopam", dosage: "20mg" },
    { id: 13, name: "Digene", dosage: "10mg" },
    { id: 14, name: "Gelusil", dosage: "500mg" },
    { id: 15, name: "Zerodol", dosage: "100mg" },
    { id: 16, name: "Volini", dosage: "50mg" },
    { id: 17, name: "Omnicef", dosage: "300mg" },
    { id: 18, name: "Cefixime", dosage: "200mg" },
    { id: 19, name: "Augmentin", dosage: "625mg" },
    { id: 20, name: "Ciprofloxacin", dosage: "500mg" },
    { id: 21, name: "Levofloxacin", dosage: "500mg" },
    { id: 22, name: "Ofloxacin", dosage: "200mg" },
    { id: 23, name: "Norfloxacin", dosage: "400mg" },
    { id: 24, name: "Dexorange", dosage: "10ml" },
    { id: 25, name: "Liv 52", dosage: "2 tablets" },
    { id: 26, name: "Himalaya Septilin", dosage: "2 tablets" },
    { id: 27, name: "Rantac", dosage: "150mg" },
    { id: 28, name: "Pan-D", dosage: "40mg" },
    { id: 29, name: "Rabeprazole", dosage: "20mg" },
    { id: 30, name: "Domperidone", dosage: "10mg" },
    { id: 31, name: "Ondansetron", dosage: "4mg" },
    { id: 32, name: "Metronidazole", dosage: "400mg" },
    { id: 33, name: "Albendazole", dosage: "400mg" },
    { id: 34, name: "Mebendazole", dosage: "100mg" },
    { id: 35, name: "Atorvastatin", dosage: "10mg" },
    { id: 36, name: "Rosuvastatin", dosage: "10mg" },
    { id: 37, name: "Telma", dosage: "40mg" },
    { id: 38, name: "Amlodipine", dosage: "5mg" },
    { id: 39, name: "Losartan", dosage: "50mg" },
    { id: 40, name: "Metoprolol", dosage: "25mg" },
    { id: 41, name: "Ecosprin", dosage: "75mg" },
    { id: 42, name: "Clopidogrel", dosage: "75mg" },
    { id: 43, name: "Montelukast", dosage: "10mg" },
    { id: 44, name: "Levocetirizine", dosage: "5mg" },
    { id: 45, name: "Aceclofenac", dosage: "100mg" },
    { id: 46, name: "Diclofenac", dosage: "50mg" },
    { id: 47, name: "Pregabalin", dosage: "75mg" },
    { id: 48, name: "Gabapentin", dosage: "300mg" },
    { id: 49, name: "Thyroxine", dosage: "50mcg" },
    { id: 50, name: "Metformin", dosage: "500mg" },
    { id: 51, name: "Glimipiride", dosage: "1mg" },
    { id: 52, name: "Voglibose", dosage: "0.2mg" },
    { id: 53, name: "Insulin", dosage: "10IU" },
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
      frequency: "OD",
      duration: "1",
    }));
    setTablets(updatedTablets);
    setSearchTerms(Array(tabletCount).fill(""));
  };

  const handleTabletChange = (index, field, value) => {
    const updatedTablets = [...tablets];
    updatedTablets[index][field] = value;
    setTablets(updatedTablets);
  };

  const handleDosageChange = (index, value) => {
    // Automatically append 'mg' if it's a number
    const dosageValue = isNaN(value) ? value : `${value}mg`;
    handleTabletChange(index, "dosage", dosageValue);
  };

  useImperativeHandle(ref, () => ({
    getTabletData: () => tablets,
    resetTabletData: () => {
      setTablets([]);
      setSearchTerms([]);
    },
  }));

  const handleSearchChange = (index, value) => {
    const updatedSearchTerms = [...searchTerms];
    updatedSearchTerms[index] = value;
    setSearchTerms(updatedSearchTerms);
    handleTabletChange(index, "name", value);
    setActiveIndex(index);
  };

  return (
    <div className="tablet-input-section">
      <h3>Tablets</h3>

      <div className="form-group">
        <label>Number of Tablets:</label>
        <input
          type="number"
          min="0"
          max="10"
          onChange={(e) => handleTabletCountChange(e.target.value)}
        />
      </div>

      {tablets.map((tablet, index) => {
        const filteredOptions = medicineOptions.filter((option) =>
          option.name
            .toLowerCase()
            .includes((searchTerms[index] || "").toLowerCase())
        );

        return (
          <div key={index} className="tablet-row">
            <div className="form-group">
              <label style={{fontSize:'24px'}}> {index + 1}. Medicine Name</label>
              <div className="autocomplete">
                <input
                  type="text"
                  value={tablet.name}
                  onChange={(e) => handleSearchChange(index, e.target.value)}
                  onFocus={() => setActiveIndex(index)}
                  placeholder="Search medicine..."
                />
                {activeIndex === index && searchTerms[index] && (
                  <>
                    <div className="autocomplete-dropdown">
                      {filteredOptions.length > 0 ? (
                        filteredOptions.map((option) => (
                          <div
                            key={option.id}
                            className="dropdown-item"
                            onClick={() => {
                              handleTabletChange(index, "name", option.name);
                              handleTabletChange(
                                index,
                                "dosage",
                                option.dosage
                              );
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
                        ))
                      ) : (
                        <div className="dropdown-item no-results">
                          No matching medicines found
                        </div>
                      )}
                    </div>
                    <br />
                    <hr />
                  </>
                )}
              </div>
            </div>

            <div className="form-group">
              <label>Count</label>
              <input
                type="number"
                min="1"
                max="100"
                value={tablet.count}
                onChange={(e) =>
                  handleTabletChange(index, "count", e.target.value)
                }
              />
            </div>

            <div className="form-group">
              <label>Dosage</label>
              <input
                type="text"
                value={tablet.dosage.replace("mg", "")}
                onChange={(e) => handleDosageChange(index, e.target.value)}
                placeholder="Enter dosage (e.g. 500)"
              />
            </div>

            <div className="form-group">
              <label>Frequency</label>
              <select
                value={tablet.frequency}
                onChange={(e) =>
                  handleTabletChange(index, "frequency", e.target.value)
                }
              >
                <option value="OD - Once Daily (Morning)">OD - Once Daily (Morning)</option>
                <option value="BD - Twice Daily (Morning & Evening)">BD - Twice Daily (Morning & Evening)</option>
                <option value="TDS - Thrice Daily (Morning, Afternoon & Evening)">
                  TDS - Thrice Daily (Morning, Afternoon & Evening)
                </option>
                <option value="QID - Four Times Daily (Morning, Afternoon, Evening & Night)">
                  QID - Four Times Daily (Morning, Afternoon, Evening & Night)
                </option>
                <option value="ME - Morning & Evening">ME - Morning & Evening</option>
                <option value="MAE - Morning, Afternoon & Evening">MAE - Morning, Afternoon & Evening</option>
                <option value="MN - Morning & Night">MN - Morning & Night</option>
                <option value="HS - At Bedtime Only">HS - At Bedtime Only</option>
                <option value="SOS - As Needed">SOS - As Needed</option>
                <option value="STAT - Immediately (One Time)">STAT - Immediately (One Time)</option>
                <option value="EOD - Every Other Day">EOD - Every Other Day</option>
                <option value="Weekly - Once a Week">Weekly - Once a Week</option>
              </select>
            </div>

            <div className="form-group">
              <label>Duration (Days)</label>
              <input
                type="number"
                min="1"
                max="7"
                value={tablet.duration}
                onChange={(e) =>
                  handleTabletChange(index, "duration", e.target.value)
                }
              />
            </div>
          </div>
        );
      })}
    </div>
  );
});

export default TabletInput;
