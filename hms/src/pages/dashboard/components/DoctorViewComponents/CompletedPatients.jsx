import React, { useEffect, useState } from 'react';
import './styles/CompletedPatients.css';
import api from '../../../../services/api';

const CompletedPatients = ({ selectedPatient, onSelectPatient }) => {
  const [completedPatients, setCompletedPatients] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const patientsPerPage = 7;
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch completed patients (you can call this in useEffect)
  const fetchCompletedPatients = async () => {
    try {
      const response = await api.get('/api/patients-main/completed/');
      console.log('completed : ',response.data);
      
      setCompletedPatients(response.data);
    } catch (error) {
      console.error('Error fetching completed patients:', error);
    }
  };
  useEffect(() => {
fetchCompletedPatients()
  },[])
  // Filter patients based on search term
  const filteredPatients = completedPatients.filter(patient => 
    `${patient.first_name} ${patient.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.disease.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination logic
  const indexOfLastPatient = currentPage * patientsPerPage;
  const indexOfFirstPatient = indexOfLastPatient - patientsPerPage;
  const currentPatients = filteredPatients.slice(indexOfFirstPatient, indexOfLastPatient);

  const downloadPdf = async (patientId) => {
    try {
      const response = await api.get(`/api/patients-main/${patientId}/generate_pdf/`, {
        responseType: 'blob',
      });

      const file = new Blob([response.data], { type: 'application/pdf' });
      const fileURL = window.URL.createObjectURL(file);
      const link = document.createElement('a');
      link.href = fileURL;
      link.setAttribute('download', `patient_${patientId}_report.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error downloading PDF:', error);
    }
  };

  return (
    <div className="cp-container">
      {!selectedPatient ? (
        <>
          <div className="cp-header">
            <h2 className="cp-title">Completed Patients Today</h2>
            <div className="cp-search">
              <input
                type="text"
                placeholder="Search patients..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="cp-search-input"
              />
            </div>
          </div>

          <div className="cp-table-container">
            <table className="cp-table">
              <thead>
                <tr>
                  <th>No.</th>
                  <th>ID</th>
                  <th>Patient Name</th>
                  <th>Age</th>
                  <th>Disease</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentPatients.map((patient,index) => (
                  <tr key={patient.id}>
                    <td>{index + 1}</td>
                    <td>{patient.id}</td>
                    <td>{`${patient.first_name} ${patient.last_name}`}</td>
                    <td>{patient.age}</td>
                    <td>{patient.disease}</td>
                    <td>
                    <span
                        className={`status-badge ${patient.status
                          .toLowerCase()
                          .replace(" ", "-")}`}
                      >
                        {patient.status}
                      </span>
                    </td>
                    <td className="cp-actions">
                      <button
                        className="cp-view-button"
                        onClick={() => onSelectPatient(patient)}
                      >
                        View
                      </button>
                      <button 
                        onClick={() => downloadPdf(patient.id)} 
                        className="cp-download-button"
                      >
                        Download PDF
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="cp-pagination">
            <button 
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="cp-pagination-button"
            >
              Previous
            </button>
            <span className="cp-page-info">
              Page {currentPage} of {Math.ceil(filteredPatients.length / patientsPerPage)}
            </span>
            <button 
              onClick={() => setCurrentPage(prev => 
                prev < Math.ceil(filteredPatients.length / patientsPerPage) ? prev + 1 : prev
              )}
              disabled={currentPage === Math.ceil(filteredPatients.length / patientsPerPage)}
              className="cp-pagination-button"
            >
              Next
            </button>
          </div>
        </>
      ) : (
        <div className="cp-patient-details">
          <hr />
          <h2 className="cp-details-title">Patient Details</h2>
          
          <div className="cp-details-grid">
            <div className="cp-detail-item">
              <span className="cp-detail-label">Name:</span>
              <span className="cp-detail-value">
                {selectedPatient.first_name} {selectedPatient.last_name}
              </span>
            </div>
            
            <div className="cp-detail-item">
              <span className="cp-detail-label">Age:</span>
              <span className="cp-detail-value">{selectedPatient.age}</span>
            </div>
            
            <div className="cp-detail-item">
              <span className="cp-detail-label">Disease:</span>
              <span className="cp-detail-value">{selectedPatient.disease}</span>
            </div>
            
            
            <div className="cp-detail-item">
              <span className="cp-detail-label">Status:</span>
              <span className={`cp-status cp-status-${selectedPatient.status.toLowerCase().replace(" ", "-")}`}>
                {selectedPatient.status}
              </span>
            </div>
          </div>
        <hr />
          <div className="cp-prescription-section">
            <h3 className="cp-section-title">Prescription Details</h3>
            
            {selectedPatient.medical_records[0].tablets && selectedPatient.medical_records[0].tablets.length > 0 && (
              <>
              <div className="cp-medication-group">
                <h4>Tablets</h4>
                <ul className="cp-medication-list">
                  {selectedPatient.medical_records[0].tablets.map((tablet, index) => (
                    <li key={index} className="cp-medication-item">
                      {tablet.name} | {tablet.count} tablets ({tablet.dosage}) | {tablet.frequency} | {tablet.duration} Days
                    </li>
                  ))}
                </ul>
              </div>
              <hr />
              </>
            )}

            {selectedPatient.medical_records[0].injections && (
              <>
              <div className="cp-medication-group">
                <h4>Injection</h4>
                <p className="cp-medication-item">
                  {selectedPatient.medical_records[0].injections.name} - {selectedPatient.medical_records[0].injections.size} - {selectedPatient.medical_records[0].injections.dosage}
                </p>
              </div>
              <hr />
              </>
            )}

        {selectedPatient.medical_records[0].ointments && (
              <>
              <div className="cp-medication-group">
                <h4>Ointment</h4>
                <p className="cp-medication-item">
                  {selectedPatient.medical_records[0].ointments.name} - {selectedPatient.medical_records[0].ointments.dosage}
                </p>
              </div>
              <hr />
              </>
            )}
    
        {selectedPatient.medical_records[0].syrups && (
              <>
              <div className="cp-medication-group">
                <h4>Syrup(Tonic)</h4>
                <p className="cp-medication-item">
                  {selectedPatient.medical_records[0].syrups.name} - {selectedPatient.medical_records[0].syrups.dosage}
                </p>
              </div>
              <hr />
              </>
            )}

            {selectedPatient.medical_records[0].tests && (
              <>
              <div className="cp-medication-group">
                <h4>Lab Test</h4>
                <p className="cp-medication-item">{selectedPatient.medical_records[0].tests}</p>
              </div>
              <hr />
              </>
            )}

            {selectedPatient.medical_records[0].doctorAdvice && (
              <>
              <div className="cp-advice-section">
                <h4>Doctor's Advice</h4>
                <p className="cp-advice-text">{selectedPatient.medical_records[0].doctorAdvice}</p>
              </div>
              <hr />
              </>
            )}
          </div>

          <div className="cp-details-actions">
            <button 
              onClick={() => onSelectPatient(null)}
              className="cp-back-button"
            >
              Back to List
            </button>
            <button 
              onClick={() => downloadPdf(selectedPatient.id)}
              className="cp-download-button"
            >
              Download Full Report
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompletedPatients;