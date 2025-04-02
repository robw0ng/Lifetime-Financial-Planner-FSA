// import { useState, useEffect } from 'react';
// // import './CreateScenario.css';
// import { useNavigate } from 'react-router-dom';
// import { useData } from './DataContext';
// import { useSelected } from './SelectedContext';

// export default function EditInvestment() {
//   const { selectedScenario, selectedInvestment } = useSelected();
//   const { editInvestment } = useData();
//   const navigate = useNavigate();

//   const [formData, setFormData] = useState({
//     id: '',
//     name: '',
//     description: '',
//     expected_annual_return: '',
//     expected_annual_income: '',
//     expense_ratio: '',
//     taxability: 'taxable',
//     value: '',
//     account: 'taxable',
//   });

//   useEffect(() => {
//     if (selectedInvestment) {
//       setFormData({
//         id: selectedInvestment.id,
//         name: selectedInvestment.type.name,
//         description: selectedInvestment.type.description || '',
//         expected_annual_return: selectedInvestment.type.expected_annual_return || '',
//         expected_annual_income: selectedInvestment.type.expected_annual_income || '',
//         expense_ratio: selectedInvestment.type.expense_ratio || '',
//         taxability: selectedInvestment.type.taxability || 'taxable',
//         value: selectedInvestment.value || '',
//         account: selectedInvestment.account || 'taxable',
//       });
//     }
//   }, [selectedInvestment]);

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({
//       ...prev,
//       [name]: value,
//     }));
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     const updatedInvestment = {
//       id: formData.id,
//       type: {
//         name: formData.name,
//         description: formData.description,
//         expected_annual_return: formData.expected_annual_return,
//         expected_annual_income: formData.expected_annual_income,
//         expense_ratio: formData.expense_ratio,
//         taxability: formData.taxability,
//       },
//       value: parseFloat(formData.value),
//       account: formData.account,
//     };

//     try {
//       await editInvestment(selectedScenario.id, updatedInvestment);
//       navigate('/investments');
//     } catch (error) {
//       console.error('Failed to update investment:', error);
//     }
//   };

//   return (
//     <main>
//       <form onSubmit={handleSubmit} className="form-container">
//         <h2>Edit Investment</h2>

//         <div className="form-group">
//           <label>Asset Type Name:</label>
//           <input
//             type="text"
//             name="name"
//             value={formData.name}
//             onChange={handleChange}
//             required
//           />
//         </div>

//         <div className="form-group">
//           <label>Description:</label>
//           <input
//             type="text"
//             name="description"
//             value={formData.description}
//             onChange={handleChange}
//           />
//         </div>

//         <div className="form-group">
//           <label>Expected Annual Return:</label>
//           <input
//             type="text"
//             name="expected_annual_return"
//             value={formData.expected_annual_return}
//             onChange={handleChange}
//             placeholder="e.g., 7% or N(7,2)"
//           />
//         </div>

//         <div className="form-group">
//           <label>Expected Annual Income:</label>
//           <input
//             type="text"
//             name="expected_annual_income"
//             value={formData.expected_annual_income}
//             onChange={handleChange}
//             placeholder="e.g., 1.5% or N(1.5,0.5)"
//           />
//         </div>

//         <div className="form-group">
//           <label>Expense Ratio (%):</label>
//           <input
//             type="text"
//             name="expense_ratio"
//             value={formData.expense_ratio}
//             onChange={handleChange}
//             placeholder="e.g., 0.04"
//           />
//         </div>

//         <div className="form-group">
//           <label>Taxability:</label>
//           <select name="taxability" value={formData.taxability} onChange={handleChange}>
//             <option value="taxable">Taxable</option>
//             <option value="tax-exempt">Tax-Exempt</option>
//           </select>
//         </div>

//         <div className="form-group">
//           <label>Investment Value ($):</label>
//           <input
//             type="number"
//             name="value"
//             value={formData.value}
//             onChange={handleChange}
//             required
//           />
//         </div>

//         <div className="form-group">
//           <label>Account Type:</label>
//           <select name="account" value={formData.account} onChange={handleChange}>
//             <option value="taxable">Non-Retirement (Taxable)</option>
//             <option value="PTR">Pre-Tax Retirement</option>
//             <option value="ATR">After-Tax Retirement</option>
//           </select>
//         </div>

//         <button type="submit" className="submit-btn">
//           Save Changes
//         </button>
//       </form>
//     </main>
//   );
// }

import { useState, useEffect } from "react";
import "./CreateScenario.css";
import { useNavigate } from "react-router-dom";
import { useData } from "./DataContext";
import { useSelected } from "./SelectedContext";

export default function EditInvestment() {
  const { selectedScenario, selectedInvestment } = useSelected();
  const { editInvestment } = useData();
  const navigate = useNavigate();

  // List of available investment types in the selected scenario
  const investmentTypes = Array.from(selectedScenario.investmentTypes || []);

  // State for investment form data
  const [formData, setFormData] = useState({
    id: "",
    selectedType: "",
    value: "",
    account: "taxable",
  });

  // State for editing or creating a new investment type
  const [newTypeData, setNewTypeData] = useState({
    name: "",
    description: "",
    expected_annual_return: "",
    expected_annual_income: "",
    expense_ratio: "",
    taxability: "taxable",
  });

  useEffect(() => {
    if (selectedInvestment) {
      setFormData({
        id: selectedInvestment.id,
        selectedType: selectedInvestment.type.name,
        value: selectedInvestment.value || "",
        account: selectedInvestment.account || "taxable",
      });

      // Pre-populate newTypeData if editing an existing type
      setNewTypeData({
        name: selectedInvestment.type.name,
        description: selectedInvestment.type.description || "",
        expected_annual_return:
          selectedInvestment.type.expected_annual_return || "",
        expected_annual_income:
          selectedInvestment.type.expected_annual_income || "",
        expense_ratio: selectedInvestment.type.expense_ratio || "",
        taxability: selectedInvestment.type.taxability || "taxable",
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

  const handleNewTypeChange = (e) => {
    const { name, value } = e.target;
    setNewTypeData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    let selectedTypeData = null;

    if (formData.selectedType === "create_new") {
      // Create a new investment type
      selectedTypeData = { ...newTypeData };
    } else {
      // Find the selected existing type
      selectedTypeData = investmentTypes.find(
        (type) => type.name === formData.selectedType
      );
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
          {/* Left Section: Investment Details */}
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
                <option value="create_new">Create New</option>
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

          {/* Right Section: Edit or Create New Investment Type */}
          <section className="form-section">
            <h3>{formData.selectedType === "create_new" ? "Create New Investment Type" : "Edit Investment Type"}</h3>

            <div className="form-group">
              <label>Asset Type Name:</label>
              <input
                type="text"
                name="name"
                value={newTypeData.name}
                onChange={handleNewTypeChange}
                disabled={formData.selectedType !== "create_new"}
                required={formData.selectedType === "create_new"}
              />
            </div>

            <div className="form-group">
              <label>Description:</label>
              <textarea
                name="description"
                value={newTypeData.description}
                onChange={handleNewTypeChange}
                disabled={formData.selectedType !== "create_new"}
                rows="4"
              />
            </div>

            <div className="form-group">
              <label>Expected Annual Return:</label>
              <input
                type="text"
                name="expected_annual_return"
                value={newTypeData.expected_annual_return}
                onChange={handleNewTypeChange}
                disabled={formData.selectedType !== "create_new"}
                placeholder="e.g., 7% or N(7,2)"
              />
            </div>

            <div className="form-group">
              <label>Expected Annual Income:</label>
              <input
                type="text"
                name="expected_annual_income"
                value={newTypeData.expected_annual_income}
                onChange={handleNewTypeChange}
                disabled={formData.selectedType !== "create_new"}
                placeholder="e.g., 1.5% or N(1.5,0.5)"
              />
            </div>

            <div className="form-group">
              <label>Expense Ratio (%):</label>
              <input
                type="text"
                name="expense_ratio"
                value={newTypeData.expense_ratio}
                onChange={handleNewTypeChange}
                disabled={formData.selectedType !== "create_new"}
                placeholder="e.g., 0.04"
              />
            </div>

            <div className="form-group">
              <label>Taxability:</label>
              <select
                name="taxability"
                value={newTypeData.taxability}
                onChange={handleNewTypeChange}
                disabled={formData.selectedType !== "create_new"}
              >
                <option value="taxable">Taxable</option>
                <option value="tax-exempt">Tax-Exempt</option>
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
