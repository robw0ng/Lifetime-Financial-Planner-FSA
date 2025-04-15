const express = require("express");
const router = express.Router();
const db = require("../models");
const { Scenario } = db;

const requireAuth = async (req, res, next) => {
	const { user } = req.session;
	if (!user) return res.status(401).json("User not authenticated");
	req.user = user;
	next();
};
const validStrategyKeys = [
	"expense_withdrawl_strategy",
	"roth_conversion_strategy",
	"rmd_strategy",
	"spending_strategy",
];

router.put("/:scenarioId/:strategyKey", requireAuth, async (req, res) => {
	const { scenarioId, strategyKey } = req.params;
	const { strategy } = req.body;
	const user = req.user;

	if (!validStrategyKeys.includes(strategyKey)) {
		return res.status(400).json("Invalid strategy key");
	}

	if (!Array.isArray(strategy)) {
		return res.status(400).json("Strategy must be an array");
	}

	try {
		const scenario = await Scenario.findOne({
			where: { id: scenarioId, user_id: user.id },
		});

		if (!scenario) {
			return res.status(404).json("Scenario not found or access denied");
		}

		await Scenario.update({ [strategyKey]: strategy }, { where: { id: scenarioId } });

		return res.status(200).json("Strategy updated successfully");
	} catch (err) {
		console.error("Error updating strategy:", err);
		return res.status(500).json(err.message);
	}
});

module.exports = router;
