import React, { useState, useEffect,useRef } from "react";
import api from "../../../../services/api";
import TabletInput from "./TabletInput";
import InjectionInput from "./InjectionInput";
import OintmentInput from "./OintmentInput";
import TonicInput from "./TonicInput";
import TestInput from "./TestInput";


const PatientTreatmentForm = ({ patientId, onCancel,onSuccess  }) => {
    const tabletRef = useRef()
    const injectionRef = useRef();
    const ointmentRef = useRef();
    const tonicRef = useRef();
    const testRef = useRef();
  const [patientDetails, setPatientDetails] = useState({
    name: "",
    disease: "",
    age: "",
    phone: ''
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
            phone:data.phone
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
    const ointmentData = ointmentRef.current.getOintmentData();
    const tonicData = tonicRef.current.getTonicData();
    const testData = testRef.current.getTestData();
    let formData = {
      tablets:tabletData,
      injections:injectionData,
      patient :patientId,
      doctorAdvice,
      ointments:ointmentData,
      syrups:tonicData,
      tests:testData
    }
    try {
        const res = await api.post(`/api/records/`,formData)
   
        setDoctorAdvice(""); 
        setMessage("Success ✅");
        onSuccess();
    } catch (error) {
      console.error('Error in post data',error);
    }
    
  };

  return (
    <div className="treatment-form-container">      
      <div  className="treatment-form">
        <div className="patient-info-section">
          <h3>Patient Information</h3>
                    <div style={{ display: 'flex',alignItems:'center', minWidth: '200px' }}>
                        <p style={{ margin: '0', color: '#393939' }}>Patient ID : </p>
                        <p style={{ 
                            margin: '0',
                            padding: '8px',
                            backgroundColor: '#f9f9f9',
                            borderRadius: '4px',
                            borderLeft: '0 solid#393939',
                            fontWeight:'700'
                        }}>{patientId}</p>
                    </div>

                    <div style={{ display: 'flex',alignItems:'center', minWidth: '200px' }}>
                        <p style={{ margin: '0', color: '#393939' }}>Name : </p>
                        <p style={{ 
                            margin: '0',
                            padding: '8px',
                            backgroundColor: '#f9f9f9',
                            borderRadius: '4px',
                            borderLeft: '0 solid#393939',
                            fontWeight:'600'
                        }}>{patientDetails.name}</p>
                    </div>
                    <div style={{ display: 'flex',alignItems:'center', minWidth: '200px' }}>
                        <p style={{ margin: '0', color: '#393939' }}>Disease : </p>
                        <p style={{ 
                            margin: '0',
                            padding: '8px',
                            backgroundColor: '#f9f9f9',
                            borderRadius: '4px',
                            borderLeft: '0 solid#393939',
                            fontWeight:'600'
                        }}>{patientDetails.disease}</p>
                    </div>
                    <div style={{ display: 'flex',alignItems:'center', minWidth: '200px' }}>
                        <p style={{ margin: '0', color: '#393939' }}>Age : </p>
                        <p style={{ 
                            margin: '0',
                            padding: '8px',
                            backgroundColor: '#f9f9f9',
                            borderRadius: '4px',
                            borderLeft: '0 solid#393939',
                            fontWeight:'600'
                        }}>{patientDetails.age}</p>
                    </div>
                    <div style={{ display: 'flex',alignItems:'center', minWidth: '200px' }}>
                        <p style={{ margin: '0', color: '#393939' }}>Phone No. : </p>
                        <p style={{ 
                            margin: '0',
                            padding: '8px',
                            backgroundColor: '#f9f9f9',
                            borderRadius: '4px',
                            borderLeft: '0 solid#393939',
                            fontWeight:'600'
                        }}><i style={{fontWeight:'600'}}>+91</i> {patientDetails.phone}</p>
                    </div>
        </div>

        <TabletInput ref={tabletRef}/>
        <InjectionInput ref={injectionRef}/>
        <OintmentInput ref={ointmentRef}/>
        <TonicInput ref={tonicRef}/>
        <TestInput ref={testRef}/>

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