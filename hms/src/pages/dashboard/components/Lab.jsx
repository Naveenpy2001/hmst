import React, { useState, useEffect } from "react";
import axios from "axios";
import { IoMdDownload, IoMdSearch, IoMdClose } from "react-icons/io";
import { FiUpload, FiPlus } from "react-icons/fi";
// import FileUpload from "./fileUpload";
import "./Lab.css";
import api from "../../../services/api";

const Lab = () => {
  // State management
  const [patientId, setPatientId] = useState("");
  const [patientDetails, setPatientDetails] = useState(null);
  const [labTests, setLabTests] = useState([
    
  ]);
  const [activeTab, setActiveTab] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [availableTests, setAvailableTests] = useState([
    { name: "Complete Blood Count (CBC)" },
  { name: "Liver Function Test (LFT)" },
  { name: "Kidney Function Test (KFT)" },
  { name: "Thyroid Function Test (T3, T4, TSH)" },
  { name: "Blood Sugar - Fasting & PP" },
  { name: "HbA1c - Diabetes Test" },
  { name: "Urine Routine Examination" },
  { name: "Vitamin D3 Level" },
  { name: "Vitamin B12 Level" },
  { name: "Lipid Profile" },
  { name: "Dengue NS1 Antigen" },
  { name: "Malaria Parasite Test" },
  { name: "Widal Test (Typhoid)" },
  { name: "COVID-19 RT-PCR" },
  { name: "X-Ray Chest PA View" },
  { name: "Ultrasound Abdomen" },
  { name: "ECG (Electrocardiogram)" },
  { name: "Blood Urea" },
  { name: "Serum Creatinine" },
  { name: "Stool Routine & Occult Blood" }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);

  const [newTest, setNewTest] = useState({
    testName: "",
    testDate: new Date().toISOString().split('T')[0],
    status: "pending",
    price: "",
    notes: "",
    testType: ""
  });

  // Derived state
  const filteredLabTests = labTests.filter(test => 
    test.patientId?.toString().includes(searchTerm) || 
    test.phone?.toString().includes(searchTerm) ||
    test.testName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Data fetching
  useEffect(() => {
    fetchAvailableTests();
  }, []);

  useEffect(() => {
    if (patientDetails?.id) {
      fetchLabTests(patientDetails.id);
    }
  }, [patientDetails]);

  const fetchAvailableTests = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`${API_URL}/getAvailableTests`);
      setAvailableTests(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Error fetching available tests:", error);
      setError("Failed to fetch available tests");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPatientData = async (id) => {
    try {
      setIsLoading(true);
      setError("");
      const response = await api.get(`/api/patients/${id}/`);
      if (response.data) {
        setPatientDetails(response.data);
        setSuccess("Patient data fetched successfully");
        setTimeout(() => setSuccess(""), 3000);
      } else {
        setError("No patient found with this ID");
      }
    } catch (error) {
      console.error("Error fetching patient data:", error);
      setError("Failed to fetch patient data");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchLabTests = async (patientId) => {
    try {
      setIsLoading(true);
      const response = await axios.get(`/api/lab-tests/${patientId}/`);
      setLabTests(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Error fetching lab tests:", error);
      setError("Failed to fetch lab tests");
    } finally {
      setIsLoading(false);
    }
  };

  // Event handlers
  const handleTabChange = (tabIndex) => {
    setActiveTab(tabIndex);
    setError("");
    setSuccess("");
  };

  const handleSearchChange = (e) => setSearchTerm(e.target.value);

  const handleNewTestChange = (e) => {
    const { name, value } = e.target;
    setNewTest(prev => ({ ...prev, [name]: value }));
  };

  const handleStatusChange = (status) => {
    setNewTest(prev => ({ ...prev, status }));
  };

  const handleSubmitNewTest = async (e) => {
    e.preventDefault();

    if (!patientDetails) {
      setError("Please fetch patient details first");
      return;
    }

    if (!newTest.testName || !newTest.testDate || !newTest.price) {
      setError("Please fill all required fields");
      return;
    }
    const payload = {
      ...newTest,
      patientId: patientDetails.id,
      patientName: `${patientDetails.first_name} ${patientDetails.last_name}`,
      phone: patientDetails.phone
    };
  
    console.log("Submitting new test:", payload);  

    try {
      setIsLoading(true);
      await api.post(`/api/lab-tests/`, { payload }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      setSuccess("Lab test added successfully!");
      setNewTest({
        testName: "",
        testDate: new Date().toISOString().split('T')[0],
        status: "pending",
        price: "",
        notes: "",
        testType: ""
      });
      fetchLabTests(patientDetails.id);
    } catch (error) {
      console.error("Error adding lab test:", error);
      setError("Failed to add lab test");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!patientId) {
      setError("Please enter a Patient ID");
      return;
    }
    await fetchPatientData(patientId);
  };

  const handleDownloadPDF = async (patientId = patientDetails?.id) => {
    if (!patientId) {
      setError("No patient selected");
      return;
    }
    
    try {
      setIsLoading(true);
      const response = await api.get(`/api/lab-tests/${patientId}/`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `lab_report_${patientId}_${new Date().toISOString().split('T')[0]}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      setSuccess("Report downloaded successfully");
      setTimeout(() => setSuccess(""), 3000);
    } catch (error) {
      console.error("Error downloading PDF:", error);
      setError("Failed to download report");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile || !patientDetails?.id) {
      setError("Please select a file and patient");
      return;
    }

    try {
      setIsLoading(true);
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('patientId', patientDetails.id);
      formData.append('patientName', `${patientDetails.first_name} ${patientDetails.last_name}`);

      await api.post(`/api/lab-tests/`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      setSuccess("Report uploaded successfully!");
      setSelectedFile(null);
    } catch (error) {
      console.error("Error uploading file:", error);
      setError("Failed to upload report");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  return (
    <div className="lb-container">
      {/* Notification messages */}
      {/* {(error || success) && (
        <div className={`lb-notification ${error ? 'error' : 'success'}`}>
          {error || success}
          <button onClick={() => { setError(""); setSuccess(""); }} className="lb-notification-close">
            <IoMdClose />
          </button>
        </div>
      )} */}

      {/* Navigation Tabs */}
      <div className="lb-navigation">
        <button
          className={`lb-tab-button ${activeTab === 1 ? "active" : ""}`}
          onClick={() => handleTabChange(1)}
        >
          <FiPlus /> New Test
        </button>
        <button
          className={`lb-tab-button ${activeTab === 2 ? "active" : ""}`}
          onClick={() => handleTabChange(2)}
        >
          <IoMdSearch /> View Tests
        </button>
        <button
          className={`lb-tab-button ${activeTab === 3 ? "active" : ""}`}
          onClick={() => handleTabChange(3)}
        >
          <FiUpload /> Upload Reports
        </button>
      </div>

      {/* Tab 1: New Test Form */}
      {activeTab === 1 && (
        <form className="lb-form" onSubmit={handleSubmit}>
          <h1 className="lb-title">New Lab Test</h1>
          
          <div className="lb-form-group">
            <label className="lb-label">Patient ID <span className="lb-required">*</span></label>
            <div className="lb-input-group">
              <input
                type="text"
                className="lb-input"
                value={patientId}
                onChange={(e) => setPatientId(e.target.value)}
                placeholder="Enter patient ID"
                required
              />
              <button type="submit" className="lb-fetch-button" disabled={isLoading}>
                {isLoading ? "Fetching..." : "Fetch Patient"}
              </button>
            </div>
          </div>

          {patientDetails && (
            <div className="lb-patient-details">
              <h2 className="lb-details-title">Patient Information</h2>
              <div className="lb-details-grid">
                <div>
                  <p className="lb-detail-label">Name</p>
                  <p className="lb-detail-value">{patientDetails.first_name} {patientDetails.last_name}</p>
                </div>
                <div>
                  <p className="lb-detail-label">Phone</p>
                  <p className="lb-detail-value">{patientDetails.phone}</p>
                </div>
                <div>
                  <p className="lb-detail-label">Disease</p>
                  <p className="lb-detail-value">{patientDetails.disease || "Not specified"}</p>
                </div>
                <div>
                  <p className="lb-detail-label">Test Required</p>
                  <p className="lb-detail-value">{patientDetails.selectedTest || "Not specified"}</p>
                </div>
              </div>
            </div>
          )}

          <h2 className="lb-section-title">Test Information</h2>

          <div className="lb-form-row">
            <div className="lb-form-group">
              <label className="lb-label">Test Name <span className="lb-required">*</span></label>
              <select
                className="lb-input"
                name="testName"
                value={newTest.testName}
                onChange={handleNewTestChange}
              >
                <option value="">Select a test</option>
                {availableTests.map(test => (
                  <option key={test.id} value={test.name}>{test.name}</option>
                ))}
              </select>
            </div>

            <div className="lb-form-group">
              <label className="lb-label">Test Date <span className="lb-required">*</span></label>
              <input
                type="date"
                className="lb-input"
                name="testDate"
                value={newTest.testDate}
                onChange={handleNewTestChange}
              />
            </div>
          </div>

          <div className="lb-form-row">
            <div className="lb-form-group">
              <label className="lb-label">Test Type</label>
              <input
                type="text"
                className="lb-input"
                name="testType"
                value={newTest.testType}
                onChange={handleNewTestChange}
                placeholder="e.g., Blood, Urine, etc."
              />
            </div>

            <div className="lb-form-group">
              <label className="lb-label">Price (₹) <span className="lb-required">*</span></label>
              <input
                type="number"
                className="lb-input"
                name="price"
                value={newTest.price}
                onChange={handleNewTestChange}
                min="0"
                step="0.01"
                placeholder="0.00"
                
              />
            </div>
          </div>

          <div className="lb-form-group">
            <label className="lb-label">Status</label>
            <div className="lb-status-options">
              {["pending", "in-progress", "completed"].map(status => (
                <label key={status} className="lb-status-label">
                  <input
                    type="radio"
                    name="status"
                    checked={newTest.status === status}
                    onChange={() => handleStatusChange(status)}
                    className="lb-status-radio"
                  />
                  <span className={`lb-status-badge ${status}`}>
                    {status.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div className="lb-form-group">
            <label className="lb-label">Notes</label>
            <textarea
              className="lb-textarea"
              name="notes"
              value={newTest.notes}
              onChange={handleNewTestChange}
              placeholder="Additional notes about the test..."
              rows="3"
            />
          </div>

          <div className="lb-form-actions">
            <button type="button" className="lb-secondary-button" onClick={() => setNewTest({
              testName: "",
              testDate: new Date().toISOString().split('T')[0],
              status: "pending",
              price: "",
              notes: "",
              testType: ""
            })}>
              Clear Form
            </button>
            <button type="submit" className="lb-primary-button" onClick={handleSubmitNewTest} disabled={isLoading}>
              {isLoading ? "Submitting..." : "Submit Test"}
            </button>
            {patientDetails && (
              <button type="button" className="lb-download-button" onClick={handleDownloadPDF} disabled={isLoading}>
                <IoMdDownload /> {isLoading ? "Preparing..." : "Download Report"}
              </button>
            )}
          </div>
        </form>
      )}

      {/* Tab 2: View Tests */}
      {activeTab === 2 && (
        <div className="lb-results-container">
          <h1 className="lb-results-title">Lab Test Results</h1>
          
          <div className="lb-search-container">
            <div className="lb-search-group">
              <IoMdSearch className="lb-search-icon" />
              <input
                type="search"
                value={searchTerm}
                onChange={handleSearchChange}
                placeholder="Search by Patient ID, Phone or Test Name"
                className="lb-search-input"
              />
              {searchTerm && (
                <button onClick={() => setSearchTerm("")} className="lb-clear-search">
                  <IoMdClose />
                </button>
              )}
            </div>
          </div>

          {filteredLabTests.length > 0 ? (
            <div className="lb-table-container">
              <table className="lb-table">
                <thead>
                  <tr>
                    {["Test Name", "Patient", "Date", "Status", "Price", "Actions"].map(header => (
                      <th key={header} className="lb-th">{header}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredLabTests.map(test => (
                    <tr key={test.id} className="lb-tr">
                      <td className="lb-td" data-label="Test Name">{test.testName}</td>
                      <td className="lb-td" data-label="Patient">
                        <div className="lb-patient-cell">
                          <span className="lb-patient-id">#{test.patientId}</span>
                          <span className="lb-patient-name">{test.patientName}</span>
                        </div>
                      </td>
                      <td className="lb-td" data-label="Date">{new Date(test.testDate).toLocaleDateString()}</td>
                      <td className="lb-td" data-label="Status">
                        <span className={`lb-status-badge ${test.status}`}>
                          {test.status.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                        </span>
                      </td>
                      <td className="lb-td" data-label="Price">₹{parseFloat(test.price).toFixed(2)}</td>
                      <td className="lb-td" data-label="Actions">
                        <button 
                          className="lb-download-button"
                          onClick={() => handleDownloadPDF(test.patientId)}
                          disabled={isLoading}
                        >
                          <IoMdDownload size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="lb-empty-state">
              {searchTerm ? "No matching tests found" : "No lab tests available"}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Upload Reports */}
      {activeTab === 3 && (
        <div className="lb-upload-container">
          <h1 className="lb-upload-title">Upload Lab Reports</h1>
          
          <form className="lb-upload-form" onSubmit={handleFileUpload}>
            <div className="lb-form-group">
              <label className="lb-label">Patient ID <span className="lb-required">*</span></label>
              <div className="lb-input-group">
                <input
                  type="text"
                  className="lb-input"
                  value={patientId}
                  onChange={(e) => setPatientId(e.target.value)}
                  placeholder="Enter patient ID"
                  required
                />
                <button 
                  type="button" 
                  className="lb-fetch-button" 
                  onClick={handleSubmit}
                  disabled={isLoading}
                >
                  {isLoading ? "Fetching..." : "Fetch"}
                </button>
              </div>
            </div>

            {patientDetails && (
              <div className="lb-patient-details">
                <h2 className="lb-details-title">Patient Information</h2>
                <div className="lb-details-grid">
                  <div>
                    <p className="lb-detail-label">Name</p>
                    <p className="lb-detail-value">{patientDetails.first_name} {patientDetails.last_name}</p>
                  </div>
                  <div>
                    <p className="lb-detail-label">Phone</p>
                    <p className="lb-detail-value">{patientDetails.phone}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="lb-form-group">
              <label className="lb-label">Report File <span className="lb-required">*</span></label>
              <div className="lb-file-upload">
                <label className="lb-file-label">
                  <input 
                    type="file" 
                    onChange={handleFileChange} 
                    className="lb-file-input"
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    required
                  />
                  <span className="lb-file-button">Choose File</span>
                  <span className="lb-file-name">
                    {selectedFile ? selectedFile.name : "No file selected"}
                  </span>
                </label>
              </div>
              <p className="lb-file-hint">Supported formats: PDF, DOC, JPG, PNG (Max 5MB)</p>
            </div>

            <div className="lb-form-actions">
              <button 
                type="submit" 
                className="lb-primary-button" 
                disabled={!selectedFile || !patientDetails || isLoading}
              >
                {isLoading ? "Uploading..." : "Upload Report"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default Lab;