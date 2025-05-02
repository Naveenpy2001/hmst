import React, { useEffect, useState } from "react";
import axios from "axios";
import "./patient.css";
import api from "../../../services/api";

const PatientRegistration = () => {
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    aadhar: "",
    address: "",
    gender: "",
    disease: "",
    other_disease: "",
    temparature: "",
    day: "",
    month: "",
    year: "",
    age: "",
    patientType: "",
    paymentType: "",
    amount: "",
    bed_assign: "no",
    weight: "",
    bp: ""
  });

  const [loading, setLoading] = useState(false);
  const [successData, setSuccessData] = useState(null);
  const [error, setError] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    if (["day", "month", "year"].includes(name)) {
      calculateAge({ ...formData, [name]: value });
    }
  };

  const calculateAge = (data) => {
    const { day, month, year } = data;
    if (day && month && year) {
      const birthDate = new Date(year, month - 1, day);
      const ageDifMs = Date.now() - birthDate.getTime();
      const ageDate = new Date(ageDifMs);
      const calculatedAge = Math.abs(ageDate.getUTCFullYear() - 1970);
      setFormData(prev => ({ ...prev, age: calculatedAge }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const finalFormData = {
      ...formData,
      disease: formData.disease === "Other" ? formData.other_disease : formData.disease,
    };
    
    
    try {
      const response = await api.post(
        'api/patients/',
        finalFormData
      );
      
      setSuccessData({
        id: response.data.id,
        name: `${formData.first_name} ${formData.last_name}`,
        email: formData.email,
        phone: formData.phone,
        age: formData.age,
        disease: formData.disease,
      });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to submit form. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      first_name: "",
      last_name: "",
      email: "",
      phone: "",
      aadhar: "",
      address: "",
      gender: "",
      disease: "",
      other_disease: "",
      temparature: "",
      day: "",
      month: "",
      year: "",
      age: "",
      patientType: "",
      paymentType: "",
      amount: "",
      bed_assign: "no",
      weight: "",
      bp: ""
    });
    setSuccessData(null);
  };

  return (
    <div className="pr-container">
      <h1 className="pr-title">Patient Registration</h1>
      
      {loading && (
        <div className="pr-loading">
          <div className="pr-spinner"></div>
          <p>Submitting patient data...</p>
        </div>
      )}

      {error && (
        <div className="pr-alert pr-alert-error">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="pr-alert-close">
            &times;
          </button>
        </div>
      )}

      {successData ? (
        <div className="pr-success">
          <div className="pr-success-card">
            <div className="pr-success-icon">✓</div>
            <h2>Registration Successful!</h2>
            <div className="pr-success-details">
              <p><strong>Patient ID:</strong> {successData.id}</p>
              <p><strong>Name:</strong> {successData.name}</p>
              <p><strong>Email:</strong> {successData.email}</p>
              <p><strong>Phone:</strong> {successData.phone}</p>
              <p><strong>Age:</strong> {successData.age}</p>
              <p><strong>Disease:</strong> {successData.disease}</p>
            </div>
            <div className="pr-success-actions">
              <button onClick={resetForm} className="pr-btn pr-btn-primary">
                Register Another Patient
              </button>
              <button 
                onClick={() => window.print()} 
                className="pr-btn pr-btn-secondary"
              >
                Print Details
              </button>
            </div>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="pr-form">
          <div className="pr-form-grid">
            {/* Personal Information */}
            <div className="pr-form-section">
              <h2 className="pr-section-title">Personal Information</h2>
              <div className="pr-form-group">
                <label className="pr-label">First Name</label>
                <input
                  type="text"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleInputChange}
                  className="pr-input"
                />
              </div>
              
              <div className="pr-form-group">
                <label className="pr-label">Last Name</label>
                <input
                  type="text"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleInputChange}
                  className="pr-input"
                
                />
              </div>
              
              <div className="pr-form-group">
                <label className="pr-label">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="pr-input"
                />
              </div>
              
              <div className="pr-form-group">
                <label className="pr-label">Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="pr-input"
                  
                />
              </div>
              
              <div className="pr-form-group">
                <label className="pr-label">Aadhar Number</label>
                <input
                  type="text"
                  name="aadhar"
                  value={formData.aadhar}
                  onChange={handleInputChange}
                  className="pr-input"
                />
              </div>
              
              <div className="pr-form-group">
                <label className="pr-label">Address</label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  className="pr-textarea"
                  rows="3"
                />
              </div>
              
              <div className="pr-form-group">
                <label className="pr-label">Gender</label>
                <div className="pr-radio-group">
                  <label className="pr-radio-label">
                    <input
                      type="radio"
                      name="gender"
                      value="Male"
                      checked={formData.gender === "Male"}
                      onChange={handleInputChange}
                      className="pr-radio"
                      
                    />
                    <span className="pr-radio-custom"></span>
                    Male
                  </label>
                  <label className="pr-radio-label">
                    <input
                      type="radio"
                      name="gender"
                      value="Female"
                      checked={formData.gender === "Female"}
                      onChange={handleInputChange}
                      className="pr-radio"
                    />
                    <span className="pr-radio-custom"></span>
                    Female
                  </label>
                  <label className="pr-radio-label">
                    <input
                      type="radio"
                      name="gender"
                      value="Others"
                      checked={formData.gender === "Others"}
                      onChange={handleInputChange}
                      className="pr-radio"
                    />
                    <span className="pr-radio-custom"></span>
                    Others
                  </label>
                </div>
              </div>
              
              <div className="pr-form-group">
                <label className="pr-label">Date of Birth</label>
                <div className="pr-dob-grid">
                  <select
                    name="day"
                    value={formData.day}
                    onChange={handleInputChange}
                    className="pr-select"
                    
                  >
                    <option value="">Day</option>
                    {Array.from({ length: 31 }, (_, i) => (
                      <option key={i + 1} value={i + 1}>
                        {i + 1}
                      </option>
                    ))}
                  </select>
                  <select
                    name="month"
                    value={formData.month}
                    onChange={handleInputChange}
                    className="pr-select"
                    
                  >
                    <option value="">Month</option>
                    {Array.from({ length: 12 }, (_, i) => (
                      <option key={i + 1} value={i + 1}>
                        {i + 1}
                      </option>
                    ))}
                  </select>
                  <select
                    name="year"
                    value={formData.year}
                    onChange={handleInputChange}
                    className="pr-select"
                    
                  >
                    <option value="">Year</option>
                    {Array.from({ length: 100 }, (_, i) => (
                      <option key={i + 1980} value={i + 1980}>
                        {i + 1980}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              {formData.age && (
                <div className="pr-form-group">
                  <label className="pr-label">Age</label>
                  <input
                    type="text"
                    value={formData.age}
                    className="pr-input"
                    readOnly
                  />
                </div>
              )}
            </div>

            {/* Medical Information */}
            <div className="pr-form-section">
              <h2 className="pr-section-title">Medical Information</h2>
              
              <div className="pr-form-group">
                <label className="pr-label">Disease</label>
                <select
                  name="disease"
                  value={formData.disease}
                  onChange={(e) =>
                    setFormData({ ...formData, disease: e.target.value })
                  }
                  className="pr-select"
                  
                >
                  <option value="">Select Disease</option>
                  <option value="Fever">Fever</option>
                  <option value="Headache">Headache</option>
                  <option value="Cold">Cold</option>
                  <option value="Rashes">Rashes</option>
                  <option value="Others">Others</option>
                </select>
                {formData.disease === "Others" && (
                  <input
                    type="text"
                    value={formData.other_disease}
                    onChange={(e) =>
                    setFormData({ ...formData, other_disease: e.target.value })
                      }
                    className="pr-input"
                    placeholder="Specify other disease"
                    
                  />
                )}
              </div>
              
              <div className="pr-form-group">
                <label className="pr-label">Weight (kg)</label>
                <input
                  type="number"
                  name="weight"
                  value={formData.weight}
                  onChange={handleInputChange}
                  className="pr-input"
                />
              </div>
              
              <div className="pr-form-group">
                <label className="pr-label">Blood Pressure</label>
                <input
                  type="text"
                  name="bp"
                  value={formData.bp}
                  onChange={handleInputChange}
                  className="pr-input"
                  placeholder="e.g. 120/80"
                />
              </div>
              
              <div className="pr-form-group">
                <label className="pr-label">Temperature (°F)</label>
                <input
                  type="number"
                  name="temparature"
                  value={formData.temparature}
                  onChange={handleInputChange}
                  className="pr-input"
                  step="0.1"
                />
              </div>
              
              <div className="pr-form-group">
                <label className="pr-label">Patient Type</label>
                <select
                  name="patientType"
                  value={formData.patientType}
                  onChange={handleInputChange}
                  className="pr-select"
                  
                >
                  <option value="">Select Type</option>
                  <option value="OPD">OPD</option>
                  <option value="IPD">IPD</option>
                  <option value="Emergency">Emergency</option>
                </select>
              </div>
              
              <div className="pr-form-group">
                <label className="pr-label">Bed Assignment</label>
                <div className="pr-radio-group">
                  <label className="pr-radio-label">
                    <input
                      type="radio"
                      name="bed_assign"
                      value="yes"
                      checked={formData.bed_assign === "yes"}
                      onChange={handleInputChange}
                      className="pr-radio"
                    />
                    <span className="pr-radio-custom"></span>
                    Yes
                  </label>
                  <label className="pr-radio-label">
                    <input
                      type="radio"
                      name="bed_assign"
                      value="no"
                      checked={formData.bed_assign === "no"}
                      onChange={handleInputChange}
                      className="pr-radio"
                    />
                    <span className="pr-radio-custom"></span>
                    No
                  </label>
                </div>
              </div>
              
              {formData.bed_assign === "yes" && (
                <>
                  <div className="pr-form-group">
                    <label className="pr-label">Bed Details</label>
                    <input
                      type="text"
                      name="bedDetails"
                      value={formData.bedDetails}
                      onChange={handleInputChange}
                      className="pr-input"
                      placeholder="Ward/Bed number"
                      
                    />
                  </div>
                  <div className="pr-form-group">
                    <label className="pr-label">Duration (Days)</label>
                    <input
                      type="number"
                      name="bedDays"
                      value={formData.bedDays}
                      onChange={handleInputChange}
                      className="pr-input"
                      
                    />
                  </div>
                </>
              )}
            </div>

            {/* Payment Information */}
            <div className="pr-form-section">
              <h2 className="pr-section-title">Payment Information</h2>
              
              <div className="pr-form-group">
                <label className="pr-label">Payment Type</label>
                <select
                  name="paymentType"
                  value={formData.paymentType}
                  onChange={handleInputChange}
                  className="pr-select"
                  
                >
                  <option value="">Select Payment Mode</option>
                  <option value="Cash">Cash</option>
                  <option value="UPI">UPI</option>
                  <option value="NetBanking">Net Banking</option>
                  <option value="Account">Account</option>
                  <option value="Reference">Reference</option>
                  <option value="Insurance">Insurance</option>
                  <option value="Others">Others</option>
                </select>
              </div>
              
              {formData.paymentType && (
                <div className="pr-form-group">
                  <label className="pr-label">Amount (₹)</label>
                  <input
                    type="number"
                    name="amount"
                    value={formData.amount}
                    onChange={handleInputChange}
                    className="pr-input"
                    required={formData.paymentType !== "Reference" && formData.paymentType !== "Insurance"}
                  />
                </div>
              )}
              
              {formData.paymentType === "UPI" && (
                <div className="pr-form-group">
                  <label className="pr-label">UPI Transaction ID</label>
                  <input
                    type="text"
                    name="upiTransactionNo"
                    value={formData.upiTransactionNo}
                    onChange={handleInputChange}
                    className="pr-input"
                    
                  />
                </div>
              )}
              
              {(formData.paymentType === "NetBanking" || formData.paymentType === "Account") && (
                <div className="pr-form-group">
                  <label className="pr-label">Transaction ID</label>
                  <input
                    type="text"
                    name={`${formData.paymentType.toLowerCase()}TransactionId`}
                    value={formData[`${formData.paymentType.toLowerCase()}TransactionId`]}
                    onChange={handleInputChange}
                    className="pr-input"
                    
                  />
                </div>
              )}
              
              {formData.paymentType === "Reference" && (
                <div className="pr-form-group">
                  <label className="pr-label">Reference Details</label>
                  <input
                    type="text"
                    name="reference"
                    value={formData.reference}
                    onChange={handleInputChange}
                    className="pr-input"
                    
                  />
                </div>
              )}
              
              {formData.paymentType === "Insurance" && (
                <div className="pr-form-group">
                  <label className="pr-label">Insurance Details</label>
                  <input
                    type="text"
                    name="insurance"
                    value={formData.insurance}
                    onChange={handleInputChange}
                    className="pr-input"
                    
                  />
                </div>
              )}
              
              {formData.paymentType === "Others" && (
                <div className="pr-form-group">
                  <label className="pr-label">Other Payment Details</label>
                  <input
                    type="text"
                    name="otherPayment"
                    value={formData.otherPayment}
                    onChange={handleInputChange}
                    className="pr-input"
                    
                  />
                </div>
              )}
            </div>
          </div>
          
          <div className="pr-form-actions">
            <button type="submit" className="pr-btn pr-btn-primary" disabled={loading}>
              {loading ? 'Submitting...' : 'Register Patient'}
            </button>
            <button type="button" onClick={resetForm} className="pr-btn pr-btn-secondary">
              Reset Form
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default PatientRegistration;