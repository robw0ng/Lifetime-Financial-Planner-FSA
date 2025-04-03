import { useState } from "react";
import "./CreateScenario.css";
import { useNavigate } from "react-router-dom";
import { useData } from "./DataContext";
import { useSelected } from "./SelectedContext";

export default function CreateInvestment() {
  const { selectedScenario } = useSelected();
  const { createInvestment } = useData();
  const navigate = useNavigate();

  const investmentTypes = Array.from(selectedScenario.InvestmentTypes || []);

  const [formData, setFormData] = useState({
    selectedType: "",
    value: "",
    account: "taxable",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const selectedTypeData = investmentTypes.find(
      (type) => type.name === formData.selectedType
    );

    if (!selectedTypeData) {
      console.error("No valid investment type selected.");
      return;
    }

    const newInvestment = {
      type: selectedTypeData,
      value: parseFloat(formData.value),
      account: formData.account,
    };

    try {
      await createInvestment(selectedScenario.id, newInvestment);
      navigate("/investments");
    } catch (error) {
      console.error("Failed to create investment:", error);
    }

    resetForm();
  };

  const resetForm = () => {
    setFormData({
      selectedType: "",
      value: "",
      account: "taxable",
    });
  };

  return (
    <main>
      <form onSubmit={handleSubmit} className="form-container">
        <h2>Create New Investment</h2>
        <div className="form-row">
          <section className="form-section">
            <h3>Investment Details</h3>

            <div className="form-group">
              <label>Investment Type:</label>
              <select
                name="selectedType"
                value={formData.selectedType}
                onChange={handleChange}
                required
              >
                <option value="">Select Investment Type</option>
                {investmentTypes.map((type, index) => (
                  <option key={index} value={type.name}>
                    {type.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Investment Value ($):</label>
              <input
                type="number"
                name="value"
                value={formData.value}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Account Type:</label>
              <select
                name="account"
                value={formData.account}
                onChange={handleChange}
              >
                <option value="taxable">Non-Retirement (Taxable)</option>
                <option value="PTR">Pre-Tax Retirement</option>
                <option value="ATR">After-Tax Retirement</option>
              </select>
            </div>
          </section>
        </div>

        <button type="submit" className="submit-btn">
          Create Investment
        </button>
      </form>
    </main>
  );
}
