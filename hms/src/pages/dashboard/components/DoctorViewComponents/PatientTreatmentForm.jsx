import React, { useState, useEffect,useRef } from "react";
import api from "../../../../services/api";
import TabletInput from "./TabletInput";
import InjectionInput from "./InjectionInput";
import OintmentInput from "./OintmentInput";
import TonicInput from "./TonicInput";
import TestInput from "./TestInput";


const PatientTreatmentForm = ({ patientId, onCancel }) => {
    const tabletRef = useRef()
    const injectionRef = useRef();
  const [patientDetails, setPatientDetails] = useState({
    name: "",
    disease: "",
    age: "",
  });
  const [doctorAdvice, setDoctorAdvice] = useState("");

  const [message,setMessage] = useState('')

  useEffect(() => {
    if (patientId) {
      const fetchPatientDetails = async () => {
        try {
          const response = await api.get(`/api/patients/${patientId}/`);
          const data = response.data;
          
          setPatientDetails({
            name: `${data.first_name} ${data.last_name}`,
            disease: data.disease,
            age: data.age,
          });
        } catch (error) {
          console.error("Error fetching patient details:", error);
        }
      };
      fetchPatientDetails();
    }
  }, [patientId]);

  const handleSubmit = async (patientId) => {

    const tabletData = tabletRef.current.getTabletData();
    const injectionData = injectionRef.current.getInjectionData();
    // console.log("Tablet data:", tabletData);
    // console.log("Tablet data:", injectionData);
    let formData = {
      tablets:tabletData,
      injections:injectionData,
      patient :patientId,
      doctorAdvice,
    }
    try {

        const res = await api.post(`/api/records/`,formData)
        console.log('response of Data from frontend  :',res);

        // if(res.status ===201){
        //   const res = await api.post(`/api/patients/${patientId}/make-completed/`)
        //   console.log('successfully make as completed.'); 
        // }
        setDoctorAdvice(""); 
        setMessage("Success ✅")
    } catch (error) {
      console.log('Error in post data',error);
    }
    
  };

  return (
    <div className="treatment-form-container">
      <h2>Patient Treatment Form</h2>
      
      <div  className="treatment-form">
        <div className="patient-info-section">
          <h3>Patient Information</h3>
          <div className="form-group">
            <label>Patient ID</label>
            <input type="text" value={patientId} readOnly />
          </div>
          <div className="form-group">
            <label>Name</label>
            <input type="text" value={patientDetails.name} readOnly />
          </div>
          <div className="form-group">
            <label>Disease</label>
            <input type="text" value={patientDetails.disease} readOnly />
          </div>
          <div className="form-group">
            <label>Age</label>
            <input type="text" value={patientDetails.age} readOnly />
          </div>
        </div>

        <TabletInput ref={tabletRef}/>
        <InjectionInput ref={injectionRef}/>
        <OintmentInput />
        <TonicInput />
        <TestInput />

        <div className="form-group">
          <label>Doctor's Advice</label>
          <textarea
            value={doctorAdvice}
            onChange={(e) => setDoctorAdvice(e.target.value)}
            rows="4"
            placeholder="Additional advice for the patient..."
          />
        </div>
{
  message && <p style={{color:'green',textAlign:'center',fontSize:'20px'}}> {message} </p>
}
        <div className="form-actions">
          <button type="button" className="lb-secondary-button" onClick={onCancel}>
            Cancel
          </button>
          <button type="submit" onClick={() => handleSubmit(patientId)} className="lb-primary-button">
            Save Prescription
          </button>
        </div>
      </div>
    </div>
  );
};

export default PatientTreatmentForm;