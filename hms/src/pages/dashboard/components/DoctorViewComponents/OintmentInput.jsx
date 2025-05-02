import React, { useState, useEffect,useImperativeHandle,forwardRef } from 'react';
import axios from 'axios';

const OintmentInput = forwardRef((props,ref)  => {
  const [ointmentRequired, setOintmentRequired] = useState(false);
  const [ointmentDetails, setOintmentDetails] = useState({
    name: '',
    dosage: '',
    customName: ''
  });
  const [ointmentOptions, setOintmentOptions] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchOintmentOptions();
  }, []);

  const fetchOintmentOptions = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/ointments');
      setOintmentOptions(response.data);
    } catch (error) {
      console.error('Error fetching ointments:', error);
    }
  };



  const filteredOptions = ointmentOptions.filter(option =>
    option.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="ointment-section">
      <h3>Ointments</h3>
      <div className="form-group radio-group">
        <label>
          <input
            type="radio"
            checked={!ointmentRequired}
            onChange={() => setOintmentRequired(false)}
          />
          Not Required
        </label>
        <label>
          <input
            type="radio"
            checked={ointmentRequired}
            onChange={() => setOintmentRequired(true)}
          />
          Required
        </label>
      </div>

      {ointmentRequired && (
        <>


          <div className="form-group">
            <label>Ointment Name</label>
            <div className="autocomplete">
              <input
                type="text"
                value={ointmentDetails.name}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  handleChange('name', e.target.value);
                }}
                placeholder="Search ointment..."
              />
              {searchTerm && ointmentDetails.name === searchTerm && (
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

          {ointmentDetails.name === 'Other' && (
            <div className="form-group">
              <label>Custom Ointment Name</label>
              <input
                type="text"
                value={ointmentDetails.customName}
                onChange={(e) => handleChange('customName', e.target.value)}
              />
            </div>
          )}

          <div className="form-group">
            <label>Dosage</label>
            <input
              type="text"
              value={ointmentDetails.dosage}
              onChange={(e) => handleChange('dosage', e.target.value)}
              placeholder="e.g., Apply twice daily"
            />
          </div>
        </>
      )}
    </div>
  );
});

export default OintmentInput;