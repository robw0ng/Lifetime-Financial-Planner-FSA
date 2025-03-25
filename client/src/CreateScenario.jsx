import { useState } from "react";
import "./CreateScenario.css";
import { useNavigate } from "react-router-dom";
import { useSelectedScenario } from "./SelectedContext";

export default function CreateScenario() {
	const { setSelectedScenario } = useSelectedScenario();
	const [formData, setFormData] = useState({
		name: "",
		isMarried: false,
		birthYear: "",
		birthYearSpouse: "",
		// Life Expectancy for user:
		lifeExpectancyType: "fixed", // options: 'fixed' or 'normal'
		lifeExpectancyValue: "",
		lifeExpectancyMean: "",
		lifeExpectancyStdDev: "",
		// Life Expectancy for spouse:
		spouseLifeExpectancyType: "fixed", // options: 'fixed' or 'normal'
		spouseLifeExpectancyValue: "",
		spouseLifeExpectancyMean: "",
		spouseLifeExpectancyStdDev: "",
		// Inflation Assumption:
		inflationAssumptionType: "fixed", // options: 'fixed', 'normal', or 'uniform'
		inflationAssumptionValue: "",
		inflationAssumptionMean: "",
		inflationAssumptionStdDev: "",
		inflationAssumptionUpper: "",
		inflationAssumptionLower: "",
		afterTaxContributionLimit: "",
		financialGoal: "",
		stateOfResidence: "",
	});

	const navigate = useNavigate(); // Add useNavigate for redirection

	const handleChange = (e) => {
		const { name, value, type, checked } = e.target;
		setFormData((prev) => ({
			...prev,
			[name]: type === "checkbox" ? checked : value,
		}));
	};

	const handleSubmit = async (e) => {
		e.preventDefault();

		// Initialize empty data structures
		const newScenario = {
			name: formData.name,
			is_married: formData.isMarried,
			birth_year: Number(formData.birthYear),
			spouse_birth_year: formData.isMarried && formData.birthYearSpouse ? Number(formData.birthYearSpouse) : null,
			// Life Expectancy for user:
			life_expectancy_type: formData.lifeExpectancyType,
			life_expectancy_value:
				formData.lifeExpectancyType === "fixed" ? Number(formData.lifeExpectancyValue) : null,
			life_expectancy_mean: formData.lifeExpectancyType === "normal" ? Number(formData.lifeExpectancyMean) : null,
			life_expectancy_std_dev:
				formData.lifeExpectancyType === "normal" ? Number(formData.lifeExpectancyStdDev) : null,
			// Life Expectancy for spouse:
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
			// Inflation Assumption:
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
			financial_goal: Number(formData.financialGoal),
			state_of_residence: formData.stateOfResidence,
			// strategies are empty initially
			spending_strategy: [],
			expense_withdrawl_strategy: [],
			rmd_strategy: [],
			roth_conversion_strategy: [],
		};
		// TODO: Send data to API endpoint
		// send the data to the end point. get the newly created as the response.
		// then use setSelectedScenario on the new obj
		try {
			const response = await fetch("http://localhost:5173/scenarios", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(newScenario),
			});

			const data = await response.json();
			if (response.status == 201) {
				const newScenario = data.scenario;
				console.log("Scenario Data:", newScenario);
				setSelectedScenario(newScenario);
				navigate("/scenarios");
			} else {
				console.log("Scenario creation failure:", data);
			}
		} catch (err) {
			console.log("Error during scenario creation:", err.message);
		}

		// Reset the form
		setFormData({
			name: "",
			isMarried: false,
			birthYear: "",
			birthYearSpouse: "",
			lifeExpectancyType: "fixed",
			lifeExpectancyValue: "",
			lifeExpectancyMean: "",
			lifeExpectancyStdDev: "",
			spouseLifeExpectancyType: "fixed",
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
			financialGoal: "",
			stateOfResidence: "",
		});
	};

	return (
		<main>
			<form onSubmit={handleSubmit} className="form-container">
				<h2>Create New Scenario</h2>
				<div className="form-group">
					<label>Name:</label>
					<input type="text" name="name" value={formData.name} onChange={handleChange} required />
				</div>
				<div className="form-group">
					<label>Marital Status:</label>
					<input
						type="checkbox"
						name="isMarried"
						checked={formData.isMarried}
						onChange={handleChange}
						required
					/>{" "}
					Married
				</div>
				<div className="form-group">
					<label>Birth Year:</label>
					<input type="number" name="birthYear" value={formData.birthYear} onChange={handleChange} required />
				</div>
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
					Create Scenario
				</button>
			</form>
		</main>
	);
}
