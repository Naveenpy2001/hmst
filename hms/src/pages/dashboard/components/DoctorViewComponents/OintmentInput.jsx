import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import axios from 'axios';

const OintmentInput = forwardRef((_, ref) => {
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

  useImperativeHandle(ref, () => ({
    getOintmentData: () => (ointmentRequired ? ointmentDetails : 'not required'),
  }));

  const fetchOintmentOptions = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/ointments');
      setOintmentOptions(response.data);
    } catch (error) {
      console.error('Error fetching ointments:', error);
      // Fallback data with 20+ common Indian ointments
      setOintmentOptions([
        { id: 1, name: 'Betamethasone', dosage: 'Apply twice daily' },
        { id: 2, name: 'Mupirocin', dosage: 'Apply 3 times daily' },
        { id: 3, name: 'Clobetasol', dosage: 'Apply once daily' },
        { id: 4, name: 'Neomycin', dosage: 'Apply 2-3 times daily' },
        { id: 5, name: 'Fusidic Acid', dosage: 'Apply 3 times daily' },
        { id: 6, name: 'Ketoconazole', dosage: 'Apply twice daily' },
        { id: 7, name: 'Clotrimazole', dosage: 'Apply 2-3 times daily' },
        { id: 8, name: 'Terbinafine', dosage: 'Apply once daily' },
        { id: 9, name: 'Hydrocortisone', dosage: 'Apply 1-2 times daily' },
        { id: 10, name: 'Silver Sulfadiazine', dosage: 'Apply once daily' },
        { id: 11, name: 'Povidone Iodine', dosage: 'Apply 2-3 times daily' },
        { id: 12, name: 'Gentamicin', dosage: 'Apply 3 times daily' },
        { id: 13, name: 'Tretinoin', dosage: 'Apply at bedtime' },
        { id: 14, name: 'Adapalene', dosage: 'Apply once daily' },
        { id: 15, name: 'Benzoyl Peroxide', dosage: 'Apply once daily' },
        { id: 16, name: 'Calamine', dosage: 'Apply as needed' },
        { id: 17, name: 'Zinc Oxide', dosage: 'Apply 2-3 times daily' },
        { id: 18, name: 'Salicylic Acid', dosage: 'Apply once daily' },
        { id: 19, name: 'Coal Tar', dosage: 'Apply 1-2 times daily' },
        { id: 20, name: 'Tacrolimus', dosage: 'Apply twice daily' },
        { id: 21, name: 'Pimecrolimus', dosage: 'Apply twice daily' },
        { id: 22, name: 'Other', dosage: '' },
      ]);
    }
  };

  const handleChange = (field, value) => {
    setOintmentDetails(prev => ({
      ...prev,
      [field]: value,
    }));
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
            onChange={() => {
              setOintmentRequired(false);
              setOintmentDetails({
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
                value={searchTerm || ointmentDetails.name}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  handleChange('name', e.target.value);
                }}
                placeholder="Search ointment..."
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

          {ointmentDetails.name === 'Other' && (
            <div className="form-group">
              <label>Custom Ointment Name</label>
              <input
                type="text"
                value={ointmentDetails.customName}
                onChange={(e) => handleChange('customName', e.target.value)}
                placeholder="Enter custom ointment name"
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
              required={ointmentRequired}
            />
          </div>
        </>
      )}
    </div>
  );
});

export default OintmentInput;