const router = require("express").Router();
require("dotenv").config();
const db = require("../models");
const { Scenario, Investment, InvestmentType } = db;

// Middleware: Auth check
const requireAuth = async (req, res, next) => {
	const { user } = req.session;
	if (!user) return res.status(401).json("User not authenticated");
	req.user = user;
	next();
};

// Helper: validate scenario ownership
const validateScenarioOwnership = async (userId, scenarioId) => {
	return await Scenario.findOne({ where: { id: scenarioId, user_id: userId } });
};

// Create Investment (with strategy handling)
router.post("/:scenarioId", requireAuth, async (req, res) => {
	const scenario_id = req.params.scenarioId;
	const user = req.user;

	const scenario = await validateScenarioOwnership(user.id, scenario_id);
	if (!scenario) return res.status(401).json("Unauthorized access to scenario");

	const { special_id, value, tax_status, investment_type_id } = req.body;

	if (!special_id || !value || !tax_status || !investment_type_id) {
		return res.status(400).json("Missing required fields");
	}

	try {
		// Make sure the investment type exists for this scenario
		const investmentType = await InvestmentType.findOne({
			where: { id: investment_type_id, scenario_id },
		});
		if (!investmentType) return res.status(404).json("Investment type not found");

		// Create the investment
		const newInvestment = await Investment.create({
			special_id,
			value: Number(value),
			tax_status,
			investment_type_id,
			scenario_id,
		});

		// Fetch existing strategies from scenario
		const expenseStrategy = scenario.expense_withdrawl_strategy || [];
		const rothStrategy = scenario.roth_conversion_strategy || [];
		const rmdStrategy = scenario.rmd_strategy || [];

		// Add investment id to expense strategy
		const updatedExpenseStrategy = [...expenseStrategy, newInvestment.id];

		// If tax_status is PTR, add to Roth + RMD strategies
		const isPTR = tax_status === "PTR";
		const updatedRothStrategy = isPTR ? [...rothStrategy, newInvestment.id] : rothStrategy;
		const updatedRmdStrategy = isPTR ? [...rmdStrategy, newInvestment.id] : rmdStrategy;

		// Update scenario strategies
		await Scenario.update(
			{
				expense_withdrawl_strategy: updatedExpenseStrategy,
				roth_conversion_strategy: updatedRothStrategy,
				rmd_strategy: updatedRmdStrategy,
			},
			{ where: { id: scenario_id } }
		);

		// Fetch full investment with type
		const fullInvestment = await Investment.findOne({
			where: { id: newInvestment.id },
			include: [{ model: InvestmentType, as: "InvestmentType" }],
		});

		return res.status(201).json({ investment: fullInvestment });
	} catch (err) {
		console.error(err);
		return res.status(400).json(err.message);
	}
});

router.put("/edit/:scenarioId/:id", requireAuth, async (req, res) => {
	const { scenarioId, id } = req.params;
	const user = req.user;

	const scenario = await Scenario.findOne({ where: { id: scenarioId, user_id: user.id } });
	if (!scenario) return res.status(401).json("Unauthorized access to scenario");

	const { value, tax_status, investment_type_id } = req.body;

	if (!value || !tax_status || !investment_type_id) {
		return res.status(400).json("Missing required fields");
	}

	try {
		const investment = await Investment.findOne({
			where: { id, scenario_id: scenarioId },
		});
		if (!investment) return res.status(404).json("Investment not found");
		if (investment.is_locked){
			return res.status(403).json("Investment is locked and cannot be edited");
		}
		// Update the investment
		await investment.update({
			value: Number(value),
			tax_status,
			investment_type_id,
		});

		const investment_id = investment.id;

		// Pull current strategies
		let updatedExpense = (scenario.expense_withdrawl_strategy || []).filter((id) => id !== investment_id);
		let updatedRoth = (scenario.roth_conversion_strategy || []).filter((id) => id !== investment_id);
		let updatedRmd = (scenario.rmd_strategy || []).filter((id) => id !== investment_id);

		// Always add to expense strategy
		updatedExpense.push(investment_id);

		// Add to Roth and RMD if PTR
		if (tax_status === "PTR") {
			updatedRoth.push(investment_id);
			updatedRmd.push(investment_id);
		}

		// Update scenario
		await Scenario.update(
			{
				expense_withdrawl_strategy: updatedExpense,
				roth_conversion_strategy: updatedRoth,
				rmd_strategy: updatedRmd,
			},
			{ where: { id: scenarioId } }
		);

		// Fetch full updated investment
		const updated = await Investment.findOne({
			where: { id },
			include: [{ model: InvestmentType, as: "InvestmentType" }],
		});

		return res.status(200).json({ investment: updated });
	} catch (err) {
		console.error(err);
		return res.status(400).json(err.message);
	}
});

router.post("/duplicate/:scenarioId/:id", requireAuth, async (req, res) => {
	const { scenarioId, id } = req.params;
	const user = req.user;

	// Check ownership of scenario
	const scenario = await Scenario.findOne({ where: { id: scenarioId, user_id: user.id } });
	if (!scenario) return res.status(401).json("Unauthorized access to scenario");

	try {
		// Find original investment
		const original = await Investment.findOne({
			where: { id, scenario_id: scenarioId },
			include: [{ model: InvestmentType, as: "InvestmentType" }],
		});
		if (!original) return res.status(404).json("Original investment not found");

		// Generate a new special_id
		const newSpecialId = `${Date.now()}`;

		// Create the duplicate
		const duplicatedInvestment = await Investment.create({
			special_id: newSpecialId,
			value: original.value,
			tax_status: original.tax_status,
			investment_type_id: original.investment_type_id,
			scenario_id: scenarioId,
		});

		const duplicated_id = duplicatedInvestment.id;

		// Add the duplicate to strategy arrays
		const updatedExpense = [...(scenario.expense_withdrawl_strategy || []), duplicated_id];
		const updatedRoth =
			original.tax_status === "PTR"
				? [...(scenario.roth_conversion_strategy || []), duplicated_id]
				: scenario.roth_conversion_strategy || [];
		const updatedRmd =
			original.tax_status === "PTR"
				? [...(scenario.rmd_strategy || []), duplicated_id]
				: scenario.rmd_strategy || [];

		// Update the scenario's strategies
		await Scenario.update(
			{
				expense_withdrawl_strategy: updatedExpense,
				roth_conversion_strategy: updatedRoth,
				rmd_strategy: updatedRmd,
			},
			{ where: { id: scenarioId } }
		);

		const duplicate = await Investment.findOne({
			where: { id: duplicatedInvestment.id },
			include: [{ model: InvestmentType, as: "InvestmentType" }],
		});

		res.status(201).json({ investment: duplicate });
	} catch (err) {
		console.error("Error duplicating investment:", err);
		res.status(400).json(err.message);
	}
});

router.delete("/delete/:scenarioId/:id", requireAuth, async (req, res) => {
	const { scenarioId, id } = req.params;
	const user = req.user;

	// Check ownership of scenario
	const scenario = await Scenario.findOne({ where: { id: scenarioId, user_id: user.id } });
	if (!scenario) return res.status(401).json("Unauthorized access to scenario");

	try {
		// Find the investment to delete
		const investment = await Investment.findOne({
			where: { id, scenario_id: scenarioId },
		});
		if (!investment) return res.status(404).json("Investment not found");
		if (investment.is_locked){
			return res.status(403).json("Investment is locked and cannot be edited");
		}

		const specialId = investment.special_id;
		const investment_id = investment.id;

		// Remove special_id from strategy arrays
		const updatedExpense = (scenario.expense_withdrawl_strategy || []).filter((id) => id !== investment_id);
		const updatedRoth = (scenario.roth_conversion_strategy || []).filter((id) => id !== investment_id);
		const updatedRmd = (scenario.rmd_strategy || []).filter((id) => id !== investment_id);

		// Delete the investment
		await investment.destroy();

		// Update the scenario’s strategy arrays
		await Scenario.update(
			{
				expense_withdrawl_strategy: updatedExpense,
				roth_conversion_strategy: updatedRoth,
				rmd_strategy: updatedRmd,
			},
			{ where: { id: scenarioId } }
		);

		res.status(200).json("Investment deleted and strategies updated.");
	} catch (err) {
		console.error("Error deleting investment:", err);
		res.status(400).json(err.message);
	}
});

module.exports = router;
