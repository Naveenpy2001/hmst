import React, { useState } from "react";
import { FiDownload } from "react-icons/fi";

const MedicinesTable = ({ 
  medicalRecords = [],
  showPrices = false, 
  onDownload,
  editable = false,
  onMedicalRecordsChange
}) => {
  
  const [localRecords, setLocalRecords] = useState(medicalRecords);

  const handleTabletsAmountChange = (recordIndex, value) => {
    const updatedRecords = [...localRecords];
    updatedRecords[recordIndex].tabletsAmount = parseFloat(value) || 0;
    setLocalRecords(updatedRecords);
    if (onMedicalRecordsChange) onMedicalRecordsChange(updatedRecords);
  };

  const handleInjectionsAmountChange = (recordIndex, value) => {
    const updatedRecords = [...localRecords];
    updatedRecords[recordIndex].injectionsAmount = parseFloat(value) || 0;
    setLocalRecords(updatedRecords);
    if (onMedicalRecordsChange) onMedicalRecordsChange(updatedRecords);
  };

  const handleOintmentsAmountChange = (recordIndex, value) => {
    const updatedRecords = [...localRecords];
    updatedRecords[recordIndex].ointmentsAmount = parseFloat(value) || 0;
    setLocalRecords(updatedRecords);
    if (onMedicalRecordsChange) onMedicalRecordsChange(updatedRecords);
  };

  const handleSyrupsAmountChange = (recordIndex, value) => {
    const updatedRecords = [...localRecords];
    updatedRecords[recordIndex].syrupsAmount = parseFloat(value) || 0;
    setLocalRecords(updatedRecords);
    if (onMedicalRecordsChange) onMedicalRecordsChange(updatedRecords);
  };

  const calculateTotalAmount = (record) => {
    return (record.tabletsAmount || 0) + 
           (record.injectionsAmount || 0) + 
           (record.ointmentsAmount || 0) + 
           (record.syrupsAmount || 0);
  };

  const grandTotal = localRecords?.reduce(
    (sum, record) => sum + calculateTotalAmount(record),
    0
  );

  return (
    <div className="ph-medicines-container">
      {localRecords?.map((record, recordIndex) => (
        <div key={recordIndex} className="ph-record-container">
          <div className="ph-record-header">
            <h3>Medical Record - {new Date(record.date).toLocaleDateString()}</h3>
            <p className="ph-doctor-advice">{record.doctorAdvice}</p>
          </div>

          {record.tablets?.length > 0 && (
            <div className="ph-medicine-section">
              <h4>Tablets</h4>
              <div className="ph-table-container">
                <table className="ph-medicines-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Dosage</th>
                      <th>Count</th>
                    </tr>
                  </thead>
                  <tbody>
                    {record.tablets.map((tablet, index) => (
                      <tr key={`tablet-${index}`}>
                        <td>{tablet.customName || tablet.name}</td>
                        <td>{tablet.dosage}</td>
                        <td>{tablet.count}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {showPrices && (
                <div className="ph-amount-input">
                  <label>Total Amount for Tablets (₹):</label>
                  <input
                    type="number"
                    min=""
                    step="0.01"
                    value={record.tabletsAmount || 0}
                    onChange={(e) => handleTabletsAmountChange(recordIndex, e.target.value)}
                    className="ph-medicine-input"
                    disabled={!editable}
                  />
                </div>
              )}
            </div>
          )}

          <hr style={{margin:'20px 0'}}/>

          {record.injections && (
            <div className="ph-medicine-section">
              <h4>Injections</h4>
              <div className="ph-injection-details">
                <p><strong>Name:</strong> {record.injections.customName || record.injections.name}</p>
                <p><strong>Size:</strong> {record.injections.size}</p>
                <p><strong>Dosage:</strong> {record.injections.dosage}</p>
              </div>
              {showPrices && (
                <div className="ph-amount-input">
                  <label>Total Amount for Injections (₹):</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={record.injectionsAmount || 0}
                    onChange={(e) => handleInjectionsAmountChange(recordIndex, e.target.value)}
                    className="ph-medicine-input"
                    disabled={!editable}
                  />
                </div>
              )}
            </div>
          )}

<hr style={{margin:'20px 0'}}/>


          {record.ointments && (
            <div className="ph-medicine-section">
              <h4>Ointments</h4>
              <div className="ph-ointment-details">
                <p><strong>Name:</strong> {record.ointments.customName || record.ointments.name}</p>
                <p><strong>Dosage:</strong> {record.ointments.dosage}</p>
              </div>
              {showPrices && (
                <div className="ph-amount-input">
                  <label>Total Amount for Ointments (₹):</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={record.ointmentsAmount || 0}
                    onChange={(e) => handleOintmentsAmountChange(recordIndex, e.target.value)}
                    className="ph-medicine-input"
                    disabled={!editable}
                  />
                </div>
              )}
            </div>
          )}

<hr style={{margin:'20px 0'}}/>

          {record.syrups && (
            <div className="ph-medicine-section">
              <h4>Syrups</h4>
              <div className="ph-syrup-details">
                <p><strong>Name:</strong> {record.syrups.customName || record.syrups.name}</p>
                <p><strong>Dosage:</strong> {record.syrups.dosage}</p>
              </div>
              {showPrices && (
                <div className="ph-amount-input">
                  <label>Total Amount for Syrups (₹):</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={record.syrupsAmount || 0}
                    onChange={(e) => handleSyrupsAmountChange(recordIndex, e.target.value)}
                    className="ph-medicine-input"
                    disabled={!editable}
                  />
                </div>
              )}
            </div>
          )}

<hr style={{margin:'20px 0'}}/>

          {showPrices && (
            <div className="ph-record-total">
              <span>Record Total:</span>
              <span>₹{calculateTotalAmount(record).toFixed(2)}</span>
            </div>
          )}
        </div>
      ))}

      {showPrices && (
        <div className="ph-grand-total">
          <span>Grand Total Amount:</span>
          <span>₹{grandTotal.toFixed(2)}</span>
        </div>
      )}

      {/* {onDownload && (
        <div className="ph-actions">
          <button className="ph-download-button" onClick={onDownload}>
            <FiDownload /> Download Bill
          </button>
        </div>
      )} */}
    </div>
  );
};

export default MedicinesTable;