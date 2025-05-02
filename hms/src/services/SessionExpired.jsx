import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Session.css';

const SessionExpired = () => {
  const [showWarning, setShowWarning] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => setShowWarning(false), 10000);
    return () => clearTimeout(timer);
  }, []);

  if (!showWarning) return null;

  return (
    <div className="session-warning-container">
      <div className="session-warning-box">
        <span className="session-warning-text">
          ⚠️ Your session has expired. Please login again.
        </span>
        <div className="session-warning-actions">
          <button
            className="session-warning-button"
            onClick={() => navigate('/login')}
          >
            Login
          </button>
          <button
            className="session-close-button"
            onClick={() => setShowWarning(false)}
          >
            ✖
          </button>
        </div>
      </div>
    </div>
  );
};

export default SessionExpired;
