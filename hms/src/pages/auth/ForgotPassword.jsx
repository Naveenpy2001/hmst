import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from "react-router-dom";
import { FiMail, FiLock, FiArrowLeft } from "react-icons/fi";
import './ForgotPassword.css';
import Footer from '../../components/Footer';
import Navbar from '../../components/Navbar';
import api from '../../services/api';

const ForgotPassword = () => {
    const [step, setStep] = useState(1);
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();


    const handleEmailSubmit = async (e) => {
        e.preventDefault();
        if (!email) {
            setError('Please enter your email');
            return;
        }
        
        try {
            setIsLoading(true);
            setError('');
            await api.post(`/api/forgot-password/`, { email });
            setStep(2);
        } catch (error) {
            setError(error.response?.data?.error || 'Failed to send OTP');
            console.error('Error sending OTP:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleOtpSubmit = async (e) => {
        e.preventDefault();
        if (!otp) {
            setError('Please enter the OTP');
            return;
        }
        
        try {
            setIsLoading(true);
            setError('');
            await api.post(`/api/verify-otp/`, { email, otp });
            setStep(3);
        } catch (error) {
            setError(error.response?.data?.message || 'Invalid OTP');
            console.error('Error verifying OTP:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handlePasswordReset = async (e) => {
        e.preventDefault();

        if (!password || !confirmPassword) {
            setError('Please fill in all fields');
            return;
        }
        if (password !== confirmPassword) {
            setError("Passwords don't match");
            return;
        }

        
        try {
            setIsLoading(true);
            setError('');
            await api.post(`/api/reset-password/`, { email,new_password: password,confirm_password: confirmPassword });
            alert('Password reset successfully!');
            navigate('/login');
 
        } catch (error) {
            setError(error.response?.data?.message || 'Failed to reset password');
            console.error('Error resetting password:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleBack = () => {
        if (step > 1) {
            setStep(step - 1);
            setError('');
        } else {
            navigate('/login');

        }
    };

    return (
        <>
        <Navbar />
        <div className="sn-container">
            <div className="sn-card">
                <button className="sn-back-button" onClick={handleBack}>
                    <FiArrowLeft /> Back
                </button>

                <div className="sn-header">
                    <h1 className="sn-title">Reset Password</h1>
                    <p className="sn-subtitle">
                        {step === 1 && 'Enter your email to receive a verification code'}
                        {step === 2 && 'Enter the OTP sent to your email'}
                        {step === 3 && 'Create your new password'}
                    </p>
                </div>

                {error && (
                    <div className="sn-error">
                        {error}
                        <button onClick={() => setError('')} className="sn-error-close">
                            ×
                        </button>
                    </div>
                )}

                <div className="sn-progress">
                    <div className={`sn-progress-step ${step >= 1 ? 'active' : ''}`}>
                        <span>1</span>
                        <p>Verify Email</p>
                    </div>
                    <div className={`sn-progress-step ${step >= 2 ? 'active' : ''}`}>
                        <span>2</span>
                        <p>Enter OTP</p>
                    </div>
                    <div className={`sn-progress-step ${step >= 3 ? 'active' : ''}`}>
                        <span>3</span>
                        <p>New Password</p>
                    </div>
                </div>

                {step === 1 && (
                    <form className="sn-form" onSubmit={handleEmailSubmit}>
                        <div className="sn-form-group">
                            <label className="sn-label">Email Address</label>
                            <div className="sn-input-group">
                                <FiMail className="sn-input-icon" />
                                <input
                                    type="email"
                                    className="sn-input"
                                    placeholder="your@email.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <button 
                            type="submit" 
                            className="sn-button"
                            disabled={isLoading}
                        >
                            {isLoading ? 'Sending...' : 'Send OTP'}
                        </button>
                    </form>
                )}

                {step === 2 && (
                    <form className="sn-form" onSubmit={handleOtpSubmit}>
                        <div className="sn-form-group">
                            <label className="sn-label">Verification Code</label>
                            <div className="sn-input-group">
                                <input
                                    type="text"
                                    className="sn-input"
                                    placeholder="Enter 6-digit code"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                    required
                                />
                            </div>
                            <p className="sn-hint">Check your email for the OTP</p>
                        </div>

                        <button 
                            type="submit" 
                            className="sn-button"
                            disabled={isLoading}
                        >
                            {isLoading ? 'Verifying...' : 'Verify Code'}
                        </button>
                    </form>
                )}

                {step === 3 && (
                    <form className="sn-form" onSubmit={handlePasswordReset}>
                        <div className="sn-form-group">
                            <label className="sn-label">New Password</label>
                            <div className="sn-input-group">
                                <FiLock className="sn-input-icon" />
                                <input
                                    type="password"
                                    className="sn-input"
                                    placeholder="Create new password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className="sn-form-group">
                            <label className="sn-label">Confirm Password</label>
                            <div className="sn-input-group">
                                <FiLock className="sn-input-icon" />
                                <input
                                    type="password"
                                    className="sn-input"
                                    placeholder="Confirm new password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <button 
                            type="submit" 
                            className="sn-button"
                            disabled={isLoading}
                        >
                            {isLoading ? 'Resetting...' : 'Reset Password'}
                        </button>
                    </form>
                )}

                <div className="sn-footer">
                    Remember your password?{' '}
                    <button 
                        className="sn-link"
                        onClick={() => {
                            navigate('/login');
                        }}
                    >
                        Sign in
                    </button>
                </div>
            </div>
        </div>
        <Footer />
        </>
    );
};

export default ForgotPassword;