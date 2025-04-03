import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useData } from "./DataContext";
import { useSelected } from "./SelectedContext";

export default function EditInvestmentType() {
  const { selectedScenario, setSelectedInvestmentType, editedInvestmentType } = useSelected();
  const { editInvestmentType } = useData();
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
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

  useEffect(() => {
    if (!selectedScenario || !id) return;
    
    const type = Array.from(selectedScenario.InvestmentTypes).find(
      (t) => `${t.id}` === `${id}`
    );
    console.log("typefound", type);

    if (!type) return;

    setFormData({
      name: type.name || "",
      description: type.description || "",
      return_mode: type.expected_change_type,
      return_fixed: type.expected_change_type === "fixed" ? type.expected_change_value : "",
      return_mean: type.expected_change_type === "normal" ? type.expected_change_mean : "",
      return_stddev: type.expected_change_type === "normal" ? type.expected_change_std_dev : "",
      income_mode: type.expected_income_type,
      income_fixed: type.expected_income_type === "fixed" ? type.expected_income_value : "",
      income_mean: type.expected_income_type === "normal" ? type.expected_income_mean : "",
      income_stddev: type.expected_income_type === "normal" ? type.expected_income_std_dev : "",
      expense_ratio: type.expense_ratio || "",
      taxability: type.taxability || "taxable",
    });
  }, [selectedScenario, id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
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
  
    // Backend-compatible payload
    const updatedType = {
      id: id,
      name: formData.name,
      description: formData.description || null,
      expected_change_type: formData.return_mode,
      expected_change_value: formData.return_mode === "fixed" ? Number(formData.return_fixed) : null,
      expected_change_mean: formData.return_mode === "normal" ? Number(formData.return_mean) : null,
      expected_change_std_dev: formData.return_mode === "normal" ? Number(formData.return_stddev) : null,
      expected_income_type: formData.income_mode,
      expected_income_value: formData.income_mode === "fixed" ? Number(formData.income_fixed) : null,
      expected_income_mean: formData.income_mode === "normal" ? Number(formData.income_mean) : null,
      expected_income_std_dev: formData.income_mode === "normal" ? Number(formData.income_stddev) : null,
      expense_ratio: Number(formData.expense_ratio),
      taxability: formData.taxability,
    };
  
    try {
      const edited = await editInvestmentType(selectedScenario.id, updatedType);
      console.log("edited investment returned", edited)
      if (edited){
        setSelectedInvestmentType(edited);
      }
      navigate("/investments");
    } catch (err) {
      console.error("Failed to edit investment type:", err);
    }
  };
  
  return (
    <main>
      <form onSubmit={handleSubmit} className="form-container">
        <h2>Edit Investment Type</h2>

        <div className="form-group">
          <label>Asset Type Name:</label>
          <input type="text" name="name" value={formData.name} onChange={handleChange} required />
        </div>

        <div className="form-group">
          <label>Description:</label>
          <textarea name="description" value={formData.description} onChange={handleChange} rows="4" />
        </div>

        {/* Expected Return */}
        <div className="form-group">
          <label>Expected Annual Return:</label>
          <select name="return_mode" value={formData.return_mode} onChange={handleChange}>
            <option value="fixed">Fixed</option>
            <option value="normal">Normal Distribution</option>
          </select>

          {formData.return_mode === "fixed" ? (
            <input
              type="text"
              name="return_fixed"
              value={formData.return_fixed}
              onChange={handleChange}
              placeholder="e.g., 7%"
              required
            />
          ) : (
            <>
              <input
                type="text"
                name="return_mean"
                value={formData.return_mean}
                onChange={handleChange}
                placeholder="Mean e.g., 7"
                required
              />
              <input
                type="text"
                name="return_stddev"
                value={formData.return_stddev}
                onChange={handleChange}
                placeholder="Standard Deviation e.g., 2"
                required
              />
            </>
          )}
        </div>

        {/* Expected Income */}
        <div className="form-group">
          <label>Expected Annual Income:</label>
          <select name="income_mode" value={formData.income_mode} onChange={handleChange}>
            <option value="fixed">Fixed</option>
            <option value="normal">Normal Distribution</option>
          </select>

          {formData.income_mode === "fixed" ? (
            <input
              type="text"
              name="income_fixed"
              value={formData.income_fixed}
              onChange={handleChange}
              placeholder="e.g., 1.5%"
              required
            />
          ) : (
            <>
              <input
                type="text"
                name="income_mean"
                value={formData.income_mean}
                onChange={handleChange}
                placeholder="Mean e.g., 1.5"
                required
              />
              <input
                type="text"
                name="income_stddev"
                value={formData.income_stddev}
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
            value={formData.expense_ratio}
            onChange={handleChange}
            placeholder="e.g., 0.04"
          />
        </div>

        <div className="form-group">
          <label>Taxability:</label>
          <select name="taxability" value={formData.taxability} onChange={handleChange}>
            <option value="taxable">Taxable</option>
            <option value="tax-exempt">Tax-Exempt</option>
          </select>
        </div>

        <button type="submit" className="submit-btn">Save Changes</button>
      </form>
    </main>
  );
}
