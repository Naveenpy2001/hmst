import React, { useState, useEffect } from "react";
import "./Pharmacy.css";
import { FiPlus, FiFilter } from "react-icons/fi";
import api from "../../../services/api";
import PatientSearch from "./PharmacyComponents/PatientSearch";
import PatientDetails from "./PharmacyComponents/PatientDetails";
import MedicinesTable from "./PharmacyComponents/MedicinesTable";
import GivenMedicinesList from "./PharmacyComponents/GivenMedicinesList";
import FilterControls from "./PharmacyComponents/FilterControls";

const Pharmacy = () => {
  const [searchId, setSearchId] = useState("");
  const [patientDetails, setPatientDetails] = useState(null);
  const [medicalRecords, setMedicalRecords] = useState([]);
  const [givenMedicines, setGivenMedicines] = useState([]);
  const [activeTab, setActiveTab] = useState(1);
  const [filterId, setFilterId] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [filteredGivenMedicines, setFilteredGivenMedicines] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [editedRecords, setEditedRecords] = useState([]);

  const handleSearch = async () => {
    if (!searchId.trim()) {
      setError("Please enter a Patient ID or Phone number");
      return;
    }

    try {
      setIsLoading(true);
      setError("");
      const response = await api.get(`/api/patients-main/${searchId}/`);
      const data = response.data;
        // console.log('patient Data : ',data);
        
      if (data) {
        setPatientDetails({
          id: data.id,
          name: `${data.first_name} ${data.last_name}`,
          phone: data.phone,
          diseases: data.disease,
          status:data.status,
          doctor_advice : data.doctorAdvice
        });
        
        // Initialize medical records with amounts
        const recordsWithAmounts = data.medical_records.map(record => ({
          ...record,
          tabletsAmount: record.tabletsAmount || 0,
          injectionsAmount: record.injectionsAmount || 0,
          ointmentsAmount: record.ointmentsAmount || 0,
          syrupsAmount: record.syrupsAmount || 0
        }));
        
        setMedicalRecords(recordsWithAmounts);
        setEditedRecords(recordsWithAmounts);
      } else {
        setError("No patient found with this ID or phone number");
        setPatientDetails(null);
        setMedicalRecords([]);
        setEditedRecords([]);
      }
    } catch (error) {
      console.error("Error fetching patient data:", error.response.data.detail);
      setError(error.response.data.detail || "Failed to fetch patient data. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  

  const handleGiveMedicine = async () => {
    if (!patientDetails) {
      setError("No patient selected");
      return;
    }
  
    if (!editedRecords || editedRecords.length === 0) {
      setError("No medical records to dispense");
      return;
    }
  
    try {
      setIsLoading(true);
      setError("");
  
      for (const record of editedRecords) {
        const payload = {
          patient_id: patientDetails.id,
          patient: patientDetails.id,
          doctor_advice: patientDetails.doctorAdvice,
          record_id: record.id,
          patient_name: patientDetails.name,
          patient_disease: patientDetails.diseases,
          tablets: record.tablets?.map(tablet => ({
            name: tablet.name,
            dosage: tablet.dosage,
            count: tablet.count,
            price: tablet.price
          })) || [],
  
          tabletsAmount: record.tabletsAmount || 0,
  
          injections: record.injections ? {
            name: record.injections.name,
            size: record.injections.size,
            dosage: record.injections.dosage,
            price: record.injections.price
          } : null,
          injectionsAmount: record.injectionsAmount || 0,
  
          ointments: record.ointments ? {
            name: record.ointments.name,
            dosage: record.ointments.dosage,
            price: record.ointments.price
          } : null,
          ointmentsAmount: record.ointmentsAmount || 0,
  
          syrups: record.syrups ? {
            name: record.syrups.name,
            dosage: record.syrups.dosage,
            price: record.syrups.price
          } : null,
          syrupsAmount: record.syrupsAmount || 0,
  
          total_amount:
            (record.tabletsAmount || 0) +
            (record.injectionsAmount || 0) +
            (record.ointmentsAmount || 0) +
            (record.syrupsAmount || 0),
  
          date: new Date().toISOString()
        };
  
        // console.log("Sending pharmacy record:", payload);
  
        const response = await api.post("/api/pharmacy/", payload);
  
        if (response.status === 201 || response.status === 200) {
          // console.log("Successfully sent record:", record.id);
          fetchDispensedMedicines();
          setInterval(() => {
            setActiveTab(2)
          }, 300);
        }
      }
  
      const givenData = {
        patientId: patientDetails.id,
        patientName: patientDetails.name,
        date: new Date().toISOString(),
        medicalRecords: editedRecords
      };
  
      setGivenMedicines(prev => [...prev, givenData]);
      setError("");
      // alert("Medicines dispensed successfully!");
    } catch (error) {
      console.error("Error dispensing medicines:", error);
      setError("Failed to dispense medicines. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };


  const fetchDispensedMedicines = async () => {
    try {
      const response = await api.get('/api/pharmacy/');
// console.log('users data : ',response.data);

      
      const transformedData = response.data.map(record => ({
        patientId: record.patient,
        patient_name:record.patient_name,
        patient_disease:record.patient_disease,
        doctor_advice:record.doctor_advice,
        date: record.date,
        medicalRecords: [{
          id: record.id,
          tablets: record.tablets,
          injections: record.injections,
          ointments: record.ointments,
          syrups: record.syrups,
          tabletsAmount: parseFloat(record.tabletsAmount),
          injectionsAmount: parseFloat(record.injectionsAmount),
          ointmentsAmount: parseFloat(record.ointmentsAmount),
          syrupsAmount: parseFloat(record.syrupsAmount),
          total_amount: parseFloat(record.total_amount),
          doctorAdvice: record.doctorAdvice || "No advice recorded"
        }]
      }));
      setGivenMedicines(transformedData);
    } catch (error) {
      console.error("Error fetching dispensed medicines:", error);
    }
  };
  
  useEffect(() => {
    fetchDispensedMedicines();
  },[])

  

  const fetchPDF = async (patientId) => {
  
    
    try {
      setIsLoading(true);
      const response = await api.get(`/api/pharmacy/${patientId}/pharmacy-pdf/`, {
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
      if (error.response && error.response.data instanceof Blob) {
        const errorText = await error.response.data.text();
        console.error("Backend error:", errorText); // Shows {"detail": "Not found."}
      } else {
        console.error("Error fetching PDF:", error);
      }
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

  const handleMedicalRecordsChange = (updatedRecords) => {
    setEditedRecords(updatedRecords);
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
              isLoading={isLoading}
            />

            {isLoading && <div className="ph-loading">Loading patient data...</div>}

            <PatientDetails patient={patientDetails} />

            {medicalRecords.length > 0 && (
              <>
                <h3 className="ph-section-title">Prescribed Medicines</h3>
                {
                  patientDetails.status === 'Completed' ? (
                    <>
                    <p style={{fontWeight:'700',color:'green',textAlign:'center',fontSize:'30px'}}>Completed ✅</p>
                    </>
                  ) : (
                    <>
                    {medicalRecords.map((record, index) => (
                  <div key={index} className="ph-record-container">
                 
                    <MedicinesTable 
                      medicalRecords={[record]}
                      showPrices={true}
                      editable={true}
                      onDownload={() => patientDetails && fetchPDF(patientDetails.id)}
                      onMedicalRecordsChange={(updated) => {
                        const newRecords = [...editedRecords];
                        newRecords[index] = updated[0];
                        setEditedRecords(newRecords);
                      }}
                    />
                  </div>
                ))}
                    </>
                  )
                }

                <div className="ph-action-buttons">
                  <button
                    className="ph-primary-button"
                    onClick={handleGiveMedicine}
                    disabled={isLoading && patientDetails?.status === 'Completed'}
                  >
                    {isLoading ? "Processing..." : "Confirm Dispensing"}
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
              isLoading={isLoading}
            />

            <GivenMedicinesList
              medicines={givenMedicines}
              onDownload={fetchPDF}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default Pharmacy;