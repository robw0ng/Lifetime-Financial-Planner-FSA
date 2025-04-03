import { useState, useEffect } from "react";
import "./CreateScenario.css";
import { useNavigate } from "react-router-dom";
import { useData } from "./DataContext";
import { useSelected } from "./SelectedContext";

export default function EditInvestment() {
  const { selectedScenario, selectedInvestment } = useSelected();
  const { editInvestment } = useData();
  const navigate = useNavigate();

  const investmentTypes = Array.from(selectedScenario.investmentTypes || []);

  const [formData, setFormData] = useState({
    id: "",
    selectedType: "",
    value: "",
    account: "taxable",
  });

  useEffect(() => {
    if (selectedInvestment) {
      setFormData({
        id: selectedInvestment.id,
        selectedType: selectedInvestment.type.name,
        value: selectedInvestment.value || "",
        account: selectedInvestment.account || "taxable",
      });
    }
  }, [selectedInvestment]);

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

    const updatedInvestment = {
      id: formData.id,
      type: selectedTypeData,
      value: parseFloat(formData.value),
      account: formData.account,
    };

    try {
      await editInvestment(selectedScenario.id, updatedInvestment);
      navigate("/investments");
    } catch (error) {
      console.error("Failed to update investment:", error);
    }
  };

  return (
    <main>
      <form onSubmit={handleSubmit} className="form-container">
        <h2>Edit Investment</h2>
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
          Save Changes
        </button>
      </form>
    </main>
  );
}
