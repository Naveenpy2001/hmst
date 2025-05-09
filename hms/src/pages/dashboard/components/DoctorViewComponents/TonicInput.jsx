import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import axios from 'axios';

const TonicInput = forwardRef((_, ref) => {
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

  useImperativeHandle(ref, () => ({
    getTonicData: () => (tonicRequired ? tonicDetails : 'not required'),
  }));

  const fetchTonicOptions = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/tonics');
      setTonicOptions(response.data);
    } catch (error) {
      console.error('Error fetching tonics:', error);
      // Fallback data with 20+ common Indian tonics/syrups
      setTonicOptions([
        { id: 1, name: 'Liv-52', dosage: '2 tsp twice daily' },
        { id: 2, name: 'Chyawanprash', dosage: '1 tbsp in morning' },
        { id: 3, name: 'Zincovit', dosage: '5ml once daily' },
        { id: 4, name: 'Becosules', dosage: '1 tsp twice daily' },
        { id: 5, name: 'Revital', dosage: '10ml once daily' },
        { id: 6, name: 'Himalaya Septilin', dosage: '2 tsp twice daily' },
        { id: 7, name: 'Dabur Honitus', dosage: '1 tsp as needed' },
        { id: 8, name: 'Benadryl', dosage: '5ml every 4-6 hours' },
        { id: 9, name: 'Grilinctus', dosage: '5ml three times daily' },
        { id: 10, name: 'Zincovit', dosage: '5ml once daily' },
        { id: 11, name: 'Polybion', dosage: '5ml once daily' },
        { id: 12, name: 'Neurobion Forte', dosage: '5ml once daily' },
        { id: 13, name: 'Feronia', dosage: '5ml twice daily' },
        { id: 14, name: 'Hematogen', dosage: '10ml twice daily' },
        { id: 15, name: 'Dexorange', dosage: '5ml after meals' },
        { id: 16, name: 'Tonoferon', dosage: '5ml twice daily' },
        { id: 17, name: 'Becadexamin', dosage: '5ml once daily' },
        { id: 18, name: 'Shelcal', dosage: '5ml twice daily' },
        { id: 19, name: 'Calcimax', dosage: '5ml once daily' },
        { id: 20, name: 'Dolo-650', dosage: '5ml as needed' },
        { id: 21, name: 'Crocin', dosage: '5ml every 4-6 hours' },
        { id: 22, name: 'Other', dosage: '' },
      ]);
    }
  };

  const handleChange = (field, value) => {
    const updatedDetails = { ...tonicDetails, [field]: value };
    setTonicDetails(updatedDetails);
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
            onChange={() => {
              setTonicRequired(false);
              setTonicDetails({
                name: '',
                dosage: '',
                customName: ''
              });
            }}
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
                value={searchTerm || tonicDetails.name}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  handleChange('name', e.target.value);
                }}
                placeholder="Search tonic..."
              />
              {searchTerm && (
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
                placeholder="Enter custom tonic name"
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
              required={tonicRequired}
            />
          </div>
        </>
      )}
    </div>
  );
});

export default TonicInput;