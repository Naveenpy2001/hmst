import React, { useState, useEffect } from "react";
import "./Dashboard.css";
import { FaBars, FaTimes, FaUserCircle } from "react-icons/fa";
import DashboardContent from "./components/DashboardContent";
import PatientRegistration from "./components/PatientRegistration";
import DoctorView from "./components/DoctorView";
// import MedicalTests from "./components/MedicalTests";
// import MedicalPrescription from "./components/MedicalPrescription";
import Billing from "./components/Billing";
// import HospitalData from "./components/HospitalData";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Lab from "./components/Lab";
import Pharmacy from "./components/Pharmacy";
import Profile from "./components/Profile";
// import HMS from "../media/HMS-Transparent.png";
import { MdArrowDropDown } from "react-icons/md";
import api from "../../services/api";
import {  FaHome, FaUserPlus, FaUserMd, FaFlask, FaPills, FaChartLine, FaMoneyBillAlt, FaUser, FaSignOutAlt } from "react-icons/fa";
import { BsFillTicketPerforatedFill } from "react-icons/bs";
import { MdLogout } from "react-icons/md";
import hmsLogo from '../../assets/hms2.png'
import PatientTracking from "./components/PatientTracking";
import TicketRaise from "./components/TicketRaise";


function Dashboard() {
  const [activeTab, setActiveTab] = useState("Dashboard");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [userData, setUserData] = useState({});
  const [isPaid, setIsPaid] = useState(true);
  const [showProfileDetails, setShowProfileDetails] = useState(false);
  const [isLabEnabled, setIsLabEnabled] = useState(true);
  const [isPharmacyEnabled, setIsPharmacyEnabled] = useState(true);

  const navigate = useNavigate();

  const UserDataFetch = async () => {
    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        navigate("/login");
        return;
      }
      
      const response = await api.get(`/api/user-details/`);
      setUserData(response.data[0]);
      // setIsPaid(response.data.isPaid || false);
      setIsLabEnabled(true);
      setIsPharmacyEnabled(true);
      
      // Store active tab in localStorage to persist on refresh
      const savedTab = localStorage.getItem('activeTab');
      if (savedTab) setActiveTab(savedTab);
    } catch (error) {
      console.log("Error fetching data: ", error);
      navigate("/login");
    }
  };

  useEffect(() => {
    UserDataFetch();
  }, []);

  useEffect(() => {
    localStorage.setItem('activeTab', activeTab);
  }, [activeTab]);

  const handleLogout = async () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem('refresh_token');
    navigate('/login')

  };

  const handlePayment = () => {
    const options = {
      key: "rzp_live_oRtGw5y3RbD9MH",
      amount: userData.dueAmount * 100,
      currency: "INR",
      name: "Hospital Payment",
      description: "Test Transaction",
      handler: async function (response) {
        try {
          await axios.post(`${API_URL}/api/payment/verify`, {
            paymentId: response.razorpay_payment_id,
          });
          setIsPaid(true);
        } catch (error) {
          console.error("Error verifying payment:", error);
        }
      },
      prefill: {
        name: userData.username,
        email: userData.email,
        contact: userData.contact,
      },
      theme: {
        color: "#3399cc",
      },
    };
    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  const renderContent = () => {
    if (!isPaid) {
      return (
        <div className="payment-prompt">
          <div className="payment-content">
            <h2>Payment Required</h2>
            <p>Please complete your payment to access all features</p>
            <p className="amount-due">Amount Due: ₹{userData.dueAmount || 0}</p>
            <button className="pay-button" onClick={handlePayment}>
              Pay Now
            </button>
          </div>
        </div>
      );
    }

    switch (activeTab) {
      case "Dashboard":
        return <DashboardContent setActiveTab={setActiveTab} />;
      case "PatientRegistration":
        return <PatientRegistration />;
      case "DoctorView":
        return <DoctorView />;
      case "MedicalTests":
        return <PatientTracking />;
      case "MedicalPrescription":
        return <MedicalPrescription />;
      case "Billing":
        return <Billing />;
      case "HospitalData":
        return <Profile />;
      case "Lab":
        return <Lab />;
      case "Pharmacy":
        return <Pharmacy />;
      case "TicketRaise":
        return <TicketRaise />;
      default:
        return <DashboardContent />;
    }
  };

  const toggleSidebar = () => {
    if (window.innerWidth <= 768) {
      setIsMobileSidebarOpen(!isMobileSidebarOpen);
    } else {
      setIsSidebarCollapsed(!isSidebarCollapsed);
    }
  };

  const handleTabChange = (tab) => {
    if (!isPaid && tab !== "Dashboard") {
      return;
    }
    setActiveTab(tab);
    if (window.innerWidth <= 768) {
      setIsMobileSidebarOpen(false);
    }
  };

  return (
    <div className="dashboard-container">
      {/* Mobile Header */}
      <div className="mobile-header">
        <button className="sidebar-toggle" onClick={toggleSidebar}>
          {isMobileSidebarOpen ? <FaTimes /> : <FaBars />}
        </button>
        <div className="hospital-info">
          {/* <span>Amma Hospital</span> */}
          <span className="hospital-name">{userData.hospital_name}</span>
        </div>
        <div className="profile-icon" onClick={() => setShowProfileDetails(!showProfileDetails)}>
          <FaUserCircle />
        </div>
      </div>

      {/* Sidebar */}
      <div className={`sidebar ${isSidebarCollapsed ? "collapsed" : ""} ${isMobileSidebarOpen ? "mobile-open" : ""}`}>
        <div className="sidebar-header">
          <div className="logo-container">
            <img src={hmsLogo} alt="HMS" className="logo" />
            {/* <span className="logo-name">HMS</span> */}
          </div>
          <button className="collapse-btn" onClick={toggleSidebar}>
            {isSidebarCollapsed ? <FaBars /> : <FaTimes />}
          </button>
        </div>

        <nav className="sidebar-nav">
          <button
            className={`nav-item ${activeTab === "Dashboard" ? "active" : ""}`}
            onClick={() => handleTabChange("Dashboard")}
          >
            <FaHome />
            <span className="nav-text">Dashboard</span>
          </button>

          <button
            className={`nav-item ${activeTab === "PatientRegistration" ? "active" : ""}`}
            onClick={() => handleTabChange("PatientRegistration")}
            disabled={!isPaid}
          >
            <FaUserPlus />
            <span className="nav-text">Patient Registration</span>
          </button>

          <button
            className={`nav-item ${activeTab === "DoctorView" ? "active" : ""}`}
            onClick={() => handleTabChange("DoctorView")}
            disabled={!isPaid}
          >
            <FaUserMd />
            <span className="nav-text">Doctor View</span>
          </button>

          {isLabEnabled && (
            <button
              className={`nav-item ${activeTab === "Lab" ? "active" : ""}`}
              onClick={() => handleTabChange("Lab")}
              disabled={!isPaid}
            >
              <FaFlask />
              <span className="nav-text">Lab</span>
            </button>
          )}

          {isPharmacyEnabled && (
            <button
              className={`nav-item ${activeTab === "Pharmacy" ? "active" : ""}`}
              onClick={() => handleTabChange("Pharmacy")}
              disabled={!isPaid}
            >
              <FaPills />
              <span className="nav-text">Pharmacy</span>
            </button>
          )}

          <button
            className={`nav-item ${activeTab === "MedicalTests" ? "active" : ""}`}
            onClick={() => handleTabChange("MedicalTests")}
            disabled={!isPaid}
          >
            <FaChartLine />
            <span className="nav-text">Patients Tracking</span>
          </button>

          <button
            className={`nav-item ${activeTab === "Billing" ? "active" : ""}`}
            onClick={() => handleTabChange("Billing")}
            disabled={!isPaid}
          >
            <FaMoneyBillAlt />
            <span className="nav-text">Billing</span>
          </button>

          <button
            className={`nav-item ${activeTab === "HospitalData" ? "active" : ""}`}
            onClick={() => handleTabChange("HospitalData")}
          >
            <FaUser />
            <span className="nav-text">Profile</span>
          </button>
        <button
            className={`nav-item ${activeTab === "TicketRaise" ? "active" : ""}`}
            onClick={() => handleTabChange("TicketRaise")}
            disabled={!isPaid}
          >
            <BsFillTicketPerforatedFill />
            <span className="nav-text">TicketRaise</span>
          </button>
        </nav>
        <div className="sidebar-footer">
          <div className="powered-by">Powered by TSAR-IT Pvt Ltd</div>
          <button className="logout-btn" onClick={handleLogout}>
          <MdLogout /> <span className="logout-text">Log out</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <main className={`main-content ${isSidebarCollapsed ? "collapsed" : ""}`}>
        <div className="top-bar">
          <div className="welcome-message">
            <h1>Welcome to {userData.hospital_name}</h1>
            <p>Dr. <b>{userData.username}</b></p>
          </div>
          <div className="profile-section">
            <div 
              className="profile-icon" 
              onClick={() => setShowProfileDetails(!showProfileDetails)}
            >
              {
              userData.profile_photo ? <img src={userData.profile_photo} className="profile-pic" width={30}/> : <FaUserCircle className="profile-pic" />
                }
              <span>{userData.username}</span>
              <MdArrowDropDown />
            </div>
            {showProfileDetails && (
              <div className="profile-dropdown">
                <div className="profile-info">
                  {
                    userData.profile_photo ? <img src={userData.profile_photo} className="profile-pic" width={30}/> : <FaUserCircle className="profile-pic" />
                  }
                  
                  <div>
                    <h4>{userData.username}</h4>
                    <p>{userData.email}</p>
                    <p>{userData.phone_number}</p>
                  </div>
                </div>
                <button 
                  className="profile-btn"
                  onClick={() => handleTabChange("HospitalData")}
                >
                  View Profile
                </button>
                <button className="logout-btn" onClick={handleLogout}>
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="content-area">
          {renderContent()}
        </div>
      </main>

      {/* Mobile Overlay */}
      {isMobileSidebarOpen && (
        <div className="mobile-overlay" onClick={() => setIsMobileSidebarOpen(false)}></div>
      )}
    </div>
  );
}

export default Dashboard;