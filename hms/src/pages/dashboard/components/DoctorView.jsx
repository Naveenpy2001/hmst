import React, { useState, useEffect } from "react";
import PatientsList from "./DoctorViewComponents/PatientsList";
import PatientTreatmentForm from "./DoctorViewComponents/PatientTreatmentForm";
import CompletedPatients from "./DoctorViewComponents/CompletedPatients";
import "./DoctorViewComponents/styles/DoctorView.css";

const DoctorView = () => {
  const [activeTab, setActiveTab] = useState(1);
  const [patientId, setPatientId] = useState("");
  const [selectedPatient, setSelectedPatient] = useState(null);

  return (
    <div className="doctor-view-container">
      <h1 className="doctor-view-header">Doctor Dashboard</h1>

      <div className="tab-navigation">
        <button
          className={`tab-button ${activeTab === 1 ? "active" : ""}`}
          onClick={() => {
            setActiveTab(1);
            setSelectedPatient(null);
          }}
        >
          Patients List
        </button>
        <button
          className={`tab-button ${activeTab === 2 ? "active" : ""}`}
          onClick={() => setActiveTab(2)}
        >
          Patient Treatment
        </button>
        <button
          className={`tab-button ${activeTab === 3 ? "active" : ""}`}
          onClick={() => {
            setActiveTab(3);
            setSelectedPatient(null);
          }}
        >
          Completed Patients
        </button>
      </div>

      <div className="tab-content">
        {activeTab === 1 && <PatientsList onSelectPatient={(id) => {
          setPatientId(id);
          setActiveTab(2);
        }} />}
        
        {activeTab === 2 && (
          <PatientTreatmentForm 
            patientId={patientId} 
            onCancel={() => setActiveTab(1)}
          />
        )}
        
        {activeTab === 3 && (
          <CompletedPatients 
            selectedPatient={selectedPatient}
            onSelectPatient={setSelectedPatient}
          />
        )}
      </div>
    </div>
  );
};

export default DoctorView;