import { useState } from 'react';
// import "./CreateScenario.css";
import { useNavigate } from 'react-router-dom';
import { useData } from './DataContext';
import { useSelected } from './SelectedContext';


export default function CreateChartString(){
    //if selectedScenario.recentSimulation.simType switch
    const [formData, setFormData] = useState({
        chartType: '',
        selectedQuantity: '',
        
    });

    const handleChange = (e) => {
		const { name, value, type, checked } = e.target;
		setFormData((prev) => ({
			...prev,
			[name]: type === 'checkbox' ? checked : value,
		}));
	};

    const handleSubmit = async (e) => {
        e.preventDefault();
    }
    
    return(
        <div>
            <form onSubmit={handleSubmit}>
            <div className="form-group">
                <label>Chart Type</label>
                <select
                    name="chartType"
                    value={formData.spouseLifeExpectancyType}
                    onChange={handleChange}
                    required>
                    <option value="Probability_of_success_over_time">Probability of Success over time</option>
                    <option value="Probability_ranges_for_a_selected_quantity_over_time:">Probability ranges for a selected quantity over time</option>
                    <option value="Stacked_bar_chart">Stacked bar chart</option>
                </select>
            </div>
            {formData.chartType === 'Probability_ranges_for_a_selected_quantity_over_time:' && (
                <>
                <label>Selected Quantity</label>
                <select
                    name="selectedQuantity"
                    value={formData.selectedQuantity}
                    onChange={handleChange}
                    required>
                    <option value="total_investments">Total Investments</option>
                    <option value="total_income">total income</option>
                    <option value="total_expenses">total expenses, including taxes</option>
                    <option value="early_withdrawal_tax">early withdrawal tax</option>
                    <option value="percentage_of_total_discretionary_expenses">percentage of total discretionary expenses incurred</option>
                </select>
                </>
            )}
            </form>
        </div>
    );
}