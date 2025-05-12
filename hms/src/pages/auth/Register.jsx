import React, { useState,useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { FaEnvelope, FaLock, FaUser, FaHospital, FaPhone, FaMapMarkerAlt,FaArrowLeft  } from 'react-icons/fa';
import './Register.css'
import Footer from '../../components/Footer';
import Navbar from '../../components/Navbar';
import api from '../../services/api';

const RegisterForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    hospitalName: '',
    address: '',
    phoneNumber: '',
    referredBy: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [showOTP, setShowOTP] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [resendTimer, setResendTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [verificationError, setVerificationError] = useState('');
  const otpInputs = useRef([]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  const handleOtpChange = (e, index) => {
    const value = e.target.value;
    if (isNaN(value)) return;
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    
    // Auto focus to next input
    if (value && index < 5) {
      otpInputs.current[index + 1].focus();
    }
    
    // Clear verification error when typing
    if (verificationError) setVerificationError('');
  };

  const handleOtpKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const newOtp = [...otp];
      newOtp[index - 1] = '';
      setOtp(newOtp);
      otpInputs.current[index - 1].focus();
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 4) {
      newErrors.password = 'Password must be at least 8 characters';
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    if (!formData.hospitalName.trim()) newErrors.hospitalName = 'Hospital name is required';
    if (!formData.address.trim()) newErrors.address = 'Address is required';
    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = 'Phone number is required';
    } else if (!/^\d{10,15}$/.test(formData.phoneNumber)) {
      newErrors.phoneNumber = 'Phone number is invalid';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    const transformedData = {
      username: `${formData.firstName} ${formData.lastName}`,
      password: formData.confirmPassword,
      email: formData.email,
      hospital_name: formData.hospitalName,
      address: formData.address,
      phone_number: formData.phoneNumber,
      referred_by: formData.referredBy
    };
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      const response = await api.post('/api/register/', transformedData);
      setShowOTP(true);
      startResendTimer();
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
    } catch (error) {
      console.error('Registration error:', error);
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
      setErrors({
        ...errors,
        server: error.response?.data?.message || 'Registration failed. Please try again.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyOTP = async () => {
    const otpCode = otp.join('');
    if (otpCode.length !== 6) {
      setVerificationError('Please enter a valid 6-digit OTP');
      return;
    }
    
    try {
      const response = await api.post('/api/verify-otp/', {
        email: formData.email,
        otp: otpCode
      });
      navigate('/login');
    } catch (error) {
      setVerificationError(error.response?.data?.message || 'Verification failed. Please try again.');
    }
  };

  const handleResendOTP = async () => {
    try {
      await api.post('/api/resend-otp/', {
        email: formData.email
      });
      setResendTimer(60);
      setCanResend(false);
      startResendTimer();
    } catch (error) {
      setVerificationError('Failed to resend OTP. Please try again.');
    }
  };

  const startResendTimer = () => {
    const timer = setInterval(() => {
      setResendTimer((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  };

  return (
    <>
    <Navbar />
    <div className="rg-container">
      <div className="rg-main-c">
      <div className="rg-left-panel">
        <h1 className="rg-welcome-title">Hospital Management System</h1>
        <p className="rg-welcome-text">
          Join our network of healthcare professionals and streamline your hospital operations with our comprehensive HMS solution.
        </p>
        <div className="rg-features">
          <div className="rg-feature-item">
            <h3>Centralized Patient Data</h3>
            <p>Manage all patient records in one secure platform</p>
          </div>
          <div className="rg-feature-item">
            <h3>Efficient Workflow</h3>
            <p>Automate appointments, billing, and inventory management</p>
          </div>
          <div className="rg-feature-item">
            <h3>24/7 Support</h3>
            <p>Dedicated support team for your hospital needs</p>
          </div>
        </div>
      </div>
      </div>
      
      <div className="rg-form-container">
      {showOTP ? (
          <div className="rg-otp-container">
            <button 
              className="rg-back-button" 
              onClick={() => setShowOTP(false)}
            >
              <FaArrowLeft /> Back
            </button>
            
            <div className="rg-title-container">
              <p className="rg-title">Verify Your Email</p>
              <span className="rg-subtitle">
                We've sent a 6-digit code to {formData.email}
              </span>
            </div>
            
            {verificationError && (
              <div className="rg-error-message">
                {verificationError}
              </div>
            )}
             <div className="rg-otp-inputs">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(e, index)}
                  onKeyDown={(e) => handleOtpKeyDown(e, index)}
                  ref={(el) => (otpInputs.current[index] = el)}
                  className="rg-otp-input"
                />
              ))}
            </div>
            
            <div className="rg-otp-actions">
              <button
                className="rg-verify-btn"
                onClick={handleVerifyOTP}
              >
                Verify
              </button>
              <button
                className="rg-resend-btn"
                onClick={handleResendOTP}
                disabled={!canResend}
              >
                {canResend ? 'Resend OTP' : `Resend in ${resendTimer}s`}
              </button>
            </div>
          </div>
        ) : (
          <>
        {/* <div className="rg-logo-container"></div> */}
         <div className="rg-title-container">
          <p className="rg-title">Create Your Account</p>
          <span className="rg-subtitle">
            Get started with our HMS platform by creating your account
          </span>
        </div>
        
        {errors.server && (
          <div className="rg-error-message">
            {errors.server}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="rg-form">
          <div className="rg-input-row">
            <div className="rg-input-container">
              <label className="rg-input-label" htmlFor="rg-firstName">First Name</label>
              <div className="rg-icon">
                <FaUser />
              </div>
              <input
                placeholder="John"
                name="firstName"
                type="text"
                className="rg-input-field"
                id="rg-firstName"
                value={formData.firstName}
                onChange={handleChange}
              />
              {errors.firstName && <span className="rg-error">{errors.firstName}</span>}
            </div>
            
            <div className="rg-input-container">
              <label className="rg-input-label" htmlFor="rg-lastName">Last Name</label>
              <div className="rg-icon">
                <FaUser />
              </div>
              <input
                placeholder="Doe"
                name="lastName"
                type="text"
                className="rg-input-field"
                id="rg-lastName"
                value={formData.lastName}
                onChange={handleChange}
              />
              {errors.lastName && <span className="rg-error">{errors.lastName}</span>}
            </div>
          </div>
          
          <div className="rg-input-container">
            <label className="rg-input-label" htmlFor="rg-email">Email</label>
            <div className="rg-icon">
              <FaEnvelope />
            </div>
            <input
              placeholder="name@mail.com"
              name="email"
              type="email"
              className="rg-input-field"
              id="rg-email"
              value={formData.email}
              onChange={handleChange}
            />
            {errors.email && <span className="rg-error">{errors.email}</span>}
          </div>
          
          <div className="rg-input-row">
            <div className="rg-input-container">
              <label className="rg-input-label" htmlFor="rg-password">Password</label>
              <div className="rg-icon">
                <FaLock />
              </div>
              <input
                placeholder="Password"
                name="password"
                type="password"
                className="rg-input-field"
                id="rg-password"
                value={formData.password}
                onChange={handleChange}
              />
              {errors.password && <span className="rg-error">{errors.password}</span>}
            </div>
            
            <div className="rg-input-container">
              <label className="rg-input-label" htmlFor="rg-confirmPassword">Confirm Password</label>
              <div className="rg-icon">
                <FaLock />
              </div>
              <input
                placeholder="Confirm Password"
                name="confirmPassword"
                type="password"
                className="rg-input-field"
                id="rg-confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
              />
              {errors.confirmPassword && <span className="rg-error">{errors.confirmPassword}</span>}
            </div>
          </div>
          
          <div className="rg-input-container">
            <label className="rg-input-label" htmlFor="rg-hospitalName">Hospital Name</label>
            <div className="rg-icon">
              <FaHospital />
            </div>
            <input
              placeholder="General Hospital"
              name="hospitalName"
              type="text"
              className="rg-input-field"
              id="rg-hospitalName"
              value={formData.hospitalName}
              onChange={handleChange}
            />
            {errors.hospitalName && <span className="rg-error">{errors.hospitalName}</span>}
          </div>
          
          <div className="rg-input-container">
            <label className="rg-input-label" htmlFor="rg-address">Address</label>
            <div className="rg-icon">
              <FaMapMarkerAlt />
            </div>
            <input
              placeholder="123 Main St, City"
              name="address"
              type="text"
              className="rg-input-field"
              id="rg-address"
              value={formData.address}
              onChange={handleChange}
            />
            {errors.address && <span className="rg-error">{errors.address}</span>}
          </div>
          
          <div className="rg-input-row">
            <div className="rg-input-container">
              <label className="rg-input-label" htmlFor="rg-phoneNumber">Phone Number</label>
              <div className="rg-icon">
                <FaPhone />
              </div>
              <input
                placeholder="1234567890"
                name="phoneNumber"
                type="tel"
                className="rg-input-field"
                id="rg-phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
              />
              {errors.phoneNumber && <span className="rg-error">{errors.phoneNumber}</span>}
            </div>
            
            <div className="rg-input-container">
              <label className="rg-input-label" htmlFor="rg-referredBy">Referred By (Optional)</label>
              <div className="rg-icon">
                <FaUser />
              </div>
              <input
                placeholder="Referral name"
                name="referredBy"
                type="text"
                className="rg-input-field"
                id="rg-referredBy"
                value={formData.referredBy}
                onChange={handleChange}
              />
            </div>
          </div>
          
          <button
            title="Register"
            type="submit"
            className="rg-sign-up-btn"
            disabled={isSubmitting}
          >
            <span>{isSubmitting ? 'Creating Account...' : 'Create Account'}</span>
          </button>
        </form>

        
        <p className="rg-note">
          Already have an account? <Link to="/login">Login</Link>
        </p>
        </>
        )}
      </div>
    </div>
    <Footer />
    </>
  );
};

export default RegisterForm;