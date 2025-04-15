import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useData } from './DataContext';
import { useSelected } from './SelectedContext';

export default function EditScenario() {
  const { id } = useParams(); // Get scenario ID from URL
  const { allScenarios, editScenario } = useData();
  const { setSelectedScenario } = useSelected();
  const navigate = useNavigate();

  // Define formData with all fields from CreateScenario.jsx
  const [formData, setFormData] = useState({
    name: '',
    is_married: false,
    birth_year: '',
    birth_year_spouse: '',
    life_expectancy_type: 'fixed',
    life_expectancy_value: '',
    life_expectancy_mean: '',
    life_expectancy_std_dev: '',
    spouse_life_expectancy_type: '',
    spouse_life_expectancy_value: '',
    spouse_life_expectancy_mean: '',
    spouse_life_expectancy_std_dev: '',
    inflation_assumption_type: 'fixed',
    inflation_assumption_value: '',
    inflation_assumption_mean: '',
    inflation_assumption_std_dev: '',
    inflation_assumption_upper: '',
    inflation_assumption_lower: '',
    after_tax_contribution_limit: '',
    is_roth_optimizer_enabled: false,
    roth_start_year: '',
    roth_end_year: '',
    financial_goal: '',
    state_of_residence: '',
    // sharing_settings: "",
  });

  const scenarioToEdit = allScenarios.find(
    (scenario) => Number(scenario.id) === Number(id)
  );

  // Load existing scenario data into form
  useEffect(() => {
    if (scenarioToEdit) {
      setFormData({
        name: scenarioToEdit.name,
        is_married: scenarioToEdit.is_married,
        birth_year: scenarioToEdit.birth_year || '',
        birth_year_spouse: scenarioToEdit.spouse_birth_year || '',
        life_expectancy_type: scenarioToEdit.life_expectancy_type || 'fixed',
        life_expectancy_value: scenarioToEdit.life_expectancy_value || '',
        life_expectancy_mean: scenarioToEdit.life_expectancy_mean || '',
        life_expectancy_std_dev: scenarioToEdit.life_expectancy_std_dev || '',
        spouse_life_expectancy_type: scenarioToEdit.spouse_life_expectancy_type || '',
        spouse_life_expectancy_value: scenarioToEdit.spouse_life_expectancy_value || '',
        spouse_life_expectancy_mean: scenarioToEdit.spouse_life_expectancy_mean || '',
        spouse_life_expectancy_std_dev: scenarioToEdit.spouse_life_expectancy_std_dev || '',
        inflation_assumption_type: scenarioToEdit.inflation_assumption_type || 'fixed',
        inflation_assumption_value: scenarioToEdit.inflation_assumption_value || '',
        inflation_assumption_mean: scenarioToEdit.inflation_assumption_mean || '',
        inflation_assumption_std_dev: scenarioToEdit.inflation_assumption_std_dev || '',
        inflation_assumption_upper: scenarioToEdit.inflation_assumption_upper || '',
        inflation_assumption_lower: scenarioToEdit.inflation_assumption_lower || '',
        after_tax_contribution_limit: scenarioToEdit.after_tax_contribution_limit || '',
        is_roth_optimizer_enabled: scenarioToEdit.is_roth_optimizer_enabled || false,
        roth_start_year: scenarioToEdit.roth_start_year || '',
        roth_end_year: scenarioToEdit.roth_end_year || '',
        financial_goal: scenarioToEdit.financial_goal || '',
        state_of_residence: scenarioToEdit.state_of_residence || '',
        // sharing_settings: scenarioToEdit.sharingSettings || "",
      });
    }
  }, [id, allScenarios]);

  // Handle changes in form inputs
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  // Handle form submission to update scenario
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // let editedScenario = { ...scenarioToEdit, ...formData };
      const sanitize = (val) => (val === '' ? null : Number(val));

      // fallback helper
      const get = (key) => formData[key] !== undefined ? formData[key] : scenarioToEdit[key];
      
      const editedScenario = {
        id: scenarioToEdit.id,
        name: get('name'),
        is_married: get('is_married'),
        birth_year: sanitize(get('birth_year')),
        spouse_birth_year: get('is_married') ? sanitize(get('birth_year_spouse')) : null,
      
        life_expectancy_type: get('life_expectancy_type'),
        life_expectancy_value: get('life_expectancy_type') === 'fixed' ? sanitize(get('life_expectancy_value')) : null,
        life_expectancy_mean: get('life_expectancy_type') === 'normal' ? sanitize(get('life_expectancy_mean')) : null,
        life_expectancy_std_dev: get('life_expectancy_type') === 'normal' ? sanitize(get('life_expectancy_std_dev')) : null,
      
        spouse_life_expectancy_type: get('is_married') ? get('spouse_life_expectancy_type') : null,
        spouse_life_expectancy_value:
          get('is_married') && get('spouse_life_expectancy_type') === 'fixed'
            ? sanitize(get('spouse_life_expectancy_value'))
            : null,
        spouse_life_expectancy_mean:
          get('is_married') && get('spouse_life_expectancy_type') === 'normal'
            ? sanitize(get('spouse_life_expectancy_mean'))
            : null,
        spouse_life_expectancy_std_dev:
          get('is_married') && get('spouse_life_expectancy_type') === 'normal'
            ? sanitize(get('spouse_life_expectancy_std_dev'))
            : null,
      
        inflation_assumption_type: get('inflation_assumption_type'),
        inflation_assumption_value:
          get('inflation_assumption_type') === 'fixed' ? sanitize(get('inflation_assumption_value')) : null,
        inflation_assumption_mean:
          get('inflation_assumption_type') === 'normal' ? sanitize(get('inflation_assumption_mean')) : null,
        inflation_assumption_std_dev:
          get('inflation_assumption_type') === 'normal' ? sanitize(get('inflation_assumption_std_dev')) : null,
        inflation_assumption_upper:
          get('inflation_assumption_type') === 'uniform' ? sanitize(get('inflation_assumption_upper')) : null,
        inflation_assumption_lower:
          get('inflation_assumption_type') === 'uniform' ? sanitize(get('inflation_assumption_lower')) : null,
      
        after_tax_contribution_limit: sanitize(get('after_tax_contribution_limit')),
        is_roth_optimizer_enabled: get('is_roth_optimizer_enabled'),
        roth_start_year: get('is_roth_optimizer_enabled') ? sanitize(get('roth_start_year')) : null,
        roth_end_year: get('is_roth_optimizer_enabled') ? sanitize(get('roth_end_year')) : null,
      
        financial_goal: sanitize(get('financial_goal')),
        state_of_residence: get('state_of_residence'),
      };
      
      const modifiedScenario = await editScenario(editedScenario);
      console.log('modifiedScenario', modifiedScenario);
      setSelectedScenario(modifiedScenario);
      navigate('/scenarios');
    } catch (error) {
      console.error('Error updating scenario:', error);
    }
  };

  return (
    <main>
      <form onSubmit={handleSubmit} className="form-container">
        <h2>Edit Scenario</h2>

        {/* Basic Information */}
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
            name="is_married"
            checked={formData.is_married}
            onChange={handleChange}
          />
          Married
        </div>

        <div className="form-group">
          <label>Birth Year:</label>
          <input
            type="number"
            name="birth_year"
            value={formData.birth_year}
            onChange={handleChange}
          />
        </div>

        {formData.is_married && (
          <div className="form-group">
            <label>Spouse Birth Year:</label>
            <input
              type="number"
              name="birth_year_spouse"
              value={formData.birth_year_spouse}
              onChange={handleChange}
            />
          </div>
        )}

        {/* Life Expectancy for User */}
        <div className="form-group">
          <label>Life Expectancy Type:</label>
          <select
            name="life_expectancy_type"
            value={formData.life_expectancy_type}
            onChange={handleChange}
          >
            <option value="fixed">Fixed</option>
            <option value="normal">Normal</option>
          </select>
        </div>

        {formData.life_expectancy_type === 'fixed' && (
          <div className="form-group">
            <label>Life Expectancy Value:</label>
            <input
              type="number"
              name="life_expectancy_value"
              value={formData.life_expectancy_value}
              onChange={handleChange}
            />
          </div>
        )}

        {formData.life_expectancy_type === 'normal' && (
          <>
            <div className="form-group">
              <label>Life Expectancy Mean:</label>
              <input
                type="number"
                name="life_expectancy_mean"
                value={formData.life_expectancy_mean}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label>Life Expectancy Std Dev:</label>
              <input
                type="number"
                name="life_expectancy_std_dev"
                value={formData.life_expectancy_std_dev}
                onChange={handleChange}
              />
            </div>
          </>
        )}

        {/* Inflation Assumption */}
        <div className="form-group">
          <label>Inflation Assumption Type:</label>
          <select
            name="inflation_assumption_type"
            value={formData.inflation_assumption_type}
            onChange={handleChange}
          >
            <option value="fixed">Fixed</option>
            <option value="normal">Normal</option>
            <option value="uniform">Uniform</option>
          </select>
        </div>

        {formData.inflation_assumption_type === 'fixed' && (
          <div className="form-group">
            <label>Inflation Assumption Value:</label>
            <input
              type="number"
              step="any"
              name="inflation_assumption_value"
              value={formData.inflation_assumption_value}
              onChange={handleChange}
            />
          </div>
        )}

        {formData.inflation_assumption_type === 'normal' && (
          <>
            <div className="form-group">
              <label>Inflation Assumption Mean:</label>
              <input
                type="number"
                step="any"
                name="inflation_assumption_mean"
                value={formData.inflation_assumption_mean}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label>Inflation Assumption Std Dev:</label>
              <input
                type="number"
                step="any"
                name="inflation_assumption_std_dev"
                value={formData.inflation_assumption_std_dev}
                onChange={handleChange}
              />
            </div>
          </>
        )}

        {formData.inflation_assumption_type === 'uniform' && (
          <>
            <div className="form-group">
              <label>Inflation Assumption Upper:</label>
              <input
                type="number"
                step="any"
                name="inflation_assumption_upper"
                value={formData.inflation_assumption_upper}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label>Inflation Assumption Lower:</label>
              <input
                type="number"
                step="any"
                name="inflation_assumption_lower"
                value={formData.inflation_assumption_lower}
                onChange={handleChange}
              />
            </div>
          </>
        )}

        {/* Roth Optimizer */}
        <div className="form-group">
          <label>Is Roth Optimizer Enabled?</label>
          <input
            type="checkbox"
            name="is_roth_optimizer_enabled"
            checked={formData.is_roth_optimizer_enabled}
            onChange={handleChange}
          />
        </div>

        {formData.is_roth_optimizer_enabled && (
          <>
            <div className="form-group">
              <label>Roth Start Year:</label>
              <input
                type="number"
                name="roth_start_year"
                value={formData.roth_start_year}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label>Roth End Year:</label>
              <input
                type="number"
                name="roth_end_year"
                value={formData.roth_end_year}
                onChange={handleChange}
              />
            </div>
          </>
        )}

        {/* Other Fields */}
        <div className="form-group">
          <label>After-Tax Contribution Limit:</label>
          <input
            type="number"
            name="after_tax_contribution_limit"
            value={formData.after_tax_contribution_limit}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>Financial Goal:</label>
          <input
            type="number"
            name="financial_goal"
            value={formData.financial_goal}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>State of Residence:</label>
          <input
            type="text"
            name="state_of_residence"
            value={formData.state_of_residence}
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
