import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FiDollarSign, FiCalendar, FiCreditCard, FiPieChart, FiDownload } from 'react-icons/fi';
// import { API_URL } from '../../API';
import './Billing.css';
import api from '../../../services/api';
import useBillingStore from '../../../store/billingStore';

const Billing = () => {

  const {
    todaysPayments,
    monthlyPayments,
    yearlyPayments,
    totalPatients,
    setTodaysPayments,
    setMonthlyPayments,
    setYearlyPayments,
    setTotalPatients
  } = useBillingStore();

  const [currentTab, setCurrentTab] = useState('todaysPayments');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [downloadUrl, setDownloadUrl] = useState('');

  const fetchTodaysPayments = async () => {
    try {
      setIsLoading(true);
      const response = await api.get(`/api/patients/`);
      setTodaysPayments(response.data || []);
    } catch (err) {
      setError('Failed to fetch today\'s payments');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMonthlyPayments = async () => {
    try {
      setIsLoading(true);
      const response = await api.get(`/api/patients/patients_stats/`);
      setMonthlyPayments(response.data?.monthly_data || []);
    } catch (err) {
      setError('Failed to fetch monthly payments');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };
  
  const fetchYearlyPayments = async () => {
    try {
      setIsLoading(true);
      const response = await api.get(`/api/patients/patients_stats/`);
      setYearlyPayments(response.data?.yearly_data || []);
    } catch (err) {
      setError('Failed to fetch yearly payments');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };
  

  const fetchPatientStats = async () => {
    try {
      setIsLoading(true);
      const response = await api.get(`/api/patients/patients_stats/`);
      setTotalPatients(response.data?.completed_this_month_count || 0);
    } catch (err) {
      setError('Failed to fetch patient stats');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const generateReport = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`${API_URL}/api/generate-billing-report/`, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      setDownloadUrl(url);
    } catch (err) {
      setError('Failed to generate report');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTodaysPayments();
    fetchPatientStats();
  }, []);

  useEffect(() => {
    if (currentTab === 'totalPayments') {
      fetchMonthlyPayments();
      fetchYearlyPayments();
    }
  }, [currentTab]);

  const handleTabClick = (tab) => {
    setCurrentTab(tab);
    setError('');
  };

  const calculateTotal = (payments) => {
    if (!Array.isArray(payments)) return 0;
    return payments.reduce((sum, payment) => sum + parseFloat(payment.amount || 0), 0);
  };
  

  const todaysTotal = calculateTotal(todaysPayments);
  const monthlyTotal = calculateTotal(monthlyPayments);
  const yearlyTotal = calculateTotal(yearlyPayments);

  const commissionRate = 20;
  const totalCommission = totalPatients * commissionRate;

  const handleDownloadReport = () => {
    if (!downloadUrl) {
      generateReport();
      return;
    }
    
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.setAttribute('download', `billing_report_${new Date().toISOString().split('T')[0]}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <div className="bl-container">
      <div className="bl-header">
        <h1 className="bl-heading">
          <FiDollarSign /> Accounts Dashboard
        </h1>
        <button 
          className="bl-download-button"
          onClick={handleDownloadReport}
          disabled={isLoading}
        >
          <FiDownload /> {isLoading ? 'Generating...' : 'Download Report'}
        </button>
      </div>

      {error && (
        <div className="bl-error-message">
          {error}
          <button onClick={() => setError('')} className="bl-error-close">
            ×
          </button>
        </div>
      )}

      <div className="bl-tab-navigation">
        <button
          className={`bl-tab-button ${currentTab === 'todaysPayments' ? 'active' : ''}`}
          onClick={() => handleTabClick('todaysPayments')}
        >
          <FiCalendar /> Today's Payments
        </button>
        <button
          className={`bl-tab-button ${currentTab === 'totalPayments' ? 'active' : ''}`}
          onClick={() => handleTabClick('totalPayments')}
        >
          <FiPieChart /> Payment Analytics
        </button>
        <button
          className={`bl-tab-button ${currentTab === 'wallet' ? 'active' : ''}`}
          onClick={() => handleTabClick('wallet')}
        >
          <FiCreditCard /> Wallet & Commission
        </button>
      </div>

      <div className="bl-content">
        {currentTab === 'todaysPayments' && (
          <div className="bl-todays-payments">
            <h2 className="bl-section-title">
              Today's Payment Transactions
              <span className="bl-total-amount">Total: ₹{todaysTotal.toFixed(2)}</span>
            </h2>
            
            {isLoading ? (
              <div className="bl-loading">Loading data...</div>
            ) : todaysPayments.length > 0 ? (
              <div className="bl-table-container">
                <table className="bl-table">
                  <thead>
                    <tr>
                      <th>Patient ID</th>
                      <th>Name</th>
                      <th>Phone</th>
                      <th>Amount (₹)</th>
                      <th>Payment Method</th>
                    </tr>
                  </thead>
                  <tbody>
                    {todaysPayments.map((payment, index) => (
                      <tr key={index}>
                        <td>{index + 1}</td>
                        <td>{payment.first_name} {payment.last_name}</td>
                        <td>{payment.phone}</td>
                        <td>{payment.amount}</td>
                        <td>{payment.paymentType || 'Cash'}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td colSpan="3" className="bl-table-footer">Total</td>
                      <td>₹{todaysTotal.toFixed(2)}</td>
                      <td></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            ) : (
              <div className="bl-empty-state">No payments recorded today</div>
            )}
          </div>
        )}

        {currentTab === 'totalPayments' && (
          <div className="bl-payment-analytics">
            <div className="bl-analytics-grid">
              <div className="bl-analytics-card">
                <h3 className="bl-card-title">Monthly Payments</h3>
                <div className="bl-table-container">
                  <table className="bl-table">
                    <thead>
                      <tr>
                        <th>Month</th>
                        <th>Amount (₹)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {monthlyPayments.map((payment, index) => (
                        <tr key={`month-${index}`}>
                          <td>{payment.month}</td>
                          <td>{payment.amount}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr>
                        <td className="bl-table-footer">Total</td>
                        <td>₹{monthlyTotal.toFixed(2)}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              <div className="bl-analytics-card">
                <h3 className="bl-card-title">Yearly Payments</h3>
                <div className="bl-table-container">
                  <table className="bl-table">
                    <thead>
                      <tr>
                        <th>Year</th>
                        <th>Amount (₹)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {yearlyPayments.map((payment, index) => (
                        <tr key={`year-${index}`}>
                          <td>{payment.year}</td>
                          <td>{payment.amount}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr>
                        <td className="bl-table-footer">Total</td>
                        <td>₹{yearlyTotal.toFixed(2)}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {currentTab === 'wallet' && (
          <div className="bl-wallet-section">
            <h2 className="bl-section-title">Wallet & Commission</h2>
            
            <div className="bl-wallet-cards">
              <div className="bl-wallet-card">
                <h3 className="bl-card-title">Patient Statistics</h3>
                <div className="bl-wallet-stats">
                  <div className="bl-stat-item">
                    <span className="bl-stat-label">Total Patients:</span>
                    <span className="bl-stat-value">{totalPatients}</span>
                  </div>
                </div>
              </div>

              <div className="bl-wallet-card accent">
                <h3 className="bl-card-title">Commission Details</h3>
                <div className="bl-wallet-stats">
                  <div className="bl-stat-item">
                    <span className="bl-stat-label">Rate per Patient:</span>
                    <span className="bl-stat-value">₹{commissionRate}</span>
                  </div>
                  <div className="bl-stat-item">
                    <span className="bl-stat-label">Total Commission:</span>
                    <span className="bl-stat-value">₹{totalCommission}</span>
                  </div>
                </div>
                <button 
                  className="bl-pay-button"
                  disabled={totalCommission <= 0 || isLoading}
                >
                  Pay Commission
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Billing;