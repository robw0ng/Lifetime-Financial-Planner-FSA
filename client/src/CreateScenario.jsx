import { useState } from 'react';
import './CreateScenario.css';
import { useNavigate } from 'react-router-dom';

export default function CreateScenario() {
  const [formData, setFormData] = useState({
    name: '',
    isMarried: false,
    birthYear: '',
    birthYearSpouse: '',
    lifeExpectancy: '',
    lifeExpectancySpouse: '',
    inflationAssumption: '',
    preTaxContributionLimit: '',
    afterTaxContributionLimit: '',
    sharingSettings: '',
    financialGoal: '',
    stateOfResidence: '',
  });

  const navigate = useNavigate(); // Add useNavigate for redirection

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Initialize empty data structures
    const newScenario = {
      ...formData,
      investments: new Set(),
      events: new Set(),
      spendingStrategy: [],
      rmdStrategy: [],
      rothConversionStrategy: [],
      expenseWithdrawalStrategy: [],
    };

    console.log('Scenario Data:', newScenario);
    navigate('/scenarios');
    // TODO: Send data to API endpoint
    // send the data to the end point. get the newly created as the response. 
    // then use setSelectedScenario on the new obj

    // Reset the form
    setFormData({
      name: '',
      isMarried: false,
      birthYear: '',
      birthYearSpouse: '',
      lifeExpectancy: '',
      lifeExpectancySpouse: '',
      inflationAssumption: '',
      preTaxContributionLimit: '',
      afterTaxContributionLimit: '',
      sharingSettings: '',
      financialGoal: '',
      stateOfResidence: '',
    });
  };

  return (
    <main>
      <form onSubmit={handleSubmit} className="form-container">
        <h2>Create New Scenario</h2>

        <div className="form-group">
          <label>Name:</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Marital Status:</label>
          <input
            type="checkbox"
            name="isMarried"
            checked={formData.isMarried}
            onChange={handleChange}
          />
          Married
        </div>

        <div className="form-group">
          <label>Birth Year:</label>
          <input
            type="number"
            name="birthYear"
            value={formData.birthYear}
            onChange={handleChange}
          />
        </div>

        {formData.isMarried && (
          <>
            <div className="form-group">
              <label>Spouse Birth Year:</label>
              <input
                type="number"
                name="birthYearSpouse"
                value={formData.birthYearSpouse}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Spouse Life Expectancy:</label>
              <input
                type="number"
                name="lifeExpectancySpouse"
                value={formData.lifeExpectancySpouse}
                onChange={handleChange}
              />
            </div>
          </>
        )}

        <div className="form-group">
          <label>Life Expectancy:</label>
          <input
            type="number"
            name="lifeExpectancy"
            value={formData.lifeExpectancy}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>Inflation Assumption:</label>
          <input
            type="number"
            name="inflationAssumption"
            value={formData.inflationAssumption}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>Pre-Tax Contribution Limit:</label>
          <input
            type="number"
            name="preTaxContributionLimit"
            value={formData.preTaxContributionLimit}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>After-Tax Contribution Limit:</label>
          <input
            type="number"
            name="afterTaxContributionLimit"
            value={formData.afterTaxContributionLimit}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>Financial Goal:</label>
          <input
            type="number"
            name="financialGoal"
            value={formData.financialGoal}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>State of Residence:</label>
          <input
            type="text"
            name="stateOfResidence"
            value={formData.stateOfResidence}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>Sharing Settings:</label>
          <input
            type="text"
            name="sharingSettings"
            value={formData.sharingSettings}
            onChange={handleChange}
          />
        </div>

        <button type="submit" className="submit-btn">
          Create Scenario
        </button>
      </form>
    </main>
  );
}
