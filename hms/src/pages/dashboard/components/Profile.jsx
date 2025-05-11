import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaEdit, FaArrowRight, FaTimes } from "react-icons/fa";

import "./Profile.css";
import api from "../../../services/api";

const Profile = () => {
  const [activeTab, setActiveTab] = useState("details");
  const [profileData, setProfileData] = useState({
    username: "",
    hospital_name: "",
    email: "",
    phone_number: "",
    address: "",
    aboutHospital: "",
    profile_photo: null,
    profile_photo_preview: null,
    hospitalImages: [],
    hospitalImagePreviews: []
  });
  
  const [editMode, setEditMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [showLabTab, setShowLabTab] = useState(true);
  const [showPharmacyTab, setShowPharmacyTab] = useState(true);
  const [userId,setUserId] = useState(null)

  const doctorData = async () => {
    const res = await api.get('api/doctor-payment/')
    // console.log('doctor-payment : ',res);
  }

  useEffect(() => {
     doctorData();
    const fetchProfileData = async () => {
      try {
        setIsLoading(true);
        const response = await api.get(`/api/user-details/`);
        const data = response.data[0];   
        setUserId(data.id)
        setProfileData({
          id:data.id,
          username: data.username || "",
          hospital_name: data.hospital_name || "",
          email: data.email || "",
          phone_number: data.phone_number || "",
          address: data.address || "",
          aboutHospital: data.aboutHospital || "",
          profile_photo: data.profile_photo || null,
          hospitalImages: Array.isArray(data.hospitalImages) ? data.hospitalImages : []
        });
        setShowLabTab(data.showLabTab || true);
        setShowPharmacyTab(data.showPharmacyTab || true);
      } catch (err) {
        setError("Failed to load profile data");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfileData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({ ...prev, [name]: value }));
  };


  const handleImageUpload = (e, field) => {
    const files = Array.from(e.target.files);
  
    if (field === "profile_photo") {
      const file = files[0];
      if (file) {
        setProfileData(prev => ({
          ...prev,
          profile_photo: file,
          profile_photo_preview: URL.createObjectURL(file),
        }));
      }
    } else if (field === "hospitalImages") {
      const totalImages = profileData.hospitalImages.length + files.length;
      if (totalImages > 4) {
        setError("Maximum 4 hospital images are allowed.");
        return;
      }
  
      const updatedFiles = [...profileData.hospitalImages];
      const previews = [];
  
      files.forEach((file) => {
        updatedFiles.push(file);
        previews.push(URL.createObjectURL(file));
      });
  
      setProfileData(prev => ({
        ...prev,
        hospitalImages: updatedFiles,
        hospitalImagePreviews: [...(prev.hospitalImagePreviews || []), ...previews],
      }));
    }
  };
  


  const removeHospitalImage = (index) => {
    setProfileData(prev => ({
      ...prev,
      hospitalImages: prev.hospitalImages.filter((_, i) => i !== index)
    }));
  };

  const handleTabToggle = async (tabType, value) => {
    try {
      await axios.post(`${API_URL}/api/update-tab-settings`, {
        tabType,
        value
      });
      if (tabType === "lab") setShowLabTab(value);
      if (tabType === "pharmacy") setShowPharmacyTab(value);
    } catch (err) {
      console.error(`Error updating ${tabType} tab:`, err);
      setError(`Failed to update ${tabType} tab setting`);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      const formData = new FormData();
  
      Object.entries(profileData).forEach(([key, value]) => {
        if (
          key !== "hospitalImages" &&
          key !== "profile_photo" &&
          key !== "profile_photo_preview" &&
          key !== "hospitalImagePreviews"
        ) {
          formData.append(key, value);
        }
      });
  
      // ✅ Only append profile_photo if it's a real file
      if (profileData.profile_photo instanceof File) {
        formData.append("profile_photo", profileData.profile_photo);
      }
  
      // ✅ Upload hospitalImages if they are files
      profileData.hospitalImages.forEach((file) => {
        if (file instanceof File) {
          formData.append("hospital_images", file);
        }
      });
  
      const res = await api.put(`/api/user-details/${userId}/`, formData);
      // console.log(res);
      setEditMode(false);
    } catch (err) {
      console.error(err);
      setError("Failed to update profile");
    } finally {
      setIsLoading(false);
    }
  };
  
  
  

  const renderDetailsView = () => (
    <div className="pf-details-view">
      <div className="pf-profile-header">
        {profileData.profile_photo && (
          <img 
            src={profileData.profile_photo} 
            alt="Profile" 
            className="pf-profile-photo"
          />
        )}
        <div>
          <h2 className="pf-name">{profileData.username}</h2>
          <p className="pf-hospital">{profileData.hospital_name}</p>
        </div>
      </div>
      
      <div className="pf-details-grid">
        <div className="pf-detail-item">
          <span className="pf-detail-label">Email:</span>
          <span className="pf-detail-value">{profileData.email}</span>
        </div>
        <div className="pf-detail-item">
          <span className="pf-detail-label">Phone:</span>
          <span className="pf-detail-value">{profileData.phone_number}</span>
        </div>
        <div className="pf-detail-item">
          <span className="pf-detail-label">Address:</span>
          <span className="pf-detail-value">{profileData.address}</span>
        </div>
        <div className="pf-detail-item full-width">
          <span className="pf-detail-label">About Hospital:</span>
          <p className="pf-detail-value">{profileData.aboutHospital}</p>
        </div>
      </div>

      {profileData.hospitalImages.length > 0 && (
        <div className="pf-hospital-images">
          <h3 className="pf-section-title">Hospital Images</h3>
          <div className="pf-images-grid">
            {profileData.hospitalImages.map((img, index) => (
              <div key={index} className="pf-image-container">
                <img src={img} alt={`Hospital ${index}`} className="pf-image" />
              </div>
            ))}
          </div>
        </div>
      )}

      <button 
        className="pf-edit-button"
        onClick={() => setEditMode(true)}
      >
        <FaEdit /> Edit Profile
      </button>
    </div>
  );

  const renderEditForm = () => (
    <form className="pf-edit-form" onSubmit={handleSubmit} encType="multipart/form-data" >
      <div className="pf-form-section">
        <h3 className="pf-section-title">Personal Information</h3>
       
        <div className="pf-form-group">
          <label className="pf-form-label">User Name</label>
          <input
            type="text"
            name="username"
            value={profileData.username}
            onChange={handleInputChange}
            className="pf-form-input"
          />
        </div>
        <div className="pf-form-group">
          <label className="pf-form-label">Hospital Name</label>
          <input
            type="text"
            name="hospital_name"
            value={profileData.hospital_name}
            onChange={handleInputChange}
            className="pf-form-input"
          />
        </div>
      </div>

      <div className="pf-form-section">
        <h3 className="pf-section-title">Contact Information</h3>
        <div className="pf-form-group">
          <label className="pf-form-label">Email</label>
          <input
            type="email"
            name="email"
            value={profileData.email}
            onChange={handleInputChange}
            className="pf-form-input"
          />
        </div>
        <div className="pf-form-group">
          <label className="pf-form-label">Phone</label>
          <input
            type="text"
            name="phone_number"
            value={profileData.phone_number}
            onChange={handleInputChange}
            className="pf-form-input"
          />
        </div>
        <div className="pf-form-group">
          <label className="pf-form-label">Address</label>
          <input
            type="text"
            name="address"
            value={profileData.address}
            onChange={handleInputChange}
            className="pf-form-input"
          />
        </div>
      </div>

      <div className="pf-form-section">
        <h3 className="pf-section-title">Hospital Details</h3>
        <div className="pf-form-group">
          <label className="pf-form-label">About Hospital</label>
          <textarea
            name="aboutHospital"
            value={profileData.aboutHospital}
            onChange={handleInputChange}
            className="pf-form-textarea"
            rows="4"
          />
        </div>
        <div className="pf-form-group">
          <label className="pf-form-label">Profile Photo</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => handleImageUpload(e, "profile_photo")}
            className="pf-form-file"
          />
        </div>
        <div className="pf-form-group">
          <label className="pf-form-label">Hospital Images (Max 4)</label>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => handleImageUpload(e, "hospitalImages")}
            className="pf-form-file"
          />
          <div className="pf-images-preview">
            {profileData.hospitalImages.map((img, index) => (
              <div key={index} className="pf-image-preview">
                <img src={img} alt={`Preview ${index}`} />
                <button 
                  type="button" 
                  className="pf-remove-image"
                  onClick={() => removeHospitalImage(index)}
                >
                  <FaTimes />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="pf-form-section">
        <h3 className="pf-section-title">Tab Settings</h3>
        <div className="pf-toggle-group">
          <label className="pf-toggle-label">
            <input
              type="checkbox"
              checked={showLabTab}
              onChange={(e) => handleTabToggle("lab", e.target.checked)}
              className="pf-toggle-input"
            />
            <span className="pf-toggle-slider"></span>
            Show Lab Tab
          </label>
        </div>
        <div className="pf-toggle-group">
          <label className="pf-toggle-label">
            <input
              type="checkbox"
              checked={showPharmacyTab}
              onChange={(e) => handleTabToggle("pharmacy", e.target.checked)}
              className="pf-toggle-input"
            />
            <span className="pf-toggle-slider"></span>
            Show Pharmacy Tab
          </label>
        </div>
      </div>

      <div className="pf-form-actions">
        <button 
          type="button" 
          className="pf-cancel-button"
          onClick={() => setEditMode(false)}
        >
          Cancel
        </button>
        <button 
          type="submit" 
          className="pf-save-button"
          disabled={isLoading}
        >
          {isLoading ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </form>
  );

  return (
    <div className="pf-container">
      <div className="pf-header">
        <h1 className="pf-title">Hospital Profile</h1>
        <a href="/HospitalProfile" className="pf-view-link">
          View Public Profile <FaArrowRight />
        </a>
      </div>

      {error && (
        <div className="pf-error-message">
          {error}
          <button onClick={() => setError("")} className="pf-error-close">
            ×
          </button>
        </div>
      )}

      <div className="pf-content">
        {editMode ? renderEditForm() : renderDetailsView()}
      </div>
    </div>
  );
};

export default Profile;