import { useState } from "react";
import "./CreateScenario.css";
import { useNavigate } from "react-router-dom";
import { useData } from "./DataContext";

export default function CreateScenario() {
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
		spouseLifeExpectancyType: "", // options: 'fixed' or 'normal'
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
		isRothOptimizerEnabled: false,
		rothStartYear: "",
		rothEndYear: "",
		financialGoal: "",
		stateOfResidence: "",
	});

	const { createScenario } = useData(); // Use createScenario from context
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
			isMarried: formData.isMarried,
			birthYear: Number(formData.birthYear),
			birthYearSpouse: formData.isMarried ? Number(formData.birthYearSpouse) : null,
			// Life Expectancy for user:
			lifeExpectancyType: formData.lifeExpectancyType,
			lifeExpectancyValue:
				formData.lifeExpectancyType === "fixed" ? Number(formData.lifeExpectancyValue) : null,
      lifeExpectancyMean: formData.lifeExpectancyType === "normal" ? Number(formData.lifeExpectancyMean) : null,
			lifeExpectancyStdDev:
				formData.lifeExpectancyType === "normal" ? Number(formData.lifeExpectancyStdDev) : null,
			// Life Expectancy for spouse:
			spouseLifeExpectancyType: formData.isMarried ? formData.spouseLifeExpectancyType : null,
			spouseLifeExpectancyType:
				formData.isMarried && formData.spouseLifeExpectancyType === "fixed"
					? Number(formData.spouseLifeExpectancyValue)
					: null,
      spouseLifeExpectancyMean:
				formData.isMarried && formData.spouseLifeExpectancyType === "normal"
					? Number(formData.spouseLifeExpectancyMean)
					: null,
      spouseLifeExpectancyStdDev:
				formData.isMarried && formData.spouseLifeExpectancyType === "normal"
					? Number(formData.spouseLifeExpectancyStdDev)
					: null,
			// Inflation Assumption:
			inflationAssumptionType: formData.inflationAssumptionType,
			inflationAssumptionValue:
				formData.inflationAssumptionType === "fixed" ? Number(formData.inflationAssumptionValue) : null,
      inflationAssumptionMean:
				formData.inflationAssumptionType === "normal" ? Number(formData.inflationAssumptionMean) : null,
      inflationAssumptionStdDev:
				formData.inflationAssumptionType === "normal" ? Number(formData.inflationAssumptionStdDev) : null,
      inflationAssumptionUpper:
				formData.inflationAssumptionType === "uniform" ? Number(formData.inflationAssumptionUpper) : null,
      inflationAssumptionLower:
				formData.inflationAssumptionType === "uniform" ? Number(formData.inflationAssumptionLower) : null,
      afterTaxContributionLimit: Number(formData.afterTaxContributionLimit),
			isRothOptimizerEnabled: formData.isRothOptimizerEnabled,
			rothStartYear: formData.isRothOptimizerEnabled ? Number(formData.rothStartYear) : null,
			rothEndYear: formData.isRothOptimizerEnabled ? Number(formData.rothEndYear) : null,
			financialGoal: Number(formData.financialGoal),
			stateOfResidence: formData.stateOfResidence,
			// strategies are empty initially
			spendingStrategy: [],
			expenseWithdrawalStrategy: [],
			rmdStrategy: [],
			rothConversionStrategy: [],
      investments: new Set(),
      events: new Set(),
		};
		// TODO: Send data to API endpoint
		// send the data to the end point. get the newly created as the response.
		// then use setSelectedScenario on the new obj
		try {
			await createScenario(newScenario);
			navigate("/scenarios");
		} catch (err) {
			console.log("Error during scenario creation:", err.message);
		}

		// Reset the form
		setFormData({
			name: "",
			isMarried: false,
			birthYear: "",
			birthYearSpouse: "",
			lifeExpectancyType: "fixed", // options: 'fixed' or 'normal'
			lifeExpectancyValue: "",
			lifeExpectancyMean: "",
			lifeExpectancyStdDev: "",
			spouseLifeExpectancyType: "", // options: 'fixed' or 'normal'
			spouseLifeExpectancyValue: "",
			spouseLifeExpectancyMean: "",
			spouseLifeExpectancyStdDev: "",
			inflationAssumptionType: "fixed", // options: 'fixed', 'normal', or 'uniform'
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
					<input type="checkbox" name="isMarried" checked={formData.isMarried} onChange={handleChange} />{" "}
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
					/>{" "}
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
					Create Scenario
				</button>
			</form>
		</main>
	);
}
