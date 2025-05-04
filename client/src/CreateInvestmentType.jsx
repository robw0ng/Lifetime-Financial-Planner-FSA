import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelected } from './SelectedContext';
import { useData } from './DataContext';

export default function CreateInvestmentType() {
  const { selectedScenario, setSelectedInvestmentType, deselectInvestment } =
    useSelected();
  const { createInvestmentType } = useData();
  const navigate = useNavigate();

  const [newTypeData, setNewTypeData] = useState({
    name: '',
    description: '',
    return_mode: 'fixed',
    return_fixed: '',
    return_mean: '',
    return_stddev: '',
    income_mode: 'fixed',
    income_fixed: '',
    income_mean: '',
    income_stddev: '',
    expense_ratio: '',
    taxability: 'taxable',
    expected_change_numtype: 'percent',
    expected_income_numtype: 'percent',
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
      console.error('No scenario selected.');
      return;
    }

    // Build backend-compatible payload
    const payload = {
      name: newTypeData.name,
      description: newTypeData.description || null,
      expected_change_type: newTypeData.return_mode,
      expected_change_value:
        newTypeData.return_mode === 'fixed'
          ? Number(newTypeData.return_fixed)
          : null,
      expected_change_mean:
        newTypeData.return_mode === 'normal'
          ? Number(newTypeData.return_mean)
          : null,
      expected_change_std_dev:
        newTypeData.return_mode === 'normal'
          ? Number(newTypeData.return_stddev)
          : null,
      expected_income_type: newTypeData.income_mode,
      expected_income_value:
        newTypeData.income_mode === 'fixed'
          ? Number(newTypeData.income_fixed)
          : null,
      expected_income_mean:
        newTypeData.income_mode === 'normal'
          ? Number(newTypeData.income_mean)
          : null,
      expected_income_std_dev:
        newTypeData.income_mode === 'normal'
          ? Number(newTypeData.income_stddev)
          : null,
      expense_ratio: Number(newTypeData.expense_ratio),
      taxability: newTypeData.taxability,
      expected_change_numtype: newTypeData.expected_change_numtype,
      expected_income_numtype: newTypeData.expected_income_numtype,
    };

    try {
      const createdType = await createInvestmentType(
        selectedScenario.id,
        payload
      );
      console.log('created investment returned', createdType);
      if (createdType) {
        deselectInvestment();
        setSelectedInvestmentType(createdType);
      }
      navigate('/investments');
    } catch (err) {
      console.error('Failed to create investment type:', err);
    }
  };

  return (
    <main>
      <form onSubmit={handleSubmit} className="form-container">
        <h2>Create New Investment Type</h2>

        <div className="form-group">
          <label>Asset Type Name:</label>
          <input
            type="text"
            name="name"
            value={newTypeData.name}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Description:</label>
          <textarea
            name="description"
            value={newTypeData.description}
            onChange={handleChange}
            rows="4"
            required
          />
        </div>

        {/* Expected Annual Return Mode */}
        <div className="form-group">
          <label>Expected Annual Return:</label>
          <select
            name="return_mode"
            value={newTypeData.return_mode}
            onChange={handleChange}
          >
            <option value="fixed">Fixed</option>
            <option value="normal">Normal Distribution</option>
          </select>

          {newTypeData.return_mode === 'fixed' ? (
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
          <select
            name="income_mode"
            value={newTypeData.income_mode}
            onChange={handleChange}
          >
            <option value="fixed">Fixed</option>
            <option value="normal">Normal Distribution</option>
          </select>

          {newTypeData.income_mode === 'fixed' ? (
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
          <select
            name="taxability"
            value={newTypeData.taxability}
            onChange={handleChange}
          >
            <option value="taxable">Taxable</option>
            <option value="tax-exempt">Tax-Exempt</option>
          </select>
        </div>

        <div className="form-group">
          <label>Expected Return (Amt or Pct):</label>
          <select
            name="expected_change_numtype"
            value={newTypeData.expected_change_numtype}
            onChange={handleChange}
          >
            <option value="percent">Percent</option>
            <option value="amount">Amount</option>
          </select>
        </div>

        <div className="form-group">
          <label>Expected Income (Amt or Pct):</label>
          <select
            name="expected_income_numtype"
            value={newTypeData.expected_income_numtype}
            onChange={handleChange}
          >
            <option value="percent">Percent</option>
            <option value="amount">Amount</option>
          </select>
        </div>

        <button type="submit" className="submit-btn">
          Create Type
        </button>
      </form>
    </main>
  );
}
