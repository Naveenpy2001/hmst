import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { FaEnvelope, FaLock,FaArrowLeft } from 'react-icons/fa';
import { FcGoogle } from 'react-icons/fc';
import { AiFillApple } from 'react-icons/ai';
import './Login.css'
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import api from '../../services/api';

const LoginForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [showOTP, setShowOTP] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [resendTimer, setResendTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [verificationError, setVerificationError] = useState('');
  const [unverifiedEmail, setUnverifiedEmail] = useState('');
  const otpInputs = useRef([]);


  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
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
    
    if (value && index < 5) {
      otpInputs.current[index + 1].focus();
    }
    
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
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    if (!formData.password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

 
  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (!validateForm()) return;
  
    setIsSubmitting(true);
  
    try {
      const response = await api.post('/api/login/', formData);
      
      localStorage.setItem("access_token", response.data.access);
      localStorage.setItem("refresh_token", response.data.refresh);
      
      const {  is_staff, email } = response.data;

      if (is_staff) {
        navigate('/admin/dashboard');
      } else {
        navigate('/dashboard');
      }
      
    } catch (error) {
      localStorage.removeItem('access_token')
      console.error('Login error:', error);
      const errData = error.response?.data;
    
    if (errData?.email && errData?.is_verified === false) {
      setUnverifiedEmail(errData.email);
      setShowOTP(true);
      await handleResendOTP(errData.email);
    } else {
      setErrors({
        ...errors,
        server: errData?.error || 'Login failed. Please try again.'
      });
    }
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
        email: unverifiedEmail,
        otp: otpCode
      });
      navigate('/dashboard');
    } catch (error) {
      setVerificationError(error.response?.data?.message || 'Verification failed. Please try again.');
    }
  };

  const handleResendOTP = async (email) => {
    try {
      await api.post('/api/resend-otp/', {
        email: email || unverifiedEmail,
      });
      setResendTimer(60);
      setCanResend(false);
      startResendTimer();
    } catch (error) {
      console.log('resend otp error :',error);
      
      setVerificationError('Failed to resend OTP. Please try again.');
      setResendTimer(60);
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
   
    <div className="lg-container">
      <div className="lg-main-c">
      <div className="lg-left-panel">
        <h1 className="lg-welcome-title">Hospital Management System</h1>
        <p className="lg-welcome-text">
          Streamline your hospital operations with our comprehensive HMS solution.
          Manage patients, appointments, and medical records all in one place.
        </p>
        <div className="lg-features">
          <div className="lg-feature-item">
            <h3>Patient Management</h3>
            <p>Efficiently manage patient records and history</p>
          </div>
          <div className="lg-feature-item">
            <h3>Appointment Scheduling</h3>
            <p>Seamless booking and calendar integration</p>
          </div>
          <div className="lg-feature-item">
            <h3>Medical Records</h3>
            <p>Secure and centralized patient data storage</p>
          </div>
        </div>
      </div>
      </div>
      
      <div className="lg-form-container">

      {showOTP ? (
          <div className="lg-otp-container">
            <button 
              className="lg-back-button" 
              onClick={() => setShowOTP(false)}
            >
              <FaArrowLeft /> Back
            </button>
            
            <div className="lg-title-container">
              <p className="lg-title">Verify Your Email</p>
              <span className="lg-subtitle">
                We've sent a 6-digit code to {unverifiedEmail}
              </span>
            </div>
            
            {verificationError && (
              <div className="lg-error-message">
                {verificationError}
              </div>
            )}

<div className="lg-otp-inputs">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(e, index)}
                  onKeyDown={(e) => handleOtpKeyDown(e, index)}
                  ref={(el) => (otpInputs.current[index] = el)}
                  className="lg-otp-input"
                />
              ))}
            </div>
            
            <div className="lg-otp-actions">
              <button
                className="lg-verify-btn"
                onClick={handleVerifyOTP}
              >
                Verify
              </button>

              <button
                className="lg-resend-btn"
                onClick={handleResendOTP}
                disabled={!canResend}
              >
                {canResend ? 'Resend OTP' : `Resend in ${resendTimer}s`}
              </button>
            </div>
          </div>
        ) : (
          <>

        {/* <div className="lg-logo-container"></div> */}
        <div className="lg-title-container">
          <p className="lg-title">Login to your Account</p>
          <span className="lg-subtitle">
            Welcome back! Please enter your credentials to access your account.
          </span>
        </div>
        
        {errors.server && (
          <div className="lg-error-message">
            {errors.server}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="lg-form">
          <div className="lg-input-container">
            <label className="lg-input-label" htmlFor="lg-email">Email</label>
            <div className="lg-icon">
              <FaEnvelope />
            </div>
            <input
              placeholder="name@mail.com"
              name="email"
              type="email"
              className="lg-input-field"
              id="lg-email"
              value={formData.email}
              onChange={handleChange}
            />
            {errors.email && <span className="lg-error">{errors.email}</span>}
          </div>
          
          <div className="lg-input-container">
            <label className="lg-input-label" htmlFor="lg-password">Password</label>
            <div className="lg-icon">
              <FaLock />
            </div>
            <input
              placeholder="Password"
              name="password"
              type="password"
              className="lg-input-field"
              id="lg-password"
              value={formData.password}
              onChange={handleChange}
            />
            {errors.password && <span className="lg-error">{errors.password}</span>}
          </div>
          
          <div className="lg-options-container">
            <label className="lg-remember-me">
              <input
                type="checkbox"
                name="rememberMe"
                checked={formData.rememberMe}
                onChange={handleChange}
              />
              <span>Remember me</span>
            </label>
            <Link to="/forgot" className="lg-forgot-password">
              Forgot password?
            </Link>
          </div>
          
          <button
            title="Login"
            type="submit"
            className="lg-sign-in-btn"
            disabled={isSubmitting}
          >
            <span>{isSubmitting ? 'Logging in...' : 'Login'}</span>
          </button>
        </form>
        
        <p className="lg-note">
          Don't have an account? <Link to="/register">Register</Link>
        </p>
        </>
        )}
      </div>   
    </div>
    
    <Footer />
    </>
  );
};

export default LoginForm;