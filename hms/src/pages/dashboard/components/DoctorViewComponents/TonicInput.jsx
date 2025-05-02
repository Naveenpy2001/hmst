import React, { useState, useEffect } from 'react';
import axios from 'axios';
// import './styles/TonicInput.css';

const TonicInput = ({ onTonicChange }) => {
  const [tonicRequired, setTonicRequired] = useState(false);
  const [tonicDetails, setTonicDetails] = useState({
    name: '',
    dosage: '',
    customName: ''
  });
  const [tonicOptions, setTonicOptions] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchTonicOptions();
  }, []);

  const fetchTonicOptions = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/tonics');
      setTonicOptions(response.data);
    } catch (error) {
      console.error('Error fetching tonics:', error);
    }
  };


  const handleChange = (field, value) => {
    const updatedDetails = { ...tonicDetails, [field]: value };
    setTonicDetails(updatedDetails);
    if (onTonicChange) {
      onTonicChange(tonicRequired ? updatedDetails : null);
    }
  };

  const filteredOptions = tonicOptions.filter(option =>
    option.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="tonic-section">
      <h3>Tonics (Syrups)</h3>
      <div className="form-group radio-group">
        <label>
          <input
            type="radio"
            checked={!tonicRequired}
            onChange={() => setTonicRequired(false)}
          />
          Not Required
        </label>
        <label>
          <input
            type="radio"
            checked={tonicRequired}
            onChange={() => setTonicRequired(true)}
          />
          Required
        </label>
      </div>

      {tonicRequired && (
        <>


          <div className="form-group">
            <label>Tonic Name</label>
            <div className="autocomplete">
              <input
                type="text"
                value={tonicDetails.name}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  handleChange('name', e.target.value);
                }}
                placeholder="Search tonic..."
              />
              {searchTerm && tonicDetails.name === searchTerm && (
                <div className="autocomplete-dropdown">
                  {filteredOptions.map((option) => (
                    <div
                      key={option.id}
                      className="dropdown-item"
                      onClick={() => {
                        handleChange('name', option.name);
                        handleChange('dosage', option.dosage);
                        setSearchTerm('');
                      }}
                    >
                      {option.name} ({option.dosage})
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {tonicDetails.name === 'Other' && (
            <div className="form-group">
              <label>Custom Tonic Name</label>
              <input
                type="text"
                value={tonicDetails.customName}
                onChange={(e) => handleChange('customName', e.target.value)}
              />
            </div>
          )}

          <div className="form-group">
            <label>Dosage</label>
            <input
              type="text"
              value={tonicDetails.dosage}
              onChange={(e) => handleChange('dosage', e.target.value)}
              placeholder="e.g., 10ml twice daily"
            />
          </div>
        </>
      )}
    </div>
  );
};

export default TonicInput;