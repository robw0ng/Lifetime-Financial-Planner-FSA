const router = require("express").Router();
require("dotenv").config();
const db = require("../models");
const { Scenario, Investment, InvestmentType, EventSeries } = db;

// Get specific scenario
//router.get("/:", async (req, res) => {});

// Get all scenarios for logged in user
router.get("/", async (req, res) => {
	const { user } = req.session;
	if (!user) {
		return res.status(401).json("User not authenticated");
	}

	try {
		const allScenarios = await Scenario.findAll({
			where: { user_id: user.id },
			include: [{ model: Investment }, { model: InvestmentType }, { model: EventSeries }],
		});
		res.status(200).json(allScenarios);
	} catch (err) {
		res.status(400).json(err.message);
		console.log(err.message);
	}
});

// Create new scenario for logged in user
router.post("/", async (req, res) => {
	const { user } = req.session;
	if (!user) {
		return res.status(401).json("User not authenticated");
	}

	const {
		name,
		is_married,
		birth_year,
		spouse_birth_year,
		life_expectancy_type,
		life_expectancy_value,
		life_expectancy_mean,
		life_expectancy_std_dev,
		spouse_life_expectancy_type,
		spouse_life_expectancy_value,
		spouse_life_expectancy_mean,
		spouse_life_expectancy_std_dev,
		inflation_assumption_type,
		inflation_assumption_value,
		inflation_assumption_mean,
		inflation_assumption_std_dev,
		inflation_assumption_upper,
		inflation_assumption_lower,
		after_tax_contribution_limit,
		is_roth_optimizer_enabled,
		roth_start_year,
		roth_end_year,
		financial_goal,
		state_of_residence,
	} = req.body;

	try {
		const newScenario = await Scenario.create({
			name,
			is_married,
			birth_year: Number(birth_year),
			spouse_birth_year: is_married && spouse_birth_year ? Number(spouse_birth_year) : null,
			// Life Expectancy for user
			life_expectancy_type,
			life_expectancy_value: life_expectancy_type === "fixed" ? Number(life_expectancy_value) : null,
			life_expectancy_mean: life_expectancy_type === "normal" ? Number(life_expectancy_mean) : null,
			life_expectancy_std_dev: life_expectancy_type === "normal" ? Number(life_expectancy_std_dev) : null,
			// Life Expectancy for spouse
			spouse_life_expectancy_type: is_married ? spouse_life_expectancy_type : null,
			spouse_life_expectancy_value:
				is_married && spouse_life_expectancy_type === "fixed" && spouse_life_expectancy_value
					? Number(spouse_life_expectancy_value)
					: null,
			spouse_life_expectancy_mean:
				is_married && spouse_life_expectancy_type === "normal" && spouse_life_expectancy_mean
					? Number(spouse_life_expectancy_mean)
					: null,
			spouse_life_expectancy_std_dev:
				is_married && spouse_life_expectancy_type === "normal" && spouse_life_expectancy_std_dev
					? Number(spouse_life_expectancy_std_dev)
					: null,
			// Inflation Assumption
			inflation_assumption_type,
			inflation_assumption_value:
				inflation_assumption_type === "fixed" && inflation_assumption_value
					? Number(inflation_assumption_value)
					: null,
			inflation_assumption_mean:
				inflation_assumption_type === "normal" && inflation_assumption_mean
					? Number(inflation_assumption_mean)
					: null,
			inflation_assumption_std_dev:
				inflation_assumption_type === "normal" && inflation_assumption_std_dev
					? Number(inflation_assumption_std_dev)
					: null,
			inflation_assumption_upper:
				inflation_assumption_type === "uniform" && inflation_assumption_upper
					? Number(inflation_assumption_upper)
					: null,
			inflation_assumption_lower:
				inflation_assumption_type === "uniform" && inflation_assumption_lower
					? Number(inflation_assumption_lower)
					: null,
			after_tax_contribution_limit: Number(after_tax_contribution_limit),
			is_roth_optimizer_enabled,
			roth_start_year: is_roth_optimizer_enabled ? roth_start_year : null,
			roth_end_year: is_roth_optimizer_enabled ? roth_end_year : null,
			financial_goal: Number(financial_goal),
			state_of_residence,
			// strategies not given => set them as empty arrays
			spending_strategy: [],
			expense_withdrawl_strategy: [],
			rmd_strategy: [],
			roth_conversion_strategy: [],
			// Associate with authenticated user
			user_id: user.id,
		});
		res.status(201).json({ scenario: newScenario });
	} catch (err) {
		res.status(400).json(err.message);
		console.log(err.message);
	}
});

// Modify existing scenario (using id)
router.put("/edit/:id", async (req, res) => {
	const { user } = req.session;
	if (!user) {
		return res.status(401).json("User not authenticated");
	}

	const id = req.params.id;
	const fieldsToUpdate = req.body;
	try {
		const scenario = await Scenario.findOne({ where: { id, user_id: user.id } });
		if (!scenario) {
			return res.status(404).json("Scenario not found");
		}

		await scenario.update(fieldsToUpdate);
		res.status(200).json({ scenario });
	} catch (err) {
		res.status(400).json(err.message);
		console.log(err.message);
	}
});

// Delete existing scenario (using id)
router.delete("/delete/:id", async (req, res) => {
	const { user } = req.session;
	if (!user) {
		return res.status(401).json("User not authenticated");
	}

	const id = req.params.id;
	try {
		const scenario = await Scenario.findOne({ where: { id, user_id: user.id } });
		if (!scenario) {
			return res.status(404).json("Scenario not found");
		}

		await scenario.destroy();
		res.status(200).json("Scenario deleted successfully");
	} catch (err) {
		res.status(400).json(err.message);
		console.log(err.message);
	}
});

// Duplicate existing scenario (using id)
router.post("/duplicate/:id", async (req, res) => {
	const id = req.params.id;
	try {
		const scenario = await Scenario.findOne({ where: { id } });
		if (!scenario) {
			return res.status(404).json("Scenario not found");
		}

		const duplicatedScenario = await Scenario.create({
			...scenario.get(),
			id: undefined, // Ensure new scenario gets a unique ID
			name: `${scenario.name} (Copy)`,
		});

		res.status(201).json({ scenario: duplicatedScenario });
	} catch (err) {
		res.status(400).json(err.message);
		console.log(err.message);
	}
});

module.exports = router;
