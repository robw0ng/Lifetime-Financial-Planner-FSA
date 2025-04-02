import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useData } from "./DataContext";
import { useSelected } from "./SelectedContext";

export default function EditScenario() {
  const { id } = useParams(); // Get scenario ID from URL
  const { scenarios, editScenario } = useData();
  const { setSelectedScenario } = useSelected();
  const navigate = useNavigate();

  // Define formData with all fields from CreateScenario.jsx
  const [formData, setFormData] = useState({
    name: "",
    isMarried: false,
    birthYear: "",
    birthYearSpouse: "",
    lifeExpectancyType: "fixed",
    lifeExpectancyValue: "",
    lifeExpectancyMean: "",
    lifeExpectancyStdDev: "",
    spouseLifeExpectancyType: "",
    spouseLifeExpectancyValue: "",
    spouseLifeExpectancyMean: "",
    spouseLifeExpectancyStdDev: "",
    inflationAssumptionType: "fixed",
    inflationAssumptionValue: "",
    inflationAssumptionMean: "",
    inflationAssumptionStdDev: "",
    inflationAssumptionUpper: "",
    inflationAssumptionLower: "",
    afterTaxContributionLimit: "",
    isRothOptimizerEnabled: false,
    rothStartYear: "",
    rothEndYear: "",
    financialGoal: "",
    stateOfResidence: "",
    sharingSettings: "",
  });

  const scenarioToEdit = scenarios.find(
    (scenario) => Number(scenario.id) === Number(id)
  );

  console.log("scenario to edit", scenarioToEdit);

  // Load existing scenario data into form
  useEffect(() => {
    if (scenarioToEdit) {
      setFormData({
        name: scenarioToEdit.name,
        isMarried: scenarioToEdit.isMarried,
        birthYear: scenarioToEdit.birthYear || "",
        birthYearSpouse: scenarioToEdit.birthYearSpouse || "",
        lifeExpectancyType: scenarioToEdit.lifeExpectancyType || "fixed",
        lifeExpectancyValue: scenarioToEdit.lifeExpectancyValue || "",
        lifeExpectancyMean: scenarioToEdit.lifeExpectancyMean || "",
        lifeExpectancyStdDev: scenarioToEdit.lifeExpectancyStdDev || "",
        spouseLifeExpectancyType:
          scenarioToEdit.spouseLifeExpectancyType || "",
        spouseLifeExpectancyValue:
          scenarioToEdit.spouseLifeExpectancyValue || "",
        spouseLifeExpectancyMean: scenarioToEdit.spouseLifeExpectancyMean || "",
        spouseLifeExpectancyStdDev:
          scenarioToEdit.spouseLifeExpectancyStdDev || "",
        inflationAssumptionType:
          scenarioToEdit.inflationAssumptionType || "fixed",
        inflationAssumptionValue:
          scenarioToEdit.inflationAssumptionValue || "",
        inflationAssumptionMean: scenarioToEdit.inflationAssumptionMean || "",
        inflationAssumptionStdDev:
          scenarioToEdit.inflationAssumptionStdDev || "",
        inflationAssumptionUpper: scenarioToEdit.inflationAssumptionUpper || "",
        inflationAssumptionLower: scenarioToEdit.inflationAssumptionLower || "",
        afterTaxContributionLimit:
          scenarioToEdit.afterTaxContributionLimit || "",
        isRothOptimizerEnabled:
          scenarioToEdit.isRothOptimizerEnabled || false,
        rothStartYear: scenarioToEdit.rothStartYear || "",
        rothEndYear: scenarioToEdit.rothEndYear || "",
        financialGoal: scenarioToEdit.financialGoal || "",
        stateOfResidence: scenarioToEdit.stateOfResidence || "",
        sharingSettings: scenarioToEdit.sharingSettings || "",
      });
    }
  }, [id, scenarios]);

  // Handle changes in form inputs
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Handle form submission to update scenario
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let editedScenario = { ...scenarioToEdit, ...formData };

      const modifiedScenario = await editScenario(editedScenario);
      setSelectedScenario(modifiedScenario);
      navigate("/scenarios");
    } catch (error) {
      console.error("Error updating scenario:", error);
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
          <div className="form-group">
            <label>Spouse Birth Year:</label>
            <input
              type="number"
              name="birthYearSpouse"
              value={formData.birthYearSpouse}
              onChange={handleChange}
            />
          </div>
        )}

        {/* Life Expectancy for User */}
        <div className="form-group">
          <label>Life Expectancy Type:</label>
          <select
            name="lifeExpectancyType"
            value={formData.lifeExpectancyType}
            onChange={handleChange}
          >
            <option value="fixed">Fixed</option>
            <option value="normal">Normal</option>
          </select>
        </div>

        {formData.lifeExpectancyType === "fixed" && (
          <div className="form-group">
            <label>Life Expectancy Value:</label>
            <input
              type="number"
              name="lifeExpectancyValue"
              value={formData.lifeExpectancyValue}
              onChange={handleChange}
            />
          </div>
        )}

        {formData.lifeExpectancyType === "normal" && (
          <>
            <div className="form-group">
              <label>Life Expectancy Mean:</label>
              <input
                type="number"
                name="lifeExpectancyMean"
                value={formData.lifeExpectancyMean}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label>Life Expectancy Std Dev:</label>
              <input
                type="number"
                name="lifeExpectancyStdDev"
                value={formData.lifeExpectancyStdDev}
                onChange={handleChange}
              />
            </div>
          </>
        )}

        {/* Inflation Assumption */}
        <div className="form-group">
          <label>Inflation Assumption Type:</label>
          <select
            name="inflationAssumptionType"
            value={formData.inflationAssumptionType}
            onChange={handleChange}
          >
            <option value="fixed">Fixed</option>
            <option value="normal">Normal</option>
            <option value="uniform">Uniform</option>
          </select>
        </div>

        {formData.inflationAssumptionType === "fixed" && (
          <div className="form-group">
            <label>Inflation Assumption Value:</label>
            <input
              type="number"
              step="any"
              name="inflationAssumptionValue"
              value={formData.inflationAssumptionValue}
              onChange={handleChange}
            />
          </div>
        )}

        {formData.inflationAssumptionType === "normal" && (
          <>
            <div className="form-group">
              <label>Inflation Assumption Mean:</label>
              <input
                type="number"
                step="any"
                name="inflationAssumptionMean"
                value={formData.inflationAssumptionMean}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label>Inflation Assumption Std Dev:</label>
              <input
                type="number"
                step="any"
                name="inflationAssumptionStdDev"
                value={formData.inflationAssumptionStdDev}
                onChange={handleChange}
              />
            </div>
          </>
        )}

        {formData.inflationAssumptionType === "uniform" && (
          <>
            <div className="form-group">
              <label>Inflation Assumption Upper:</label>
              <input
                type="number"
                step="any"
                name="inflationAssumptionUpper"
                value={formData.inflationAssumptionUpper}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label>Inflation Assumption Lower:</label>
              <input
                type="number"
                step="any"
                name="inflationAssumptionLower"
                value={formData.inflationAssumptionLower}
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
            name="isRothOptimizerEnabled"
            checked={formData.isRothOptimizerEnabled}
            onChange={handleChange}
          />
        </div>

        {formData.isRothOptimizerEnabled && (
          <>
            <div className="form-group">
              <label>Roth Start Year:</label>
              <input
                type="number"
                name="rothStartYear"
                value={formData.rothStartYear}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label>Roth End Year:</label>
              <input
                type="number"
                name="rothEndYear"
                value={formData.rothEndYear}
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

        <button type="submit" className="submit-btn">
          Update Scenario
        </button>
      </form>
    </main>
  );
}
