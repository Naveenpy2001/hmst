import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import axios from 'axios';

const TestInput = forwardRef((_, ref) => {
  const [testRequired, setTestRequired] = useState(false);
  const [selectedTest, setSelectedTest] = useState('');
  const [customTest, setCustomTest] = useState('');
  const [testOptions, setTestOptions] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);

  useEffect(() => {
    fetchTestOptions();
  }, []);

  useImperativeHandle(ref, () => ({
    getTestData: () => {
      if (!testRequired) return 'not required';
      if (selectedTest === 'Other') {
        if (!customTest.trim()) return 'invalid';
        return customTest;
      }
      return selectedTest || 'invalid';
    },
    validate: () => {
      if (!testRequired) return true;
      if (!selectedTest) return false;
      if (selectedTest === 'Other' && !customTest.trim()) return false;
      return true;
    }
  }));

  const fetchTestOptions = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/tests');
      setTestOptions([...response.data, { id: 'other', name: 'Other' }]);
    } catch (error) {
      console.error('Error fetching tests:', error);
      setTestOptions([
        { id: 1, name: 'Complete Blood Count (CBC)' },
        { id: 2, name: 'Blood Glucose (Fasting)' },
        { id: 3, name: 'Blood Glucose (Postprandial)' },
        { id: 4, name: 'HbA1c (Glycated Hemoglobin)' },
        { id: 5, name: 'Lipid Profile' },
        { id: 6, name: 'Liver Function Test (LFT)' },
        { id: 7, name: 'Kidney Function Test (KFT)' },
        { id: 8, name: 'Thyroid Profile (T3, T4, TSH)' },
        { id: 9, name: 'Urine Routine Examination' },
        { id: 10, name: 'ESR (Erythrocyte Sedimentation Rate)' },
        { id: 11, name: 'CRP (C-Reactive Protein)' },
        { id: 12, name: 'Vitamin D (25-OH)' },
        { id: 13, name: 'Vitamin B12' },
        { id: 14, name: 'Serum Electrolytes (Na, K, Cl)' },
        { id: 15, name: 'Serum Calcium' },
        { id: 16, name: 'Serum Uric Acid' },
        { id: 17, name: 'PSA (Prostate Specific Antigen)' },
        { id: 18, name: 'HIV Screening' },
        { id: 19, name: 'HBsAg (Hepatitis B)' },
        { id: 20, name: 'Anti-HCV (Hepatitis C)' },
        { id: 21, name: 'Dengue NS1 Antigen' },
        { id: 22, name: 'Malaria Parasite (MP)' },
        { id: 23, name: 'Widal Test (Typhoid)' },
        { id: 24, name: 'RA Factor (Rheumatoid Arthritis)' },
        { id: 25, name: 'ANA (Antinuclear Antibody)' },
        { id: 26, name: 'D-Dimer' },
        { id: 27, name: 'Ferritin' },
        { id: 28, name: 'Iron Studies' },
        { id: 29, name: 'Stool Routine Examination' },
        { id: 30, name: 'Semen Analysis' },
        { id: 31, name: 'Pap Smear' },
        // ... (include all your test options)
        { id: 32, name: 'Other' }
      ]);
    }
  };

  const handleTestSelection = (testName) => {
    setSelectedTest(testName);
    if (testName === 'Other') {
      setSearchTerm('');
    } else {
      setSearchTerm(testName);
    }
    setIsDropdownOpen(false);
    setHasInteracted(true);
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    setIsDropdownOpen(true);
    setHasInteracted(true);
    
    // Clear selection if typing something different
    if (selectedTest && value !== selectedTest) {
      setSelectedTest('');
    }
  };

  const handleInputFocus = () => {
    setIsDropdownOpen(true);
    if (!selectedTest && searchTerm) {
      // Show relevant options when focusing on an empty input
      setIsDropdownOpen(true);
    }
  };

  const handleBlur = () => {
    setTimeout(() => setIsDropdownOpen(false), 200);
    
    // Auto-select if exact match found
    if (searchTerm && !selectedTest) {
      const exactMatch = testOptions.find(opt => 
        opt.name.toLowerCase() === searchTerm.toLowerCase()
      );
      if (exactMatch) {
        handleTestSelection(exactMatch.name);
      }
    }
  };

  const filteredOptions = testOptions.filter(option =>
    option.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const showValidationError = hasInteracted && testRequired && !selectedTest;

  return (
    <div className="test-section">
      <h3>Lab Tests</h3>
      <div className="form-group radio-group">
        <label>
          <input
            type="radio"
            checked={!testRequired}
            onChange={() => {
              setTestRequired(false);
              setSelectedTest('');
              setCustomTest('');
              setSearchTerm('');
              setHasInteracted(false);
            }}
          />
          Not Required
        </label>
        <label>
          <input
            type="radio"
            checked={testRequired}
            onChange={() => {
              setTestRequired(true);
              setHasInteracted(true);
            }}
          />
          Required
        </label>
      </div>

      {testRequired && (
        <>
          <div className="form-group">
            <label>Select Test</label>
            <div className="autocomplete">
              <input
                type="text"
                value={searchTerm}
                onChange={handleInputChange}
                onFocus={handleInputFocus}
                onBlur={handleBlur}
                placeholder="Search test..."
                className={showValidationError ? 'invalid' : selectedTest ? 'valid' : ''}
              />
              {isDropdownOpen && (
                <div className="autocomplete-dropdown">
                  {filteredOptions.length > 0 ? (
                    filteredOptions.map((option) => (
                      <div
                        key={option.id}
                        className="dropdown-item"
                        onMouseDown={(e) => e.preventDefault()} // Prevent blur before click
                        onClick={() => handleTestSelection(option.name)}
                      >
                        {option.name}
                      </div>
                    ))
                  ) : (
                    <div className="dropdown-item no-results">
                      No matching tests found
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {selectedTest === 'Other' && (
            <div className="form-group">
              <label>Custom Test Name</label>
              <input
                type="text"
                value={customTest}
                onChange={(e) => setCustomTest(e.target.value)}
                placeholder="Enter test name"
                className={!customTest.trim() && hasInteracted ? 'invalid' : 'valid'}
              />
              {!customTest.trim() && hasInteracted && (
                <div className="validation-error">Please enter a test name</div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
});

export default TestInput;