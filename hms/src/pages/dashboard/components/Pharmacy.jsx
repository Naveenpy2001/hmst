import React, { useState, useEffect } from "react";
import "./Pharmacy.css";
import { FiSearch, FiDownload, FiFilter, FiPlus } from "react-icons/fi";
import api from "../../../services/api";

// Sub-components
const PatientSearch = ({ searchId, setSearchId, handleSearch }) => {
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
        />
        <button className="ph-search-button" onClick={handleSearch}>
          Search
        </button>
      </div>
    </div>
  );
};

const PatientDetails = ({ patient }) => {
  if (!patient) return null;
  
  return (
    <div className="ph-patient-details">
      <h3 className="ph-details-title">Patient Information</h3>
      <div className="ph-details-grid">
        <div>
          <p className="ph-detail-label">Name</p>
          <p className="ph-detail-value">{patient.name}</p>
        </div>
        <div>
          <p className="ph-detail-label">Phone</p>
          <p className="ph-detail-value">{patient.phone}</p>
        </div>
        <div>
          <p className="ph-detail-label">Diseases</p>
          <p className="ph-detail-value">{patient.diseases || "Not specified"}</p>
        </div>
      </div>
    </div>
  );
};

const MedicinesTable = ({ medicines, showPrices = false, onDownload }) => {
  const totalAmount = medicines?.reduce(
    (sum, med) => sum + (med.price || 0) * (med.count || 0),
    0
  );

  return (
    <div className="ph-medicines-container">
      <div className="ph-table-container">
        <table className="ph-medicines-table">
          <thead>
            <tr>
              <th>Medicine Name</th>
              <th>Quantity</th>
              {showPrices && <th>Price (₹)</th>}
              {showPrices && <th>Total (₹)</th>}
            </tr>
          </thead>
          <tbody>
            {medicines?.map((medicine, index) => (
              <tr key={index}>
                <td>{medicine.name}</td>
                <td>{medicine.count || 0}</td>
                {showPrices && <td>{medicine.price?.toFixed(2) || "0.00"}</td>}
                {showPrices && (
                  <td>{((medicine.price || 0) * (medicine.count || 0)).toFixed(2)}</td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showPrices && (
        <div className="ph-total-amount">
          <span>Total Amount:</span>
          <span>₹{totalAmount.toFixed(2)}</span>
        </div>
      )}

      {onDownload && (
        <div className="ph-actions">
          <button className="ph-download-button" onClick={onDownload}>
            <FiDownload /> Download Bill
          </button>
        </div>
      )}
    </div>
  );
};

const GivenMedicinesList = ({ medicines, onDownload }) => {
  return (
    <div className="ph-given-medicines">
      {medicines.length === 0 ? (
        <div className="ph-empty-state">No medicines given yet</div>
      ) : (
        <div className="ph-table-container">
          <table className="ph-given-table">
            <thead>
              <tr>
                <th>Patient ID</th>
                <th>Medicines</th>
                <th>Total Qty</th>
                <th>Total (₹)</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {medicines.map((given, index) => {
                const totalQty = given.tablets?.reduce((sum, m) => sum + (m.count || 0), 0) || 0;
                const totalPrice = given.tablets?.reduce(
                  (sum, m) => sum + (m.price || 0) * (m.count || 0),
                  0
                ) || 0;

                return (
                  <tr key={index}>
                    <td>{given.patientId}</td>
                    <td>
                      {given.tablets?.map((m) => m.name).join(", ") || "None"}
                    </td>
                    <td>{totalQty}</td>
                    <td>₹{totalPrice.toFixed(2)}</td>
                    <td>
                      <button
                        className="ph-download-button"
                        onClick={() => onDownload(given.patientId)}
                      >
                        <FiDownload />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

const FilterControls = ({ filterId, setFilterId, filterDate, setFilterDate, handleFilter }) => {
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
        />
      </div>
      <div className="ph-filter-group">
        <input
          type="date"
          className="ph-filter-input"
          value={filterDate}
          onChange={(e) => setFilterDate(e.target.value)}
        />
      </div>
      <button className="ph-filter-button" onClick={handleFilter}>
        Apply Filters
      </button>
    </div>
  );
};

// Main Component
const Pharmacy = () => {
  const [searchId, setSearchId] = useState("");
  const [patientDetails, setPatientDetails] = useState(null);
  const [prescribedMedicines, setPrescribedMedicines] = useState([]);
  const [givenMedicines, setGivenMedicines] = useState([]);
  const [activeTab, setActiveTab] = useState(1);
  const [filterId, setFilterId] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [filteredGivenMedicines, setFilteredGivenMedicines] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSearch = async () => {
    if (!searchId.trim()) {
      setError("Please enter a Patient ID or Phone number");
      return;
    }

    try {
      setIsLoading(true);
      setError("");
      const response = await api.get(`/api/patients/${searchId}/`);
      const data = response.data;

      if (data) {
        setPatientDetails({
          id: data.id,
          name: `${data.first_name} ${data.last_name}`,
          phone: data.phone,
          diseases: data.disease,
        });
        setPrescribedMedicines(Array.isArray(data.tablets) ? data.tablets : []);
      } else {
        setError("No patient found with this ID or phone number");
        setPatientDetails(null);
        setPrescribedMedicines([]);
      }
    } catch (error) {
      console.error("Error fetching patient data:", error);
      setError("Failed to fetch patient data. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGiveMedicine = () => {
    if (!patientDetails) {
      setError("No patient selected");
      return;
    }

    if (!prescribedMedicines || prescribedMedicines.length === 0) {
      setError("No medicines prescribed for this patient");
      return;
    }

    const givenData = {
      patientId: patientDetails.id,
      patientName: patientDetails.name,
      date: new Date().toISOString(),
      tablets: prescribedMedicines.map(med => ({
        name: med.name,
        count: med.count || 0,
        price: med.price || 0
      }))
    };

    setGivenMedicines(prev => [...prev, givenData]);
    setError("");
    alert("Medicines dispensed successfully!");
  };

  const fetchPDF = async (patientId) => {
    try {
      setIsLoading(true);
      const response = await axios.get(`${API_URL}/api/doctorview/${patientId}/`, {
        responseType: "blob"
      });
      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `pharmacy_bill_${patientId}_${new Date().toISOString().split('T')[0]}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Error fetching PDF:", error);
      setError("Failed to download bill. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilter = () => {
    const filtered = givenMedicines.filter(given => {
      const matchesId = given.patientId?.toString().includes(filterId) || 
                       given.patientName?.toLowerCase().includes(filterId.toLowerCase());
      const matchesDate = filterDate 
        ? new Date(given.date).toISOString().split('T')[0] === filterDate
        : true;
      return matchesId && matchesDate;
    });
    setFilteredGivenMedicines(filtered);
  };

  const handleTabChange = (tabIndex) => {
    setActiveTab(tabIndex);
    setError("");
    if (tabIndex === 2) {
      handleFilter();
    }
  };

  return (
    <div className="ph-container">
      {/* Tab Navigation */}
      <div className="ph-tab-navigation">
        <button
          className={`ph-tab-button ${activeTab === 1 ? "active" : ""}`}
          onClick={() => handleTabChange(1)}
          disabled={isLoading}
        >
          <FiPlus /> Dispense Medicines
        </button>
        <button
          className={`ph-tab-button ${activeTab === 2 ? "active" : ""}`}
          onClick={() => handleTabChange(2)}
          disabled={isLoading}
        >
          <FiFilter /> Dispensed Records
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="ph-error-message">
          {error}
          <button onClick={() => setError("")} className="ph-error-close">
            ×
          </button>
        </div>
      )}

      {/* Tab Content */}
      <div className="ph-tab-content">
        {activeTab === 1 ? (
          <div className="ph-dispense-tab">
            <h2 className="ph-tab-title">Dispense Medicines</h2>
            
            <PatientSearch 
              searchId={searchId}
              setSearchId={setSearchId}
              handleSearch={handleSearch}
            />

            {isLoading && <div className="ph-loading">Loading patient data...</div>}

            <PatientDetails patient={patientDetails} />

            {prescribedMedicines.length > 0 && (
              <>
                <h3 className="ph-section-title">Prescribed Medicines</h3>
                <MedicinesTable 
                  medicines={prescribedMedicines} 
                  onDownload={() => patientDetails && fetchPDF(patientDetails.id)}
                />

                <div className="ph-action-buttons">
                  <button
                    className="ph-primary-button"
                    onClick={handleGiveMedicine}
                    disabled={isLoading}
                  >
                    Confirm Dispensing
                  </button>
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="ph-records-tab">
            <h2 className="ph-tab-title">Dispensed Medicines</h2>
            
            <FilterControls
              filterId={filterId}
              setFilterId={setFilterId}
              filterDate={filterDate}
              setFilterDate={setFilterDate}
              handleFilter={handleFilter}
            />

            <GivenMedicinesList
              medicines={filterId || filterDate ? filteredGivenMedicines : givenMedicines}
              onDownload={fetchPDF}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default Pharmacy;