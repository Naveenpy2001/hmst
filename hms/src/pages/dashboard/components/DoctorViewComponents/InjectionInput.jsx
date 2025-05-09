import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import axios from 'axios';

const InjectionInput = forwardRef((_, ref) => {
  const [injectionRequired, setInjectionRequired] = useState(false);
  const [injectionDetails, setInjectionDetails] = useState({
    name: '',
    size: '',
    dosage: '',
    customName: '',
  });
  const [injectionOptions, setInjectionOptions] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchInjectionOptions();
  }, []);

  useImperativeHandle(ref, () => ({
    getInjectionData: () => (injectionRequired ? injectionDetails : 'not required'),
  }));

  const fetchInjectionOptions = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/injections');
      setInjectionOptions(response.data);
    } catch (error) {
      console.error('Error fetching injections:', error);
      // Enhanced fallback data with 30+ common Indian injections
      setInjectionOptions([
        { id: 1, name: 'Vitamin B12', size: 'medium', dosage: '1ml' },
        { id: 2, name: 'Insulin', size: 'small', dosage: '10 units' },
        { id: 3, name: 'Painkiller (Diclofenac)', size: 'large', dosage: '3ml' },
        { id: 4, name: 'Other', size: '', dosage: '' },
        { id: 5, name: 'Paracetamol', size: 'small', dosage: '2ml' },
        { id: 6, name: 'Tetanus Toxoid', size: 'small', dosage: '0.5ml' },
        { id: 7, name: 'Rabies Vaccine', size: 'small', dosage: '1ml' },
        { id: 8, name: 'Hepatitis B Vaccine', size: 'small', dosage: '1ml' },
        { id: 9, name: 'Iron Sucrose', size: 'large', dosage: '5ml' },
        { id: 10, name: 'Magnesium Sulfate', size: 'large', dosage: '10ml' },
        { id: 11, name: 'Dexamethasone', size: 'medium', dosage: '2ml' },
        { id: 12, name: 'Tramadol', size: 'medium', dosage: '2ml' },
        { id: 13, name: 'Pheniramine Maleate', size: 'small', dosage: '2ml' },
        { id: 14, name: 'Ondansetron', size: 'small', dosage: '2ml' },
        { id: 15, name: 'Metoclopramide', size: 'small', dosage: '2ml' },
        { id: 16, name: 'Atropine', size: 'small', dosage: '1ml' },
        { id: 17, name: 'Adrenaline', size: 'small', dosage: '1ml' },
        { id: 18, name: 'Lignocaine', size: 'small', dosage: '2ml' },
        { id: 19, name: 'Gentamicin', size: 'medium', dosage: '2ml' },
        { id: 20, name: 'Ceftriaxone', size: 'large', dosage: '1g' },
        { id: 21, name: 'Amikacin', size: 'medium', dosage: '500mg' },
        { id: 22, name: 'Cefotaxime', size: 'large', dosage: '1g' },
        { id: 23, name: 'Ampicillin', size: 'large', dosage: '500mg' },
        { id: 24, name: 'Clindamycin', size: 'medium', dosage: '300mg' },
        { id: 25, name: 'Doxycycline', size: 'medium', dosage: '100mg' },
        { id: 26, name: 'Oxytocin', size: 'small', dosage: '5 IU' },
        { id: 27, name: 'Methylergometrine', size: 'small', dosage: '0.2mg' },
        { id: 28, name: 'Furosemide', size: 'small', dosage: '2ml' },
        { id: 29, name: 'Diazepam', size: 'small', dosage: '2ml' },
        { id: 30, name: 'Phenytoin', size: 'medium', dosage: '100mg' },
        { id: 31, name: 'Methylprednisolone', size: 'medium', dosage: '40mg' },
        { id: 32, name: 'Hydrocortisone', size: 'medium', dosage: '100mg' },
        { id: 33, name: 'Tetanus Immunoglobulin', size: 'large', dosage: '250 IU' },
        { id: 34, name: 'Anti Snake Venom', size: 'large', dosage: '10ml' },
        { id: 35, name: 'Anti Rabies Serum', size: 'large', dosage: '5ml' },
        { id: 36, name: 'Vitamin K', size: 'small', dosage: '1ml' },
        { id: 37, name: 'Calcium Gluconate', size: 'large', dosage: '10ml' },
        { id: 38, name: 'Dextrose', size: 'large', dosage: '25ml' },
        { id: 39, name: 'Normal Saline', size: 'large', dosage: '100ml' },
        { id: 40, name: 'Ringer Lactate', size: 'large', dosage: '100ml' },
      ]);
    }
  };

  const handleChange = (field, value) => {
    setInjectionDetails(prev => ({
      ...prev,
      [field]: value,
    }));
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
            onChange={() => {
              setInjectionRequired(false);
              setInjectionDetails({
                name: '',
                size: '',
                dosage: '',
                customName: '',
              });
            }}
            value="No"
          />
          Not Required
        </label>
        <label>
          <input
            type="radio"
            checked={injectionRequired}
            onChange={() => setInjectionRequired(true)}
            value="Yes"
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
                value={searchTerm || injectionDetails.name}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  handleChange('name', e.target.value);
                }}
                placeholder="Search injection..."
              />
              {searchTerm && (
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
                placeholder="Enter custom injection name"
              />
            </div>
          )}

          <div className="form-group">
            <label>Size</label>
            <select
              value={injectionDetails.size}
              onChange={(e) => handleChange('size', e.target.value)}
              required={injectionRequired}
            >
              <option value="">Select Size</option>
              <option value="small">Small (1-2ml)</option>
              <option value="medium">Medium (2-5ml)</option>
              <option value="large">Large (5ml+)</option>
            </select>
          </div>

          <div className="form-group">
            <label>Dosage</label>
            <input
              type="text"
              value={injectionDetails.dosage}
              onChange={(e) => handleChange('dosage', e.target.value)}
              placeholder="e.g., 1ml daily"
              required={injectionRequired}
            />
          </div>
        </>
      )}
    </div>
  );
});

export default InjectionInput;