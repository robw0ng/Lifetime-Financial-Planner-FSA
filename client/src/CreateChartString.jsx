import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from './DataContext';
import { useSelected } from './SelectedContext';

export default function CreateChartString() {
  const navigate = useNavigate();
  const { chartStrings, setChartStrings } = useSelected();
  const { simStyle } = useSelected();
  const [formData, setFormData] = useState({
    chartType: '',
    selectedQuantity: '',
    aggregationThreshold: '',
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const { chartType, selectedQuantity, aggregationThreshold } = formData;
    const qty = selectedQuantity.trim();
    let chartString = chartType;
    if (qty) chartString += `: ${qty}`;
    if (simStyle === 0 && aggregationThreshold.trim()) {
      chartString += ` agg: ${aggregationThreshold.trim()}`;
    }
    setChartStrings(prev => {
      const next = [...prev, chartString];
      console.log('new chartStrings:', next);
      return next;
    });
    setFormData({ chartType: '', selectedQuantity: '', aggregationThreshold: '' });
    navigate('/simulations');
  };

  if (simStyle === 0) {
    return (
      <div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Chart Type</label>
            <select
              name="chartType"
              value={formData.chartType}
              onChange={handleChange}
              required
            >
              <option value="" disabled>
                -- select one --
              </option>
              <option value="Probability_of_success_over_time">
                Probability of Success over time
              </option>
              <option value="Probability_ranges_for_a_selected_quantity_over_time">
                Probability ranges for a selected quantity over time
              </option>
              <option value="Stacked_bar_chart">
                Stacked bar chart
              </option>
            </select>
          </div>

          {formData.chartType === 'Probability_ranges_for_a_selected_quantity_over_time' && (
            <div className="form-group">
              <label>Selected Quantity</label>
              <select
                name="selectedQuantity"
                value={formData.selectedQuantity}
                onChange={handleChange}
                required
              >
                <option value="" disabled>
                  -- select one --
                </option>
                <option value="total_investments">Total Investments</option>
                <option value="total_income">Total Income</option>
                <option value="total_expenses">
                  Total expenses, including taxes
                </option>
                <option value="early_withdrawal_tax">Early withdrawal tax</option>
                <option value="percentage_of_total_discretionary_expenses">
                  Percentage of total discretionary expenses incurred
                </option>
              </select>
            </div>
          )}

          {formData.chartType === 'Stacked_bar_chart' && (
            <>
              <div className="form-group">
                <label>Statistic</label>
                <select
                  name="selectedQuantity"
                  value={formData.selectedQuantity}
                  onChange={handleChange}
                  required
                >
                  <option value="" disabled>
                    -- select one --
                  </option>
                  <option value="median">Median</option>
                  <option value="average">Average</option>
                </select>
              </div>
              <div className="form-group">
                <label>Aggregation Threshold</label>
                <input
                  type="number"
                  name="aggregationThreshold"
                  value={formData.aggregationThreshold}
                  onChange={handleChange}
                  placeholder="Enter threshold (optional)"
                  min="0"
                  step="any"
                />
              </div>
            </>
          )}

          <button type="submit">Add chart</button>
        </form>
      </div>
    );
  } else if (simStyle === 1) {
    return (
      <div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Chart Type</label>
            <select
              name="chartType"
              value={formData.chartType}
              onChange={handleChange}
              required
            >
              <option value="" disabled>
                -- select one --
              </option>
              <option value="multi_line">Multi-line chart</option>
              <option value="param_line">Parameter vs. final value</option>
            </select>
          </div>

          {formData.chartType === 'multi_line' && (
            <div className="form-group">
              <label>Metric</label>
              <select
                name="selectedQuantity"
                value={formData.selectedQuantity}
                onChange={handleChange}
                required
              >
                <option value="" disabled>
                  -- select one --
                </option>
                <option value="prob_of_success">
                  Probability of success
                </option>
                <option value="median_total_investments">
                  Median total investments
                </option>
              </select>
            </div>
          )}

          {formData.chartType === 'param_line' && (
            <>
              <div className="form-group">
                <label>Metric</label>
                <select
                  name="selectedQuantity"
                  value={formData.selectedQuantity}
                  onChange={handleChange}
                  required
                >
                  <option value="" disabled>
                    -- select one --
                  </option>
                  <option value="prob_of_success">
                    Final probability of success
                  </option>
                  <option value="median_total_investments">
                    Final median total investments
                  </option>
                  <option value="average_total_investments">
                    Final average total investments
                  </option>
                </select>
              </div>
              <div className="form-group">
                <label>Parameter Value</label>
                <div>
                  {/* display parameter value here when available */}
                </div>
              </div>
            </>
          )}

          <button type="submit">Add chart</button>
        </form>
      </div>
    );
  } else {
    return null;
  }
}
