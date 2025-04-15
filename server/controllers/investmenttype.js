const router = require("express").Router();
require("dotenv").config();
const db = require("../models");
const { Scenario, Investment, InvestmentType } = db;

// Get all investment types for given scenario
router.get("/:scenarioId", async (req, res) => {
	const scenario_id = req.params.scenarioId;

	try {
		const allInvestmentTypes = await InvestmentType.findAll({
			where: { scenario_id },
			include: [{ model: Investment, as: "Investments" }],
		});
		res.status(200).json(allInvestmentTypes);
	} catch (err) {
		res.status(400).json(err.message);
		console.log(err.message);
	}
});

// Create new investment type for given scenario (VALIDATE USER)
router.post("/:scenarioId", async (req, res) => {
	const { user } = req.session;
	if (!user) {
		return res.status(401).json("User not found");
	}
	const scenario_id = req.params.scenarioId;
	const canUser = await Scenario.findOne({ where: { id: scenario_id, user_id: user.id } });
	if (!canUser) {
		return res.status(401).json("User not authenticated");
	}

	const {
		name,
		description,
		expected_change_type,
		expected_change_value,
		expected_change_mean,
		expected_change_std_dev,
		expense_ratio,
		expected_income_type,
		expected_income_value,
		expected_income_mean,
		expected_income_std_dev,
		taxability,
	} = req.body;

	try {
		const newInvestmentType = await InvestmentType.create({
			name,
			description: description ? description : null,
			// Expected change
			expected_change_type,
			expected_change_value: expected_change_type === "fixed" ? Number(expected_change_value) : null,
			expected_change_mean: expected_change_type === "normal" ? Number(expected_change_mean) : null,
			expected_change_std_dev: expected_change_type === "normal" ? Number(expected_change_std_dev) : null,
			expense_ratio: Number(expense_ratio),
			// Expected Income
			expected_income_type,
			expected_income_value: expected_income_type === "fixed" ? Number(expected_income_value) : null,
			expected_income_mean: expected_income_type === "normal" ? Number(expected_income_mean) : null,
			expected_income_std_dev: expected_income_type === "normal" ? Number(expected_income_std_dev) : null,
			taxability,
			// Associate with scenario
			scenario_id: canUser.id,
		});

		const createdInvestmentType = await InvestmentType.findOne({
			where: { id: newInvestmentType.id },
			include: [{ model: Investment, as: "Investments" }],
		});
		res.status(201).json({ investmentType: createdInvestmentType });
	} catch (err) {
		res.status(400).json(err.message);
		console.log(err.message);
	}
});

// Modify existing investment type for given id (VALIDATE USER)
router.put("/edit/:scenarioId/:id", async (req, res) => {
	const { user } = req.session;
	if (!user) {
		return res.status(401).json("User not found");
	}
	const scenario_id = req.params.scenarioId;
	const id = req.params.id;
	const canUser = await Scenario.findOne({ where: { id: scenario_id, user_id: user.id } });
	if (!canUser) {
		return res.status(401).json("User not authenticated");
	}

	const fieldsToUpdate = req.body;
	try {
		const investmentType = await InvestmentType.findOne({ where: { id } });
		if (!investmentType) {
			return res.status(404).json("Investment type not found");
		}
		if (investmentType.is_locked){
			return res.status(403).json("Investment Type is locked and cannot be edited");
		}

		await investmentType.update(fieldsToUpdate);
		const populatedInvestmentType = await InvestmentType.findOne({
			where: { id },
			include: [{ model: Investment, as: "Investments" }],
		});
		res.status(200).json({ investmentType: populatedInvestmentType });
	} catch (err) {
		res.status(400).json(err.message);
		console.log(err.message);
	}
});

// Delete investment type and cleanup
router.delete("/delete/:scenarioId/:id", async (req, res) => {
	const { user } = req.session;
	if (!user) return res.status(401).json("User not found");

	const scenario_id = req.params.scenarioId;
	const typeId = req.params.id;

	const canUser = await Scenario.findOne({ where: { id: scenario_id, user_id: user.id } });
	if (!canUser) return res.status(401).json("User not authenticated");

	try {
		const investmentType = await InvestmentType.findOne({
			where: { id: typeId, scenario_id },
		});
		if (!investmentType) return res.status(404).json("Investment type not found");
		if (investmentType.is_locked){
			return res.status(403).json("Investment Type is locked and cannot be edited");
		}

		// Step 1: Find all related investments
		const investmentsToDelete = await Investment.findAll({
			where: { investment_type_id: typeId, scenario_id },
		});

		// Step 2: Get their special_ids to remove from strategies
		const specialIds = investmentsToDelete.map((inv) => inv.special_id);

		// Step 3: Remove from strategy arrays
		const updatedExpenseStrategy = (canUser.expense_withdrawl_strategy || []).filter(
			(id) => !specialIds.includes(id)
		);
		const updatedRothStrategy = (canUser.roth_conversion_strategy || []).filter((id) => !specialIds.includes(id));
		const updatedRmdStrategy = (canUser.rmd_strategy || []).filter((id) => !specialIds.includes(id));

		// Step 4: Delete all investments
		await Investment.destroy({
			where: { investment_type_id: typeId, scenario_id },
		});

		// Step 5: Delete the investment type itself
		await investmentType.destroy();

		// Step 6: Save updated strategies to the scenario
		await Scenario.update(
			{
				expense_withdrawl_strategy: updatedExpenseStrategy,
				roth_conversion_strategy: updatedRothStrategy,
				rmd_strategy: updatedRmdStrategy,
			},
			{ where: { id: scenario_id } }
		);

		res.status(200).json("Investment type and related investments deleted successfully");
	} catch (err) {
		console.error(err);
		res.status(400).json(err.message);
	}
});

// Duplicate existing investment type for given id
router.post("/duplicate/:scenarioId/:id", async (req, res) => {
	const { user } = req.session;
	const id = req.params.id;
	const scenario_id = req.params.scenarioId;
	if (!user) {
		return res.status(401).json("User not authenticated");
	}
	const canUser = await Scenario.findOne({ where: { id: scenario_id, user_id: user.id } });
	if (!canUser) {
		return res.status(401).json("User not authenticated");
	}

	try {
		const investmentType = await InvestmentType.findOne({
			where: { id, scenario_id },
			include: [{ model: Investment, as: "Investments" }],
		});
		if (!investmentType) {
			return res.status(404).json("Investment type not found");
		}

		const duplicatedInvestmentType = await InvestmentType.create({
			...investmentType.toJSON(),
			id: undefined,
			name: `${investmentType.name} (Copy)`,
			scenario_id: canUser.id,
		});

		// // duplicate corresponding Investments
		// const duplicatedInvestments = await Promise.all(
		// 	investmentType.Investments.map((investment) =>
		// 		Investment.create({
		// 			...investment.toJSON(),
		// 			id: undefined, // Ensure new ID
		// 			special_id: `${investmentType.name} ${investment.tax_status}`,
		// 			investment_type_id: duplicatedInvestmentType.id, // Link to duplicated InvestmentType
		// 			scenario_id: canUser.id,
		// 		})
		// 	)
		// );

		const fullInvestmentType = await InvestmentType.findOne({
			where: { id: duplicatedInvestmentType.id, scenario_id: canUser.id },
			include: [{ model: Investment, as: "Investments" }],
		});
		res.status(201).json({ investmentType: fullInvestmentType });
	} catch (err) {
		res.status(400).json(err.message);
		console.log(err.message);
	}
});

module.exports = router;
