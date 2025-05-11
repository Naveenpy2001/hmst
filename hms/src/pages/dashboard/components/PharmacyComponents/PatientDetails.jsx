import React from "react";

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
        <div>
          <p className="ph-detail-label">Status</p>
          <p className="ph-detail-value">{patient.status}</p>
        </div>
      </div>
    </div>
  );
};

export default PatientDetails;