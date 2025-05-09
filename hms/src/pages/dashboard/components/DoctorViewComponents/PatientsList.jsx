import React, { useState, useEffect } from "react";
import api from "../../../../services/api";


const PatientsList = ({ onSelectPatient }) => {
  const [patients, setPatients] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const patientsPerPage = 7;
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const response = await api.get(`/api/patients/pending/`);
        setPatients(response.data);
      } catch (error) {
        console.error("Error fetching patients:", error);
      }
    };
    fetchPatients();
  }, []);

  // Filter patients based on search term
  const filteredPatients = patients.filter(patient => 
    `${patient.first_name} ${patient.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.disease.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination logic
  const indexOfLastPatient = currentPage * patientsPerPage;
  const indexOfFirstPatient = indexOfLastPatient - patientsPerPage;
  const currentPatients = filteredPatients.slice(indexOfFirstPatient, indexOfLastPatient);

  return (
    <div className="patients-list-container">
      <div className="search-bar">
        <input
          type="text"
          placeholder="Search patients by name or disease..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>

      <div className="table-container">
        <table className="patients-table">
          <thead>
            <tr>
              <th>S.No.</th>
              <th>ID</th>
              <th>Patient Name</th>
              <th>Age</th>
              <th>Disease</th>
              <th>Status</th>
              <th>Action</th>
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
                  <span className={`status-badge ${patient.status}`}>
                    {patient.status}
                  </span>
                </td>
                <td>
                  <button
                    className={`action-button ${patient.status === 'Pending' ? 'treat' : 'view'}`}
                    onClick={() => onSelectPatient(patient.id)}
                  >
                    {patient.status === 'Pending' ? 'Treat' : 'View'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="pagination-controls">
        <button 
          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
        >
          Previous
        </button>
        <span>Page {currentPage} of {Math.ceil(filteredPatients.length / patientsPerPage)}</span>
        <button 
          onClick={() => setCurrentPage(prev => 
            prev < Math.ceil(filteredPatients.length / patientsPerPage) ? prev + 1 : prev
          )}
          disabled={currentPage === Math.ceil(filteredPatients.length / patientsPerPage)}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default PatientsList;