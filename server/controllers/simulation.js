const router = require("express").Router();
require("dotenv").config();
const db = require("../models");
const {
	Scenario,
	Investment,
	InvestmentType,
	EventSeries,
	IncomeEventSeries,
	ExpenseEventSeries,
	InvestEventSeries,
	RebalanceEventSeries,
	SimulationRun,
} = db;
const { simulateScenario } = require("../simulation");
const { simulateScenarioExp } = require("../simulationExpl");
const { Op } = require("sequelize");
const seedrandom = require("seedrandom");

// apply one parameter override
function applyOverride(scn, param, value) {
	if (param === "is_roth_optimizer_enabled") {
		scn.is_roth_optimizer_enabled = Boolean(value);
		return;
	}
	// event series duration or start
	if (param.startsWith("duration") || param.startsWith("start:")) {
		const [field, evtName] = param.split(":");
		const ev = scn.EventSeries.find((e) => e.name === evtName);
		if (!ev) return;
		if (field === "duration") {
			ev.duration_type = "fixed";
			ev.duration_value = Number(value);
		} else {
			ev.start_year_type = "fixed";
			ev.start_year_value = Number(value);
		}
		return;
	}
	// initial amount of income/expense event
	if (param.startsWith("initial_amount")) {
		const [, evtName] = param.split(":");
		const ev = scn.EventSeries.find((e) => e.name === evtName && (e.type === "income" || e.type === "expense"));
		if (ev) ev.initial_amount = Number(value);
		return;
	}
	// allocation percent for two-asset invest event: "alloc:EVENT:AssetA,AssetB"
	if (param.startsWith("alloc:")) {
		// format: alloc:<eventName>:AssetA,AssetB
		const parts = param.split(":");
		const name = parts[1];
		const assets = parts[2].split(",");
		if (assets.length !== 2) {
			throw new Error("Allocation override requires exactly two assets");
		}
		const [a1, a2] = assets;
		const ev = scn.EventSeries.find((e) => e.name === name && e.type === "invest");
		if (!ev) return;
		ev.asset_allocation = {};
		const p1 = Number(value) / 100;
		ev.asset_allocation[a1] = p1;
		ev.asset_allocation[a2] = 1 - p1;
		return;
	}
}

// deep clone utility
function cloneScenario(base) {
	return JSON.parse(JSON.stringify(base));
}

// upon generating charts, update the chartsGenerated flag and store chart_configs (taking id of newly created simulation)
router.put("/simulation-runs/:runId/charts", async (req, res) => {
	const { user } = req.session;
	if (!user) return res.status(401).json({ error: "Not authenticated" });

	const runId = parseInt(req.params.runId, 10);
	const { chartConfigs } = req.body;

	try {
		// Load the run along with its scenario and scenario-accesses
		const run = await SimulationRun.findOne({
			where: { id: runId },
			include: [
				{
					model: Scenario,
					as: "Scenario",
					include: [{ model: ScenarioAccess, as: "ScenarioAccesses" }],
				},
			],
		});
		if (!run) return res.status(404).json({ error: "SimulationRun not found" });

		const scenario = run.Scenario;
		// Check ownership or access
		const canAccess = scenario.user_id === user.id || scenario.ScenarioAccesses.some((a) => a.user_id === user.id);
		if (!canAccess) {
			return res.status(403).json({ error: "Not authorized to update charts for this simulation" });
		}

		run.charts_updated_flag = true;
		run.chart_configs = chartConfigs;
		await run.save();

		return res.json({
			message: "Chart configuration updated",
			simulationRun: run,
		});
	} catch (err) {
		console.error("Error updating chart configs:", err);
		return res.status(500).json({ error: "Server error" });
	}
});

// get latest simulation for given scenario and logged-in user (taking scenario_id)
router.get("/scenarios/:scenarioId/latest-simulation", async (req, res) => {
	const { user } = req.session;
	if (!user) return res.status(401).json({ error: "User not authenticated" });

	const scenarioId = parseInt(req.params.scenarioId, 10);

	try {
		// Verify user owns or has access to this scenario
		const scenario = await Scenario.findOne({
			where: {
				id: scenarioId,
				[Op.or]: [{ user_id: user.id }, { "$ScenarioAccesses.user_id$": user.id }],
			},
			include: [{ model: ScenarioAccess, as: "ScenarioAccesses" }],
		});
		if (!scenario) return res.status(403).json({ error: "Not authorized for that scenario" });

		// Find the most recent SimulationRun for this scenario
		const latest = await SimulationRun.findOne({
			where: { scenario_id: scenarioId },
			order: [["created_at", "DESC"]],
		});

		// If none found, return empty array
		if (!latest) {
			return res.json({ latestSimulation: [] });
		}

		// latest.results is JSONB column: an array of batches, each batch = yearData[]
		return res.json({ latestSimulation: latest.results });
	} catch (err) {
		console.error("Error fetching latest simulation:", err);
		return res.status(500).json({ error: "Server error" });
	}
});

// basic sim (taking scenario id) with simCount
router.post("/simulate/:id", async (req, res) => {
	const { user } = req.session;
	if (!user) return res.status(401).json({ error: "Not authenticated" });

	try {
		const scenarioId = parseInt(req.params.id, 10);
		const { simCount } = req.body;

		// Verify user owns or has access to this scenario
		const scenario = await Scenario.findOne({
			where: {
				id: scenarioId,
				[Op.or]: [{ user_id: user.id }, { "$ScenarioAccesses.user_id$": user.id }],
			},
			include: [{ model: ScenarioAccess, as: "ScenarioAccesses" }],
		});
		if (!scenario) return res.status(403).json({ error: "Not authorized for that scenario" });

		// load base with all includes
		const base = await Scenario.findByPk(scenarioId, {
			include: [
				{ model: Investment, as: "Investments" },
				{ model: InvestmentType, as: "InvestmentTypes" },
				{
					model: EventSeries,
					as: "EventSeries",
					include: [
						{ model: IncomeEventSeries, as: "IncomeEventSeries" },
						{ model: ExpenseEventSeries, as: "ExpenseEventSeries" },
						{ model: InvestEventSeries, as: "InvestEventSeries" },
						{ model: RebalanceEventSeries, as: "RebalanceEventSeries" },
					],
				},
			],
		});
		if (!base) return res.status(404).json({ error: "Scenario not found" });

		const baseScenario = base.toJSON();

		// run batch based on simulation count
		const batches = await Promise.all(Array.from({ length: simCount }, () => simulateScenario(baseScenario)));

		const latest = await SimulationRun.create({
			scenario_id: scenarioId,
			results: batches,
			charts_updated_flag: false,
			chart_configs: null,
			expl_param: null, // basic sim, no param
		});

		return res.json({ latestSimulation: latest });
	} catch (err) {
		console.error(err);
		res.status(500).json({ error: err.message });
	}
});

// 1-D exploration endpoint (taking scenario id) with simCount, lower, upper, step
router.post("/explore-1d/:id", async (req, res) => {
	const { user } = req.session;
	if (!user) return res.status(401).json({ error: "Not authenticated" });

	try {
		const scenarioId = parseInt(req.params.id, 10);
		const { param, lower, upper, step, simCount } = req.body;

		// Verify user owns or has access to this scenario
		const scenario = await Scenario.findOne({
			where: {
				id: scenarioId,
				[Op.or]: [{ user_id: user.id }, { "$ScenarioAccesses.user_id$": user.id }],
			},
			include: [{ model: ScenarioAccess, as: "ScenarioAccesses" }],
		});
		if (!scenario) return res.status(403).json({ error: "Not authorized for that scenario" });

		// load base scenario with includes
		const base = await Scenario.findByPk(id, {
			include: [
				{ model: Investment, as: "Investments" },
				{ model: InvestmentType, as: "InvestmentTypes" },
				{
					model: EventSeries,
					as: "EventSeries",
					include: [
						{ model: IncomeEventSeries, as: "IncomeEventSeries" },
						{ model: ExpenseEventSeries, as: "ExpenseEventSeries" },
						{ model: InvestEventSeries, as: "InvestEventSeries" },
						{ model: RebalanceEventSeries, as: "RebalanceEventSeries" },
					],
				},
			],
		});
		if (!base) return res.status(404).json({ error: "Scenario not found" });

		// build values
		const values =
			param === "is_roth_optimizer_enabled"
				? [false, true] // only two step values of range - enabled and disabled
				: // sequence from lower to upper in terms of step
				  Array.from({ length: Math.floor((upper - lower) / step) + 1 }, (_, i) => lower + i * step);

		const batches = [];
		// run a batch per param value
		for (const v of values) {
			// seed rng once per batch
			const rng = seedrandom("seed-1d");
			// clone & override
			const sc = cloneScenario(base);
			applyOverride(sc, param, v);
			// batch simulate
			const batch = await Promise.all(Array.from({ length: simCount }, () => simulateScenarioExp(sc, rng)));

			batches.push(batch);
		}

		const latest = await SimulationRun.create({
			scenario_id: scenarioId,
			results: batches,
			charts_updated_flag: false,
			chart_configs: null,
			expl_param: param,
		});

		res.json({ latestSimulation: latest });
	} catch (err) {
		console.error(err);
		res.status(500).json({ error: err.message });
	}
});

module.exports = router;
