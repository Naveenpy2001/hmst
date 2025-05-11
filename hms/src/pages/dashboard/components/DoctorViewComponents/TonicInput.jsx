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
  const [showDropdown, setShowDropdown] = useState(false);

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
        { id: 10, name: 'Polybion', dosage: '5ml once daily' },
        { id: 11, name: 'Neurobion Forte', dosage: '5ml once daily' },
        { id: 12, name: 'Feronia', dosage: '5ml twice daily' },
        { id: 13, name: 'Hematogen', dosage: '10ml twice daily' },
        { id: 14, name: 'Dexorange', dosage: '5ml after meals' },
        { id: 15, name: 'Tonoferon', dosage: '5ml twice daily' },
        { id: 16, name: 'Becadexamin', dosage: '5ml once daily' },
        { id: 17, name: 'Shelcal', dosage: '5ml twice daily' },
        { id: 18, name: 'Calcimax', dosage: '5ml once daily' },
        { id: 19, name: 'Dolo-650', dosage: '5ml as needed' },
        { id: 20, name: 'Crocin', dosage: '5ml every 4-6 hours' },
      ]);
    }
  };

  const handleChange = (field, value) => {
    setTonicDetails((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSelectOption = (option) => {
    setTonicDetails({
      name: option.name,
      dosage: option.dosage,
      customName: '',
    });
    setSearchTerm('');
    setShowDropdown(false);
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
              setTonicDetails({ name: '', dosage: '', customName: '' });
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
            <div className="autocomplete" style={{ position: 'relative' }}>
              <input
                type="text"
                value={searchTerm || tonicDetails.name}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  handleChange('name', e.target.value);
                  setShowDropdown(true);
                }}
                onFocus={() => setShowDropdown(true)}
                placeholder="Search tonic..."
              />
              {showDropdown && searchTerm && (
                <div
                  className="autocomplete-dropdown"
                  style={{
                    position: 'absolute',
                    background: '#fff',
                    border: '1px solid #ccc',
                    width: '100%',
                    maxHeight: '150px',
                    overflowY: 'auto',
                    zIndex: 10,
                  }}
                >
                  {filteredOptions.length > 0 ? (
                    filteredOptions.map((option) => (
                      <div
                        key={option.id}
                        className="dropdown-item"
                        onClick={() => handleSelectOption(option)}
                        style={{
                          padding: '5px 10px',
                          cursor: 'pointer',
                        }}
                      >
                        {option.name} ({option.dosage})
                      </div>
                    ))
                  ) : (
                    <div style={{ padding: '5px 10px' }}>No matches</div>
                  )}
                </div>
              )}
            </div>
          </div>

   

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
