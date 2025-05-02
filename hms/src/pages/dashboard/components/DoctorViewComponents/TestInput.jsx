import React, { useState, useEffect } from 'react';
import axios from 'axios';
// import './styles/TestInput.css';

const TestInput = ({ onTestChange }) => {
  const [testRequired, setTestRequired] = useState(false);
  const [selectedTest, setSelectedTest] = useState('');
  const [customTest, setCustomTest] = useState('');
  const [testOptions, setTestOptions] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchTestOptions();
  }, []);

  const fetchTestOptions = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/tests');
      setTestOptions(response.data);
    } catch (error) {
      console.error('Error fetching tests:', error);
    }
  };


  const handleTestChange = (value) => {
    setSelectedTest(value);
    if (onTestChange) {
      onTestChange(value === '' ? null : (value === 'Other' ? customTest : value));
    }
  };

  const filteredOptions = testOptions.filter(option =>
    option.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
              handleTestChange('');
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
              handleTestChange(testOptions[0]?.name || '');
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
                value={selectedTest === 'Other' ? '' : selectedTest}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  if (testOptions.some(opt => opt.name === e.target.value)) {
                    handleTestChange(e.target.value);
                  }
                }}
                placeholder="Search test..."
              />
              {searchTerm && selectedTest !== 'Other' && (
                <div className="autocomplete-dropdown">
                  {filteredOptions.map((option) => (
                    <div
                      key={option.id}
                      className="dropdown-item"
                      onClick={() => {
                        handleTestChange(option.name);
                        setSearchTerm('');
                      }}
                    >
                      {option.name}
                    </div>
                  ))}
                  <div
                    className="dropdown-item other-option"
                    onClick={() => {
                      handleTestChange('Other');
                      setSearchTerm('');
                    }}
                  >
                    Other (specify)
                  </div>
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
                onChange={(e) => {
                  setCustomTest(e.target.value);
                  handleTestChange('Other');
                }}
                placeholder="Enter test name"
              />
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default TestInput;