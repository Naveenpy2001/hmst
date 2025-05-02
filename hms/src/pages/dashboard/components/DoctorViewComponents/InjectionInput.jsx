import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import axios from 'axios';

const InjectionInput = forwardRef((_, ref) => {
  const [injectionRequired, setInjectionRequired] = useState(false);
  const [injectionDetails, setInjectionDetails] = useState({
    name: '',
    size: '',
    dosage: '',
  });
  const [injectionOptions, setInjectionOptions] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchInjectionOptions();
  }, []);

  useImperativeHandle(ref, () => ({
    getInjectionData: () => (injectionRequired ? injectionDetails : null),
  }));

  const fetchInjectionOptions = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/injections');
      setInjectionOptions(response.data);
    } catch (error) {
      console.error('Error fetching injections:', error);
    }
  };


  const filteredOptions = injectionOptions.filter(option =>
    option.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="injection-section">
      <h3>Injections</h3>
      <div className="form-group radio-group">
        <label>
          <input
            type="radio"
            checked={!injectionRequired}
            onChange={() => setInjectionRequired(false)}
            value='No'
          />
          Not Required
        </label>
        <label>
          <input
            type="radio"
            checked={injectionRequired}
            onChange={() => setInjectionRequired(true)}
            value='Yes'
          />
          Required
        </label>
      </div>

      {injectionRequired && (
        <>
          <div className="form-group">
            <label>Injection Name</label>
            <div className="autocomplete">
              <input
                type="text"
                value={injectionDetails.name}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  handleChange('name', e.target.value);
                }}
                placeholder="Search injection..."
              />
              {searchTerm && injectionDetails.name === searchTerm && (
                <div className="autocomplete-dropdown">
                  {filteredOptions.map((option) => (
                    <div
                      key={option.id}
                      className="dropdown-item"
                      onClick={() => {
                        handleChange('name', option.name);
                        handleChange('size', option.size);
                        handleChange('dosage', option.dosage);
                        setSearchTerm('');
                      }}
                    >
                      {option.name} ({option.size}, {option.dosage})
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {injectionDetails.name === 'Other' && (
            <div className="form-group">
              <label>Custom Injection Name</label>
              <input
                type="text"
                value={injectionDetails.customName}
                onChange={(e) => handleChange('customName', e.target.value)}
              />
            </div>
          )}

          <div className="form-group">
            <label>Size</label>
            <select
              value={injectionDetails.size}
              onChange={(e) => handleChange('size', e.target.value)}
            >
              <option value="">Select Size</option>
              <option value="small">Small</option>
              <option value="medium">Medium</option>
              <option value="large">Large</option>
            </select>
          </div>

          <div className="form-group">
            <label>Dosage</label>
            <input
              type="text"
              value={injectionDetails.dosage}
              onChange={(e) => handleChange('dosage', e.target.value)}
              placeholder="e.g., 1mg daily"
            />
          </div>
        </>
      )}
    </div>
  );
});

export default InjectionInput;
