import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelected } from "./SelectedContext";
import { useData } from "./DataContext";

export default function CreateInvestmentType() {
  const { selectedScenario, setSelectedInvestmentType } = useSelected();
  const { createInvestmentType } = useData();
  const navigate = useNavigate();

  const [newTypeData, setNewTypeData] = useState({
    name: "",
    description: "",
    return_mode: "fixed",
    return_fixed: "",
    return_mean: "",
    return_stddev: "",
    income_mode: "fixed",
    income_fixed: "",
    income_mean: "",
    income_stddev: "",
    expense_ratio: "",
    taxability: "taxable",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewTypeData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedScenario?.id) {
      console.error("No scenario selected.");
      return;
    }

    // Build the cleaned payload
    const payload = {
      name: newTypeData.name,
      description: newTypeData.description,
      expected_annual_return:
        newTypeData.return_mode === "fixed"
          ? newTypeData.return_fixed
          : `N(${newTypeData.return_mean},${newTypeData.return_stddev})`,
      expected_annual_income:
        newTypeData.income_mode === "fixed"
          ? newTypeData.income_fixed
          : `N(${newTypeData.income_mean},${newTypeData.income_stddev})`,
      expense_ratio: newTypeData.expense_ratio,
      taxability: newTypeData.taxability,
    };

    try {
      const createdType = await createInvestmentType(selectedScenario.id, payload);
      setSelectedInvestmentType(createdType);
      navigate("/investments");
    } catch (err) {
      console.error("Failed to create investment type:", err);
    }
  };

  return (
    <main>
      <form onSubmit={handleSubmit} className="form-container">
        <h2>Create New Investment Type</h2>

        <div className="form-group">
          <label>Asset Type Name:</label>
          <input type="text" name="name" value={newTypeData.name} onChange={handleChange} required />
        </div>

        <div className="form-group">
          <label>Description:</label>
          <textarea name="description" value={newTypeData.description} onChange={handleChange} rows="4" />
        </div>

        {/* Expected Annual Return Mode */}
        <div className="form-group">
          <label>Expected Annual Return:</label>
          <select name="return_mode" value={newTypeData.return_mode} onChange={handleChange}>
            <option value="fixed">Fixed</option>
            <option value="normal">Normal Distribution</option>
          </select>

          {newTypeData.return_mode === "fixed" ? (
            <input
              type="text"
              name="return_fixed"
              value={newTypeData.return_fixed}
              onChange={handleChange}
              placeholder="e.g., 7%"
              required
            />
          ) : (
            <>
              <input
                type="text"
                name="return_mean"
                value={newTypeData.return_mean}
                onChange={handleChange}
                placeholder="Mean e.g., 7"
                required
              />
              <input
                type="text"
                name="return_stddev"
                value={newTypeData.return_stddev}
                onChange={handleChange}
                placeholder="Standard Deviation e.g., 2"
                required
              />
            </>
          )}
        </div>

        {/* Expected Annual Income Mode */}
        <div className="form-group">
          <label>Expected Annual Income:</label>
          <select name="income_mode" value={newTypeData.income_mode} onChange={handleChange}>
            <option value="fixed">Fixed</option>
            <option value="normal">Normal Distribution</option>
          </select>

          {newTypeData.income_mode === "fixed" ? (
            <input
              type="text"
              name="income_fixed"
              value={newTypeData.income_fixed}
              onChange={handleChange}
              placeholder="e.g., 1.5%"
              required
            />
          ) : (
            <>
              <input
                type="text"
                name="income_mean"
                value={newTypeData.income_mean}
                onChange={handleChange}
                placeholder="Mean e.g., 1.5"
                required
              />
              <input
                type="text"
                name="income_stddev"
                value={newTypeData.income_stddev}
                onChange={handleChange}
                placeholder="Standard Deviation e.g., 0.5"
                required
              />
            </>
          )}
        </div>

        <div className="form-group">
          <label>Expense Ratio (%):</label>
          <input
            type="text"
            name="expense_ratio"
            value={newTypeData.expense_ratio}
            onChange={handleChange}
            placeholder="e.g., 0.04"
          />
        </div>

        <div className="form-group">
          <label>Taxability:</label>
          <select name="taxability" value={newTypeData.taxability} onChange={handleChange}>
            <option value="taxable">Taxable</option>
            <option value="tax-exempt">Tax-Exempt</option>
          </select>
        </div>

        <button type="submit" className="submit-btn">Create Type</button>
      </form>
    </main>
  );
}
