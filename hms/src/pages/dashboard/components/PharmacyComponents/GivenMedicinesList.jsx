import React, { useState } from "react";
import { FiDownload, FiChevronDown, FiChevronUp, FiArrowLeft } from "react-icons/fi";

const GivenMedicinesList = ({ medicines, onDownload }) => {
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [expandedRow, setExpandedRow] = useState(null);

  const handleRowClick = (record) => {
    setSelectedRecord(record);
  };

  const handleBackClick = () => {
    setSelectedRecord(null);
  };

  const toggleRow = (index) => {
    setExpandedRow(expandedRow === index ? null : index);
  };

  const renderTable = () => (
    <div className="ph-table-container">
      <table className="ph-given-table">
        <thead>
          <tr>
            <th>S. No.</th>
            <th>Record ID</th>
            <th>Patient Name</th>
            <th>Patient Disease</th>
            <th>Date</th>
            <th>Total (₹)</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {medicines.map((given, index) => {
            const mainRecord = given.medicalRecords[0];
            return (
              <React.Fragment key={index}>
                <tr 
                  className="ph-main-row"
                  onClick={() => handleRowClick(given)}
                >
                  <td>
                    {index + 1}
                  </td>
                  <td>{given.patientId}</td>
                  <td>{given.patient_name}</td>
                  <td>{given.patient_disease}</td>
                  <td>{new Date(given.date).toLocaleDateString()}</td>
                  <td>₹{mainRecord.total_amount != null ? Number(mainRecord.total_amount).toFixed(2) : 'N/A'}</td>
                  <td>
                    <button
                      className="ph-download-button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDownload(mainRecord.id);
                      }}
                    >
                      <FiDownload />
                    </button>
                  </td>
                </tr>
                
                {expandedRow === index && (
                  <tr className="ph-details-row">
                    <td colSpan="6">
                      <div className="ph-record-preview">
                        <h4>Quick Preview - Record #{mainRecord.id}</h4>
                        <p><strong>Tablets:</strong> {mainRecord.tablets?.length || 0}</p>
                        {mainRecord.injections && Object.keys(mainRecord.injections).length > 0 && (
                          <p><strong>Injection:</strong> {mainRecord.injections.name}</p>
                        )}
                        <p><strong>Total:</strong> ₹{mainRecord.total_amount.toFixed(2)}</p>
                        <button 
                          className="ph-view-details-button"
                          onClick={() => handleRowClick(given)}
                        >
                          View Full Details
                        </button>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );

  const renderDetails = () => {
    if (!selectedRecord) return null;
    
    const mainRecord = selectedRecord.medicalRecords[0];
    
    
    return (
      <div className="ph-details-view">
        <button 
          className="ph-back-button"
          onClick={handleBackClick}
        >
          <FiArrowLeft /> Back to List
        </button>
        
        <div className="ph-record-header">
          <h2>Record Details</h2>
          <div className="ph-record-meta">
            <span><strong>Record ID:</strong> #{mainRecord.id}</span> |
            <span><strong>Patient ID:</strong> {selectedRecord.patientId}</span> |
            <span><strong>Date:</strong> {new Date(selectedRecord.date).toLocaleString()}</span>
          </div>
        </div>
        
        <div className="ph-record-body">
          <div className="ph-doctor-advice-section">
            <h3>Doctor's Advice</h3>
            <p>{mainRecord.doctorAdvice || "No advice recorded"}</p>
          </div>
          
          {mainRecord.tablets?.length > 0 && (
            <div className="ph-medicine-section">
              <h3>Tablets (Total: ₹{mainRecord.tabletsAmount.toFixed(2)})</h3>
              <table className="ph-medicine-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Dosage</th>
                    <th>Count</th>
                    {/* <th>Price (₹)</th>
                    <th>Total (₹)</th> */}
                  </tr>
                </thead>
                <tbody>
                  {mainRecord.tablets.map((tablet, index) => (
                    <tr key={`tablet-${index}`}>
                      <td>{tablet.name}</td>
                      <td>{tablet.dosage}</td>
                      <td>{tablet.count}</td>
                      {/* <td>{tablet.price?.toFixed(2)}</td>
                      <td>{(tablet.price * tablet.count).toFixed(2)}</td> */}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          
          {mainRecord.injections && Object.keys(mainRecord.injections).length > 0 && (
            <div className="ph-medicine-section">
              <h3>Injections (Total: ₹{mainRecord.injectionsAmount.toFixed(2)})</h3>
              <div className="ph-medicine-details">
                <p><strong>Name:</strong> {mainRecord.injections.name}</p>
                {mainRecord.injections.size && <p><strong>Size:</strong> {mainRecord.injections.size}</p>}
                <p><strong>Dosage:</strong> {mainRecord.injections.dosage}</p>
                {/* <p><strong>Price:</strong> ₹{mainRecord.injections.price?.toFixed(2)}</p> */}
              </div>
            </div>
          )}
          
          <div className="ph-total-section">
            <h3>Payment Summary</h3>
            <table className="ph-summary-table">
              <tbody>
                <tr>
                  <td>Tablets Total:</td>
                  <td>₹{mainRecord.tabletsAmount.toFixed(2)}</td>
                </tr>
                <tr>
                  <td>Injections Total:</td>
                  <td>₹{mainRecord.injectionsAmount.toFixed(2)}</td>
                </tr>
                <tr className="ph-grand-total">
                  <td><strong>Grand Total:</strong></td>
                  <td><strong>₹{mainRecord.total_amount.toFixed(2)}</strong></td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <div className="ph-actions">
            <button
              className="ph-download-button"
              onClick={() => onDownload(mainRecord.id)}
            >
              <FiDownload /> Download Bill
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="ph-given-medicines">
      {medicines.length === 0 ? (
        <div className="ph-empty-state">No medicines given yet</div>
      ) : (
        <>
          {selectedRecord ? renderDetails() : renderTable()}
        </>
      )}
    </div>
  );
};

export default GivenMedicinesList;