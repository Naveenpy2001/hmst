import React, { useState, useEffect } from "react";
import axios from "axios";
import { FiSearch, FiCalendar, FiX, FiArrowLeft } from "react-icons/fi";
import "./PatientTracking.css";
import api from "../../../services/api";

const PatientTracking = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDate, setFilterDate] = useState("");


  useEffect(() => {
    const fetchPatients = async () => {
      try {
        setLoading(true);
        const response = await api.get(
          `api/patients/?search=${searchTerm}&date=${filterDate}`
        );
        console.log(response.data);
        
        setPatients(response.data);
        setError("");
      } catch (err) {
        setError("Failed to fetch patient data");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    const debounceTimer = setTimeout(() => {
      fetchPatients();
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchTerm, filterDate]);

  const handleClearFilters = () => {
    setSearchTerm("");
    setFilterDate("");
  };

  return (
    <div className="pt-container">
      <h1 className="pt-title">Patient Tracking</h1>

      {loading && <div className="pt-loading">Loading patient data...</div>}
      {error && (
        <div className="pt-error">
          {error}
          <button onClick={() => setError("")} className="pt-error-close">
            <FiX />
          </button>
        </div>
      )}

      {selectedPatient ? (
        <div className="pt-patient-details">
          <button 
            onClick={() => setSelectedPatient(null)} 
            className="pt-back-button"
          >
            <FiArrowLeft /> Back to List
          </button>
          
          <div className="pt-detail-card">
            <h2 className="pt-detail-name">
              {selectedPatient.first_name} {selectedPatient.last_name}
            </h2>
            
            <div className="pt-detail-grid">
              <div className="pt-detail-item">
                <span className="pt-detail-label">Patient ID:</span>
                <span className="pt-detail-value">{selectedPatient.id}</span>
              </div>
              <div className="pt-detail-item">
                <span className="pt-detail-label">Email:</span>
                <span className="pt-detail-value">{selectedPatient.email}</span>
              </div>
              <div className="pt-detail-item">
                <span className="pt-detail-label">Phone:</span>
                <span className="pt-detail-value">{selectedPatient.phone}</span>
              </div>
              <div className="pt-detail-item">
                <span className="pt-detail-label">Aadhar:</span>
                <span className="pt-detail-value">{selectedPatient.aadhar}</span>
              </div>
              <div className="pt-detail-item">
                <span className="pt-detail-label">Gender:</span>
                <span className="pt-detail-value">{selectedPatient.gender}</span>
              </div>
              <div className="pt-detail-item">
                <span className="pt-detail-label">Date of Birth:</span>
                <span className="pt-detail-value">
                  {selectedPatient.day}-{selectedPatient.month}-{selectedPatient.year}
                </span>
              </div>
              <div className="pt-detail-item full-width">
                <span className="pt-detail-label">Address:</span>
                <span className="pt-detail-value">{selectedPatient.address}</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="pt-filters">
            <div className="pt-search-group">
              <FiSearch className="pt-search-icon" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search patients..."
                className="pt-search-input"
              />
              {searchTerm && (
                <button 
                  onClick={() => setSearchTerm("")} 
                  className="pt-clear-search"
                >
                  <FiX />
                </button>
              )}
            </div>

            <div className="pt-date-filter">
              <FiCalendar className="pt-date-icon" />
              <input
                type="date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="pt-date-input"
              />
              {filterDate && (
                <button 
                  onClick={() => setFilterDate("")} 
                  className="pt-clear-date"
                >
                  <FiX />
                </button>
              )}
            </div>

            {(searchTerm || filterDate) && (
              <button 
                onClick={handleClearFilters} 
                className="pt-clear-all"
              >
                Clear All Filters
              </button>
            )}
          </div>

          <div className="pt-table-container">
            <table className="pt-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Patient Name</th>
                  <th>Age</th>
                  <th>Phone</th>
                  <th>Disease</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {patients.length > 0 ? (
                  patients.map((patient) => (
                    <tr 
                      key={patient.id} 
                      onClick={() => setSelectedPatient(patient)}
                      className="pt-table-row"
                    >
                      <td data-label="ID">{patient.id}</td>
                      <td data-label="Name">
                        {patient.first_name} {patient.last_name}
                      </td>
                      <td data-label="Phone">{patient.age}</td>
                      <td data-label="Phone">{patient.phone}</td>
                      <td data-label="Phone">{patient.disease}</td>
                      <td data-label="Actions">
                        <button 
                          className="pt-view-button"
                          onClick={() => setSelectedPatient(patient)}
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="pt-empty">
                      {loading ? 'Loading...' : 'No patients found'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};

export default PatientTracking;