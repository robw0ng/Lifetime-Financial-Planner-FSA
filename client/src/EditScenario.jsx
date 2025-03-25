import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './CreateScenario.css';
import { useData } from './DataContext';

export default function EditScenario() {
  const { id } = useParams(); // Get scenario ID from URL
  console.log(id);
  // scenarios list would be got from api call here
  // example scenarios list is  used
//   const { scenarios, fetchScenarios } = useData();

  const {scenarios, editScenario} = useData();
  const navigate = useNavigate();

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

  const scenarioToEdit = scenarios.find((scenario) => scenario.id === id);

  // Load existing scenario data into form
  useEffect(() => {
    console.log(scenarioToEdit);
    if (scenarioToEdit) {
      setFormData({
        name: scenarioToEdit.name,
        isMarried: scenarioToEdit.isMarried,
        birthYear: scenarioToEdit.birthYear || '',
        birthYearSpouse: scenarioToEdit.birthYearSpouse || '',
        lifeExpectancy: scenarioToEdit.lifeExpectancy || '',
        lifeExpectancySpouse: scenarioToEdit.lifeExpectancySpouse || '',
        inflationAssumption: scenarioToEdit.inflationAssumption || '',
        preTaxContributionLimit: scenarioToEdit.preTaxContributionLimit || '',
        afterTaxContributionLimit: scenarioToEdit.afterTaxContributionLimit || '',
        sharingSettings: scenarioToEdit.sharingSettings || '',
        financialGoal: scenarioToEdit.financialGoal || '',
        stateOfResidence: scenarioToEdit.stateOfResidence || '',
      });
    }
  }, [id, scenarios]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let editedScenario = scenarioToEdit;
      editedScenario = { ...editedScenario, ...formData };

      await editScenario(editedScenario);
      navigate('/scenarios');
    } catch (error) {
      console.error('Error updating scenario:', error);
    }
  };

  return (
    <main>
      <form onSubmit={handleSubmit} className="form-container">
        <h2>Edit Scenario</h2>

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
          Update Scenario
        </button>
      </form>
    </main>
  );
}
