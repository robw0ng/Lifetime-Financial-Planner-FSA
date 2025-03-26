import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./CreateScenario.css";
import { useData } from "./DataContext";

export default function EditScenario() {
	const { id } = useParams(); // scenario ID from URL
	const { scenarios, editScenario } = useData();
	const navigate = useNavigate();

	// Our form state uses camelCase keys, matching CreateScenario.jsx:
	const [formData, setFormData] = useState({
		name: "",
		isMarried: false,
		birthYear: "",
		birthYearSpouse: "",
		// Life Expectancy for user:
		lifeExpectancyType: "fixed", // 'fixed' or 'normal'
		lifeExpectancyValue: "",
		lifeExpectancyMean: "",
		lifeExpectancyStdDev: "",
		// Life Expectancy for spouse:
		spouseLifeExpectancyType: "", // 'fixed' or 'normal'
		spouseLifeExpectancyValue: "",
		spouseLifeExpectancyMean: "",
		spouseLifeExpectancyStdDev: "",
		// Inflation Assumption:
		inflationAssumptionType: "fixed", // 'fixed', 'normal', or 'uniform'
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
	});

	// Find the scenario to edit. Note: the fetched scenario uses snake_case keys.
	const scenarioToEdit = scenarios.find((scenario) => scenario.id === id);

	// When the scenario is loaded, map its keys to our formData structure.
	useEffect(() => {
		if (scenarioToEdit) {
			setFormData({
				name: scenarioToEdit.name || "",
				isMarried: scenarioToEdit.is_married || false,
				birthYear: scenarioToEdit.birth_year ? scenarioToEdit.birth_year.toString() : "",
				birthYearSpouse: scenarioToEdit.spouse_birth_year ? scenarioToEdit.spouse_birth_year.toString() : "",
				lifeExpectancyType: scenarioToEdit.life_expectancy_type || "fixed",
				lifeExpectancyValue: scenarioToEdit.life_expectancy_value
					? scenarioToEdit.life_expectancy_value.toString()
					: "",
				lifeExpectancyMean: scenarioToEdit.life_expectancy_mean
					? scenarioToEdit.life_expectancy_mean.toString()
					: "",
				lifeExpectancyStdDev: scenarioToEdit.life_expectancy_std_dev
					? scenarioToEdit.life_expectancy_std_dev.toString()
					: "",
				spouseLifeExpectancyType: scenarioToEdit.spouse_life_expectancy_type || "",
				spouseLifeExpectancyValue: scenarioToEdit.spouse_life_expectancy_value
					? scenarioToEdit.spouse_life_expectancy_value.toString()
					: "",
				spouseLifeExpectancyMean: scenarioToEdit.spouse_life_expectancy_mean
					? scenarioToEdit.spouse_life_expectancy_mean.toString()
					: "",
				spouseLifeExpectancyStdDev: scenarioToEdit.spouse_life_expectancy_std_dev
					? scenarioToEdit.spouse_life_expectancy_std_dev.toString()
					: "",
				inflationAssumptionType: scenarioToEdit.inflation_assumption_type || "fixed",
				inflationAssumptionValue: scenarioToEdit.inflation_assumption_value
					? scenarioToEdit.inflation_assumption_value.toString()
					: "",
				inflationAssumptionMean: scenarioToEdit.inflation_assumption_mean
					? scenarioToEdit.inflation_assumption_mean.toString()
					: "",
				inflationAssumptionStdDev: scenarioToEdit.inflation_assumption_std_dev
					? scenarioToEdit.inflation_assumption_std_dev.toString()
					: "",
				inflationAssumptionUpper: scenarioToEdit.inflation_assumption_upper
					? scenarioToEdit.inflation_assumption_upper.toString()
					: "",
				inflationAssumptionLower: scenarioToEdit.inflation_assumption_lower
					? scenarioToEdit.inflation_assumption_lower.toString()
					: "",
				afterTaxContributionLimit: scenarioToEdit.after_tax_contribution_limit
					? scenarioToEdit.after_tax_contribution_limit.toString()
					: "",
				isRothOptimizerEnabled: scenarioToEdit.is_roth_optimizer_enabled || false,
				rothStartYear: scenarioToEdit.roth_start_year ? scenarioToEdit.roth_start_year.toString() : "",
				rothEndYear: scenarioToEdit.roth_end_year ? scenarioToEdit.roth_end_year.toString() : "",
				financialGoal: scenarioToEdit.financial_goal ? scenarioToEdit.financial_goal.toString() : "",
				stateOfResidence: scenarioToEdit.state_of_residence || "",
			});
		}
	}, [id, scenarioToEdit]);

	const handleChange = (e) => {
		const { name, value, type, checked } = e.target;
		setFormData((prev) => ({
			...prev,
			[name]: type === "checkbox" ? checked : value,
		}));
	};

	const handleSubmit = async (e) => {
		e.preventDefault();

		// Reassemble the payload in snake_case for the backend:
		const updatedScenarioPayload = {
			id: scenarioToEdit.id, // include the id
			name: formData.name,
			is_married: formData.isMarried,
			birth_year: Number(formData.birthYear),
			spouse_birth_year: formData.isMarried ? Number(formData.birthYearSpouse) : null,
			life_expectancy_type: formData.lifeExpectancyType,
			life_expectancy_value:
				formData.lifeExpectancyType === "fixed" ? Number(formData.lifeExpectancyValue) : null,
			life_expectancy_mean: formData.lifeExpectancyType === "normal" ? Number(formData.lifeExpectancyMean) : null,
			life_expectancy_std_dev:
				formData.lifeExpectancyType === "normal" ? Number(formData.lifeExpectancyStdDev) : null,
			spouse_life_expectancy_type: formData.isMarried ? formData.spouseLifeExpectancyType : null,
			spouse_life_expectancy_value:
				formData.isMarried && formData.spouseLifeExpectancyType === "fixed"
					? Number(formData.spouseLifeExpectancyValue)
					: null,
			spouse_life_expectancy_mean:
				formData.isMarried && formData.spouseLifeExpectancyType === "normal"
					? Number(formData.spouseLifeExpectancyMean)
					: null,
			spouse_life_expectancy_std_dev:
				formData.isMarried && formData.spouseLifeExpectancyType === "normal"
					? Number(formData.spouseLifeExpectancyStdDev)
					: null,
			inflation_assumption_type: formData.inflationAssumptionType,
			inflation_assumption_value:
				formData.inflationAssumptionType === "fixed" ? Number(formData.inflationAssumptionValue) : null,
			inflation_assumption_mean:
				formData.inflationAssumptionType === "normal" ? Number(formData.inflationAssumptionMean) : null,
			inflation_assumption_std_dev:
				formData.inflationAssumptionType === "normal" ? Number(formData.inflationAssumptionStdDev) : null,
			inflation_assumption_upper:
				formData.inflationAssumptionType === "uniform" ? Number(formData.inflationAssumptionUpper) : null,
			inflation_assumption_lower:
				formData.inflationAssumptionType === "uniform" ? Number(formData.inflationAssumptionLower) : null,
			after_tax_contribution_limit: Number(formData.afterTaxContributionLimit),
			is_roth_optimizer_enabled: formData.isRothOptimizerEnabled,
			roth_start_year: formData.isRothOptimizerEnabled ? Number(formData.rothStartYear) : null,
			roth_end_year: formData.isRothOptimizerEnabled ? Number(formData.rothEndYear) : null,
			financial_goal: Number(formData.financialGoal),
			state_of_residence: formData.stateOfResidence,
		};

		try {
			await editScenario(updatedScenarioPayload);
			navigate("/scenarios");
		} catch (error) {
			console.error("Error updating scenario:", error);
		}
	};

	return (
		<main>
			<form onSubmit={handleSubmit} className="form-container">
				<h2>Edit Scenario</h2>
				<div className="form-group">
					<label>Name:</label>
					<input type="text" name="name" value={formData.name} onChange={handleChange} required />
				</div>

				<div className="form-group">
					<label>Marital Status:</label>
					<input type="checkbox" name="isMarried" checked={formData.isMarried} onChange={handleChange} />
					Married
				</div>

				<div className="form-group">
					<label>Birth Year:</label>
					<input type="number" name="birthYear" value={formData.birthYear} onChange={handleChange} required />
				</div>

				{formData.isMarried && (
					<>
						<div className="form-group">
							<label>Spouse Birth Year:</label>
							<input
								type="number"
								name="birthYearSpouse"
								value={formData.birthYearSpouse}
								onChange={handleChange}
								required
							/>
						</div>
						<div className="form-group">
							<label>Spouse Life Expectancy Type:</label>
							<select
								name="spouseLifeExpectancyType"
								value={formData.spouseLifeExpectancyType}
								onChange={handleChange}
								required>
								<option value=""></option>
								<option value="fixed">Fixed</option>
								<option value="normal">Normal</option>
							</select>
						</div>
						{formData.spouseLifeExpectancyType === "fixed" && (
							<div className="form-group">
								<label>Spouse Life Expectancy Value:</label>
								<input
									type="number"
									name="spouseLifeExpectancyValue"
									value={formData.spouseLifeExpectancyValue}
									onChange={handleChange}
									required
								/>
							</div>
						)}
						{formData.spouseLifeExpectancyType === "normal" && (
							<>
								<div className="form-group">
									<label>Spouse Life Expectancy Mean:</label>
									<input
										type="number"
										name="spouseLifeExpectancyMean"
										value={formData.spouseLifeExpectancyMean}
										onChange={handleChange}
										required
									/>
								</div>
								<div className="form-group">
									<label>Spouse Life Expectancy Std Dev:</label>
									<input
										type="number"
										name="spouseLifeExpectancyStdDev"
										value={formData.spouseLifeExpectancyStdDev}
										onChange={handleChange}
										required
									/>
								</div>
							</>
						)}
					</>
				)}

				<div className="form-group">
					<label>Life Expectancy Type:</label>
					<select
						name="lifeExpectancyType"
						value={formData.lifeExpectancyType}
						onChange={handleChange}
						required>
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
							required
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
								required
							/>
						</div>
						<div className="form-group">
							<label>Life Expectancy Std Dev:</label>
							<input
								type="number"
								name="lifeExpectancyStdDev"
								value={formData.lifeExpectancyStdDev}
								onChange={handleChange}
								required
							/>
						</div>
					</>
				)}

				<div className="form-group">
					<label>Inflation Assumption Type:</label>
					<select
						name="inflationAssumptionType"
						value={formData.inflationAssumptionType}
						onChange={handleChange}
						required>
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
							required
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
								required
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
								required
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
								required
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
								required
							/>
						</div>
					</>
				)}

				<div className="form-group">
					<label>After-Tax Contribution Limit:</label>
					<input
						type="number"
						name="afterTaxContributionLimit"
						value={formData.afterTaxContributionLimit}
						onChange={handleChange}
						required
					/>
				</div>

				<div className="form-group">
					<label>Is Roth Optimizer Enabled?:</label>
					<input
						type="checkbox"
						name="isRothOptimizerEnabled"
						checked={formData.isRothOptimizerEnabled}
						onChange={handleChange}
					/>
					Roth Optimizer Enabled
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
								required
							/>
						</div>
						<div className="form-group">
							<label>Roth End Year:</label>
							<input
								type="number"
								name="rothEndYear"
								value={formData.rothEndYear}
								onChange={handleChange}
								required
							/>
						</div>
					</>
				)}

				<div className="form-group">
					<label>Financial Goal:</label>
					<input
						type="number"
						name="financialGoal"
						value={formData.financialGoal}
						onChange={handleChange}
						required
					/>
				</div>

				<div className="form-group">
					<label>State of Residence:</label>
					<input
						type="text"
						name="stateOfResidence"
						value={formData.stateOfResidence}
						onChange={handleChange}
						required
					/>
				</div>

				<button type="submit" className="submit-btn">
					Update Scenario
				</button>
			</form>
		</main>
	);
}
