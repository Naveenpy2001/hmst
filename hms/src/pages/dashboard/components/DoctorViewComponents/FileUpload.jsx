// src/components/FileUpload.jsx
import React, { useState } from 'react';
import './FileUpload.css'; // 👈 import CSS file
import api from '../../../../services/api';

const FileUpload = () => {
  const [file, setFile] = useState(null);
  const [category, setCategory] = useState('');
  const [message, setMessage] = useState('');

  const allowedTypes = [
    'text/csv',
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  ];

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];

    if (selectedFile) {
      if (!allowedTypes.includes(selectedFile.type)) {
        setMessage('Only CSV, PDF, or Excel files are allowed.');
        setFile(null);
      } else {
        setFile(selectedFile);
        setMessage('');
      }
    }
  };

  const handleCategoryChange = (e) => {
    setCategory(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file || !category) {
      setMessage('Please select a file and category.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('category', category);

    try {
      const token = localStorage.getItem('access_token'); // Assuming JWT stored here
      const response = await api.post('/api/upload/', formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log('Upload success:', response.data);
      setMessage('File uploaded successfully!');
      setFile(null);
      setCategory('');
    } catch (error) {
      console.error('Upload error:', error);
      setMessage('Failed to upload file.');
    }
  };

  return (
    <div className="upload-container">
      <h2>Upload File</h2>
      <form onSubmit={handleSubmit} className="upload-form">
        <div className="form-group">
          <label>Choose File (CSV, PDF, Excel)</label>
          <input
            type="file"
            accept=".csv, .pdf, .xlsx"
            onChange={handleFileChange}
            className="file-input"
          />
        </div>

        <div className="form-group">
          <label>Select Category</label>
          <select
            value={category}
            onChange={handleCategoryChange}
            className="select-input"
          >
            <option value="">Select Category</option>
            <option value="tablet">Tablet</option>
            <option value="injection">Injection</option>
            <option value="ointment">Ointment</option>
            <option value="syrup">Syrup</option>
            <option value="labtest">Lab Test</option>
          </select>
        </div>

        <button type="submit" className="submit-button">
          Upload
        </button>
      </form>

      {message && (
        <div className="message">
          {message}
        </div>
      )}
    </div>
  );
};

export default FileUpload;
