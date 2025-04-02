const router = require("express").Router();
require("dotenv").config();
const db = require("../models");
const { Scenario, EventSeries, IncomeEventSeries, ExpenseEventSeries, InvestEventSeries, RebalanceEventSeries } = db;

// Get all eventseries for given scenario
router.get("/:id", async (req, res) => {
	const id = req.params.id;

	try {
		const allEventSeries = await EventSeries.findAll({
			where: { scenario_id: id },
			include: [
				{ model: IncomeEventSeries },
				{ model: ExpenseEventSeries },
				{ model: InvestEventSeries },
				{ model: RebalanceEventSeries },
			],
		});
		res.status(200).json(allEventSeries);
	} catch (err) {
		res.status(400).json(err.message);
		console.log(err.message);
	}
});

// Create new eventseries for given scenario (VALIDATE USER)
router.post("/:id", async (req, res) => {
	const { user } = req.session;
	if (!user) {
		return res.status(401).json("User not found");
	}
	const id = req.params.id;
	const canUser = await Scenario.findOne({ where: { id, user_id: user.id } });
	if (!canUser) {
		return res.status(401).json("User not authenticated");
	}

	const {
		name,
		description,
		type,
		start_year_type,
		start_year_value,
		start_year_mean,
		start_year_std_dev,
		start_year_lower,
		start_year_upper,
		start_year_other_event,
		duration_type,
		duration_value,
		duration_mean,
		duration_std_dev,
		duration_lower,
		duration_upper,
	} = req.body;

	try {
		const newEventSeries = await EventSeries.create({
			name,
			description: description ? description : null,
			type,
			// Start Year
			start_year_type,
			start_year_value: start_year_type === "fixed" ? Number(start_year_value) : null,
			start_year_mean: start_year_type === "normal" ? Number(start_year_mean) : null,
			start_year_std_dev: start_year_type === "normal" ? Number(start_year_std_dev) : null,
			start_year_lower: start_year_type === "uniform" ? Number(start_year_lower) : null,
			start_year_upper: start_year_type === "uniform" ? Number(start_year_upper) : null,
			start_year_other_event:
				start_year_type === "sameYearAs" || start_year_type === "yearAfter" ? start_year_other_event : null,
			// Duration
			duration_type,
			duration_value: duration_type === "fixed" ? Number(duration_value) : null,
			duration_mean: duration_type === "normal" ? Number(duration_mean) : null,
			duration_std_dev: duration_type === "normal" ? Number(duration_std_dev) : null,
			duration_lower: duration_type === "uniform" ? Number(duration_lower) : null,
			duration_upper: duration_type === "uniform" ? Number(duration_upper) : null,
			// Associate with scenario
			scenario_id: canUser.id,
		});

		//based on type, create new EventSeries type
		if (type === "income") {
			const {
				initial_amount,
				expected_change_type,
				expected_change_value,
				expected_change_mean,
				expected_change_std_dev,
				expected_change_lower,
				expected_change_upper,
				inflation_adjusted,
				user_percentage,
				is_social,
			} = req.body;
			const newIncomeEvent = await IncomeEventSeries.create({
				// Associate with event series
				id: newEventSeries.id,
				initial_amount,
				// expected change
				expected_change_type,
				expected_change_value: expected_change_type === "fixed" ? Number(expected_change_value) : null,
				expected_change_mean: expected_change_type === "normal" ? Number(expected_change_mean) : null,
				expected_change_std_dev: expected_change_type === "normal" ? Number(expected_change_std_dev) : null,
				expected_change_lower: expected_change_type === "uniform" ? Number(expected_change_lower) : null,
				expected_change_upper: expected_change_type === "uniform" ? Number(expected_change_upper) : null,
				inflation_adjusted,
				user_percentage: Number(user_percentage),
				is_social,
			});
		} else if (type === "expense") {
			const {
				initial_amount,
				expected_change_type,
				expected_change_value,
				expected_change_mean,
				expected_change_std_dev,
				expected_change_lower,
				expected_change_upper,
				inflation_adjusted,
				user_percentage,
				is_discretionary,
			} = req.body;
			const newExpenseEvent = await ExpenseEventSeries.create({
				// Associate with event series
				id: newEventSeries.id,
				initial_amount,
				// expected change
				expected_change_type,
				expected_change_value: expected_change_type === "fixed" ? Number(expected_change_value) : null,
				expected_change_mean: expected_change_type === "normal" ? Number(expected_change_mean) : null,
				expected_change_std_dev: expected_change_type === "normal" ? Number(expected_change_std_dev) : null,
				expected_change_lower: expected_change_type === "uniform" ? Number(expected_change_lower) : null,
				expected_change_upper: expected_change_type === "uniform" ? Number(expected_change_upper) : null,
				inflation_adjusted,
				user_percentage: Number(user_percentage),
				is_discretionary,
			});
		} else if (type === "invest") {
			const { is_glide_path, asset_allocation, asset_allocation2, max_cash } = req.body;
			const newInvestEvent = await InvestEventSeries.create({
				// Associate with event series
				id: newEventSeries.id,
				is_glide_path,
				asset_allocation,
				asset_allocation2: is_glide_path ? asset_allocation2 : null,
				max_cash: Number(max_cash),
			});
		} else if (type === "rebalance") {
			const { is_glide_path, asset_allocation, asset_allocation2 } = req.body;
			const newRebalanceEvent = await RebalanceEventSeries.create({
				// Associate with event series
				id: newEventSeries.id,
				is_glide_path,
				asset_allocation,
				asset_allocation2: is_glide_path ? asset_allocation2 : null,
			});
		}
		res.status(201).json({ eventSeries: newEventSeries });
	} catch (err) {
		res.status(400).json(err.message);
		console.log(err.message);
	}
});

// Modify existing eventseries (VALIDATE USER)
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

	const {
		name,
		description,
		type,
		start_year_type,
		start_year_value,
		start_year_mean,
		start_year_std_dev,
		start_year_lower,
		start_year_upper,
		start_year_other_event,
		duration_type,
		duration_value,
		duration_mean,
		duration_std_dev,
		duration_lower,
		duration_upper,
	} = req.body;
	const eventSeriesFields = {
		name,
		description,
		type,
		start_year_type,
		start_year_value,
		start_year_mean,
		start_year_std_dev,
		start_year_lower,
		start_year_upper,
		start_year_other_event,
		duration_type,
		duration_value,
		duration_mean,
		duration_std_dev,
		duration_lower,
		duration_upper,
	};
	try {
		const eventSeries = await EventSeries.findOne({ where: { id, scenario_id } });
		if (!eventSeries) {
			return res.status(404).json("Event series not found");
		}

		await eventSeries.update(eventSeriesFields);

		// based on type, edit corresponding EventSeries Type
		if (type === "income") {
			const {
				initial_amount,
				expected_change_type,
				expected_change_value,
				expected_change_mean,
				expected_change_std_dev,
				expected_change_lower,
				expected_change_upper,
				inflation_adjusted,
				user_percentage,
				is_social,
			} = req.body;
			const incomeFields = {
				initial_amount,
				expected_change_type,
				expected_change_value,
				expected_change_mean,
				expected_change_std_dev,
				expected_change_lower,
				expected_change_upper,
				inflation_adjusted,
				user_percentage,
				is_social,
			};
			const incomeSeries = await IncomeEventSeries.findOne({ where: { id } });
			await incomeSeries.update(incomeFields);
		} else if (type === "expense") {
			const {
				initial_amount,
				expected_change_type,
				expected_change_value,
				expected_change_mean,
				expected_change_std_dev,
				expected_change_lower,
				expected_change_upper,
				inflation_adjusted,
				user_percentage,
				is_discretionary,
			} = req.body;
			const expenseFields = {
				initial_amount,
				expected_change_type,
				expected_change_value,
				expected_change_mean,
				expected_change_std_dev,
				expected_change_lower,
				expected_change_upper,
				inflation_adjusted,
				user_percentage,
				is_discretionary,
			};
			const expenseSeries = await ExpenseEventSeries.findOne({ where: { id } });
			await expenseSeries.update(expenseFields);
		} else if (type === "invest") {
			const { is_glide_path, asset_allocation, asset_allocation2, max_cash } = req.body;
			const investFields = { is_glide_path, asset_allocation, asset_allocation2, max_cash };
			const investSeries = await InvestEventSeries.findOne({ where: { id } });
			await investSeries.update(investFields);
		} else if (type === "rebalance") {
			const { is_glide_path, asset_allocation, asset_allocation2 } = req.body;
			const rebalanceFields = { is_glide_path, asset_allocation, asset_allocation2 };
			const rebalanceSeries = await RebalanceEventSeries.findOne({ where: { id } });
			await rebalanceSeries.update(rebalanceFields);
		}
		res.status(200).json({ eventSeries });
	} catch (err) {
		res.status(400).json(err.message);
		console.log(err.message);
	}
});

// Delete existing eventseries (VALIDATE USER)
router.delete("/delete/:scenarioId/:id", async (req, res) => {
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

	try {
		const eventSeries = await EventSeries.findOne({ where: { id, scenario_id } });
		if (!eventSeries) {
			return res.status(404).json("Event series not found");
		}

		await eventSeries.destory();
		// corresponding Event Series Type automatically deleted, FK=CASCADE
		res.status(200).json("Event series deleted successfully");
	} catch (err) {
		res.status(400).json(err.message);
		console.log(err.message);
	}
});

// Duplicate existing event series
router.post("/duplicate/:scenarioId/:id", async (req, res) => {
	const id = req.params.id;
	const scenario_id = req.params.scenarioId;
	try {
		const eventSeries = await EventSeries.findOne({ where: { id, scenario_id } });
		if (!eventSeries) {
			return res.status(404).json("Event series not found");
		}

		const duplicatedEventSeries = await EventSeries.create({
			...eventSeries.get(),
			id: undefined, // Ensure new event series gets a unique ID
			name: `${eventSeries.name} (Copy)`,
		});

		// duplicate corresponding Event Series Type
		if (eventSeries.type === "income") {
			const incomeSeries = await IncomeEventSeries.findOne({ where: { id } });
			const duplicatedIncomeSeries = await IncomeEventSeries.create({
				...incomeSeries.get(),
				id: duplicatedEventSeries.id,
			});
		} else if (eventSeries.type === "expense") {
			const expenseSeries = await ExpenseEventSeries.findOne({ where: { id } });
			const duplicatedExpenseSeries = await ExpenseEventSeries.create({
				...expenseSeries.get(),
				id: duplicatedEventSeries.id,
			});
		} else if (eventSeries.type === "invest") {
			const investSeries = await InvestEventSeries.findOne({ where: { id } });
			const duplicatedInvestSeries = await InvestEventSeries.create({
				...investSeries.get(),
				id: duplicatedEventSeries.id,
			});
		} else if (eventSeries.type === "rebalance") {
			const rebalanceSeries = await RebalanceEventSeries.findOne({ where: { id } });
			const duplicatedRebalanceSeries = await RebalanceEventSeries.create({
				...rebalanceSeries.get(),
				id: duplicatedEventSeries.id,
			});
		}
		res.status(201).json({ eventSeries: duplicatedEventSeries });
	} catch (err) {
		res.status(400).json(err.message);
		console.log(err.message);
	}
});

module.exports = router;
