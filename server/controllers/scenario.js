const router = require("express").Router();
require("dotenv").config();
const { where } = require("sequelize");
const db = require("../models");
const {
	User,
	Scenario,
	ScenarioAccess,
	Investment,
	InvestmentType,
	EventSeries,
	IncomeEventSeries,
	ExpenseEventSeries,
	InvestEventSeries,
	RebalanceEventSeries,
} = db;
const yaml = require("js-yaml");
const { Op } = require("sequelize");
const multer = require("multer");
const upload = multer();

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

		// Flatten EventSeries fields with type-specific fields
		const scenariosWithFlattenedEvents = allScenarios.map((scenario) => {
			const updatedEventSeries = scenario.EventSeries.map((event) => {
				const eventData = event.toJSON();
				const typeSpecific =
					eventData.IncomeEventSeries ||
					eventData.ExpenseEventSeries ||
					eventData.InvestEventSeries ||
					eventData.RebalanceEventSeries ||
					{};

				// Merge type-specific fields into the main object
				return {
					...eventData,
					...typeSpecific,
					IncomeEventSeries: undefined,
					ExpenseEventSeries: undefined,
					InvestEventSeries: undefined,
					RebalanceEventSeries: undefined,
				};
			});

			return {
				...scenario.toJSON(),
				EventSeries: updatedEventSeries,
			};
		});

		res.status(200).json(scenariosWithFlattenedEvents);
	} catch (err) {
		res.status(400).json(err.message);
		console.log(err.message);
	}
});

router.get("/shared", async (req, res) => {
	const { user } = req.session;
	if (!user) {
		return res.status(401).json("User not authenticated");
	}

	try {
		const sharedScenarios = await ScenarioAccess.findAll({
			where: { user_id: user.id },
			include: [
				{
					model: Scenario,
					as: "Scenario",
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
				},
			],
		});

		const sharedScenariosFlattened = sharedScenarios.map((access) => {
			const scenario = access.Scenario;
			const scenarioData = scenario.toJSON();

			const updatedEventSeries = (scenarioData.EventSeries || []).map((event) => {
				const typeSpecific =
					event.IncomeEventSeries ||
					event.ExpenseEventSeries ||
					event.InvestEventSeries ||
					event.RebalanceEventSeries ||
					{};

				return {
					...event,
					...typeSpecific,
					IncomeEventSeries: undefined,
					ExpenseEventSeries: undefined,
					InvestEventSeries: undefined,
					RebalanceEventSeries: undefined,
				};
			});

			return {
				...scenarioData,
				EventSeries: updatedEventSeries,
				permission: access.permission,
				isShared: true,
			};
		});

		res.status(200).json(sharedScenariosFlattened);
	} catch (error) {
		res.status(400).json(error.message);
	}
});

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
		initial_cash_investment,
	} = req.body;

	try {
		// Step 1: Create the scenario
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
			user_id: user.id,
			spending_strategy: [],
			expense_withdrawl_strategy: [],
			rmd_strategy: [],
			roth_conversion_strategy: [],
		});

		// Step 2: Create "Cash" InvestmentType
		const cashType = await InvestmentType.create({
			name: "Cash",
			description: "Initial non-retirement cash holding",
			expected_change_type: "fixed",
			expected_change_value: 0,
			expense_ratio: 0,
			expected_income_type: "fixed",
			expected_income_value: 0,
			taxability: "taxable",
			scenario_id: newScenario.id,
			is_locked: true, // This can be used in logic to prevent renaming or deletion
		});

		const generatedId = `${Date.now()}`;

		// Step 3: Create corresponding Investment
		await Investment.create({
			special_id: generatedId,
			value: Number(initial_cash_investment),
			tax_status: "taxable",
			investment_type_id: cashType.id,
			scenario_id: newScenario.id,
			is_locked: true, // This prevents deletion or type change in edit forms
		});

		// Step 4: Return the new scenario with everything populated
		const populatedScenario = await Scenario.findOne({
			where: { id: newScenario.id },
			include: [
				{ model: Investment, as: "Investments" },
				{ model: InvestmentType, as: "InvestmentTypes" },
				{
					model: EventSeries,
					as: "EventSeries",
					include: [
						{ model: db.IncomeEventSeries, as: "IncomeEventSeries" },
						{ model: db.ExpenseEventSeries, as: "ExpenseEventSeries" },
						{ model: db.InvestEventSeries, as: "InvestEventSeries" },
						{ model: db.RebalanceEventSeries, as: "RebalanceEventSeries" },
					],
				},
			],
		});

		res.status(201).json({ scenario: populatedScenario });
	} catch (err) {
		console.error(err.message);
		res.status(400).json(err.message);
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
		// const scenario = await Scenario.findOne({ where: { id, user_id: user.id } });
		// if (!scenario) {
		// 	return res.status(404).json("Scenario not found");
		// }

		const scenario = await Scenario.findOne({
			where: { id },
			include: [
				{
					model: db.ScenarioAccess,
					as: "ScenarioAccesses",
					where: { user_id: user.id },
					required: false,
				},
			],
		});

		if (!scenario) {
			return res.status(404).json("Scenario not found");
		}

		const isOwner = scenario.user_id === user.id;
		const access = scenario.ScenarioAccesses?.[0];
		const hasRWAccess = access?.permission === "rw";

		if (!isOwner && !hasRWAccess) {
			return res.status(403).json("You do not have permission to edit this scenario");
		}

		await scenario.update(fieldsToUpdate);
		const populatedScenario = await Scenario.findOne({
			where: { id: scenario.id },
			include: [
				{ model: Investment, as: "Investments" },
				{ model: InvestmentType, as: "InvestmentTypes" },
				// { model: EventSeries, as: "EventSeries" },
				{
					model: EventSeries,
					as: "EventSeries",
					include: [
						{ model: db.IncomeEventSeries, as: "IncomeEventSeries" },
						{ model: db.ExpenseEventSeries, as: "ExpenseEventSeries" },
						{ model: db.InvestEventSeries, as: "InvestEventSeries" },
						{ model: db.RebalanceEventSeries, as: "RebalanceEventSeries" },
					],
				},
			],
		});
		res.status(200).json({ scenario: populatedScenario });
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
		// const scenario = await Scenario.findOne({ where: { id, user_id: user.id } });
		// if (!scenario) {
		// 	return res.status(404).json("Scenario not found");
		// }
		const scenario = await Scenario.findOne({
			where: { id },
			include: [
				{
					model: db.ScenarioAccess,
					as: "ScenarioAccesses",
					where: { user_id: user.id },
					required: false, // include even if the user is not in ScenarioAccess (might be owner)
				},
			],
		});

		if (!scenario) {
			return res.status(404).json("Scenario not found");
		}

		const isOwner = scenario.user_id === user.id;
		const access = scenario.ScenarioAccesses?.[0];
		const hasRWAccess = access?.permission === "rw";

		if (!isOwner && !hasRWAccess) {
			return res.status(403).json("You do not have permission to delete this scenario");
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
	const { user } = req.session;
	const id = req.params.id;
	if (!user) {
		return res.status(401).json("User not authenticated");
	}

	try {
		//   const scenario = await Scenario.findOne({
		// 	where: { id, user_id: user.id },
		// 	include: [
		// 	  { model: Investment, as: "Investments" },
		// 	  { model: InvestmentType, as: "InvestmentTypes" },
		// 	//   { model: EventSeries, as: "EventSeries" },
		// 	  {
		// 		model: EventSeries,
		// 		as: "EventSeries",
		// 		include: [
		// 		{ model: db.IncomeEventSeries, as: "IncomeEventSeries" },
		// 		{ model: db.ExpenseEventSeries, as: "ExpenseEventSeries" },
		// 		{ model: db.InvestEventSeries, as: "InvestEventSeries" },
		// 		{ model: db.RebalanceEventSeries, as: "RebalanceEventSeries" },
		// 		],
		// 	  }
		// 	],
		//   });
		const scenario = await Scenario.findOne({
			where: {
				id,
			},
			include: [
				{ model: Investment, as: "Investments" },
				{ model: InvestmentType, as: "InvestmentTypes" },
				{
					model: EventSeries,
					as: "EventSeries",
					include: [
						{ model: db.IncomeEventSeries, as: "IncomeEventSeries" },
						{ model: db.ExpenseEventSeries, as: "ExpenseEventSeries" },
						{ model: db.InvestEventSeries, as: "InvestEventSeries" },
						{ model: db.RebalanceEventSeries, as: "RebalanceEventSeries" },
					],
				},
				{
					model: db.ScenarioAccess,
					as: "ScenarioAccesses",
					where: { user_id: user.id },
					required: false, // still return if this join doesn't exist (user might be the owner instead)
				},
			],
		});

		const isOwner = scenario?.user_id === user.id;
		const hasAccess = scenario?.ScenarioAccesses?.length > 0;

		if (!isOwner && !hasAccess) {
			return res.status(401).json("You do not have access to this scenario");
		}

		if (!scenario) {
			return res.status(404).json("Scenario not found");
		}

		// Step 1: Create duplicated scenario
		const duplicatedScenario = await Scenario.create({
			...scenario.toJSON(),
			id: undefined,
			name: `${scenario.name} (Copy)`,
			user_id: user.id,
		});

		// Step 2: Duplicate child models
		const createCopies = async (Model, items, scenario_id, extra = {}) => {
			return Promise.all(
				items.map((item) =>
					Model.create({
						...item.toJSON(),
						id: undefined,
						scenario_id,
						...extra,
					})
				)
			);
		};

		await createCopies(InvestmentType, scenario.InvestmentTypes, duplicatedScenario.id);
		await createCopies(Investment, scenario.Investments, duplicatedScenario.id);
		await createCopies(EventSeries, scenario.EventSeries, duplicatedScenario.id);

		// Step 3: Return full duplicated scenario
		const fullScenario = await Scenario.findOne({
			where: { id: duplicatedScenario.id },
			include: [
				{ model: Investment, as: "Investments" },
				{ model: InvestmentType, as: "InvestmentTypes" },
				//   { model: EventSeries, as: "EventSeries" },
				{
					model: EventSeries,
					as: "EventSeries",
					include: [
						{ model: db.IncomeEventSeries, as: "IncomeEventSeries" },
						{ model: db.ExpenseEventSeries, as: "ExpenseEventSeries" },
						{ model: db.InvestEventSeries, as: "InvestEventSeries" },
						{ model: db.RebalanceEventSeries, as: "RebalanceEventSeries" },
					],
				},
			],
		});

		res.status(201).json({ scenario: fullScenario });
	} catch (err) {
		console.error("Duplicate failed:", err.message);
		res.status(400).json(err.message);
	}
});

router.post("/owner/:id", async (req, res) => {
	const user_id = req.params.id;
	try {
		const user = await User.findOne({
			where: { id: user_id },
		});

		res.status(200).json(user.email);
	} catch (err) {
		res.status(400).json(err.message);
	}
});

router.post("/leave/:id", async (req, res) => {
	const { user } = req.session;
	if (!user) {
		return res.status(401).json("User not authenticated");
	}
	const id = req.params.id;
	try {
		const scenarioAccess = await ScenarioAccess.findOne({
			where: { scenario_id: id, user_id: user.id },
		});

		if (!scenarioAccess) {
			res.status(404).json("Scenario Access not found");
		}

		await scenarioAccess.destroy();
		res.status(200).json(scenarioAccess);
	} catch (error) {
		res.status(400).json(err.message);
	}
});

router.post("/share/:id", async (req, res) => {
	const { user } = req.session;
	const scenario_id = req.params.id;
	const { email, permission } = req.body;

	if (!user) {
		return res.status(401).json("User not authenticated");
	}

	try {
		const scenario = await Scenario.findByPk(scenario_id);
		if (!scenario) return res.status(404).json("Scenario not found");

		if (scenario.user_id !== user.id) {
			return res.status(403).json("Only the owner can share this scenario");
		}

		const targetUser = await User.findOne({ where: { email } });
		if (!targetUser) return res.status(404).json("User not found");

		const [access, created] = await ScenarioAccess.findOrCreate({
			where: { scenario_id, user_id: targetUser.id },
			defaults: { permission },
		});

		if (!created) {
			await access.update({ permission });
		}

		res.status(200).json("Scenario shared successfully");
	} catch (err) {
		console.error("Error sharing scenario:", err.message);
		res.status(500).json("Failed to share scenario");
	}
});

router.get("/access/:id", async (req, res) => {
	const { user } = req.session;
	const scenario_id = req.params.id;

	if (!user) return res.status(401).json("User not authenticated");

	try {
		const accessEntries = await ScenarioAccess.findAll({
			where: { scenario_id },
			include: [{ model: User, as: "User" }],
		});

		const simplified = accessEntries.map((entry) => ({
			user_id: entry.user_id,
			email: entry.User.email,
			permission: entry.permission,
		}));

		res.status(200).json(simplified);
	} catch (err) {
		console.error("Error getting access list:", err.message);
		res.status(500).json("Failed to get access list");
	}
});

router.delete("/unshare/:scenarioId/:userId", async (req, res) => {
	const { user } = req.session;
	const { scenarioId, userId } = req.params;

	if (!user) {
		return res.status(401).json("User not authenticated");
	}

	try {
		const scenario = await Scenario.findByPk(scenarioId);
		if (!scenario) return res.status(404).json("Scenario not found");

		if (scenario.user_id !== user.id) {
			return res.status(403).json("Only the owner can remove access");
		}

		const access = await ScenarioAccess.findOne({
			where: { scenario_id: scenarioId, user_id: userId },
		});
		if (!access) return res.status(404).json("Access not found");

		await access.destroy();

		res.status(200).json("Access removed successfully");
	} catch (err) {
		console.error("Error removing access:", err.message);
		res.status(500).json("Failed to remove access");
	}
});

router.get("/export-yaml/:id", async (req, res) => {
	const { user } = req.session;
	const scenarioId = req.params.id;

	if (!user) return res.status(401).json("User not authenticated");

	try {
		const scenario = await Scenario.findOne({
			where: {
				id: scenarioId,
				[Op.or]: [{ user_id: user.id }, { "$ScenarioAccesses.user_id$": user.id }],
			},
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
				{ model: ScenarioAccess, as: "ScenarioAccesses" },
			],
		});
		if (!scenario) return res.status(404).json("Scenario not found");

		const data = scenario.toJSON();

		// 2. InvestmentTypes
		const invTypes = data.InvestmentTypes.map((t) => ({
			name: t.name,
			description: t.description,
			returnAmtOrPct: t.expected_change_numtype,
			returnDistribution:
				t.expected_change_type === "fixed"
					? { type: "fixed", value: t.expected_change_value }
					: { type: "normal", mean: t.expected_change_mean, stdev: t.expected_change_std_dev },
			expenseRatio: t.expense_ratio,
			incomeAmtOrPct: t.expected_income_numtype,
			incomeDistribution:
				t.expected_income_type === "fixed"
					? { type: "fixed", value: t.expected_income_value }
					: { type: "normal", mean: t.expected_income_mean, stdev: t.expected_income_std_dev },
			taxability: t.taxability === "taxable" ? "true" : "false",
		}));

		// 3. Investments
		const investments = data.Investments.map((inv) => ({
			investmentType: data.InvestmentTypes.find((t) => t.id === inv.investment_type_id).name,
			value: inv.value,
			taxStatus: inv.tax_status,
			id: inv.special_id,
		}));

		// 4. EventSeries
		const eventSeries = data.EventSeries.map((ev) => {
			// pick the subtype record
			const subtype =
				ev.IncomeEventSeries || ev.ExpenseEventSeries || ev.InvestEventSeries || ev.RebalanceEventSeries;
			const base = {
				name: ev.name,
				start: (() => {
					if (ev.start_year_type === "fixed") return { type: "fixed", value: ev.start_year_value };
					if (ev.start_year_type === "normal")
						return { type: "normal", mean: ev.start_year_mean, stdev: ev.start_year_std_dev };
					if (ev.start_year_type === "uniform")
						return { type: "uniform", lower: ev.start_year_lower, upper: ev.start_year_upper };
					// startWith / startAfter
					return {
						type: ev.start_year_type === "startWith" ? "startWith" : "startAfter",
						eventSeries: ev.start_year_other_event,
					};
				})(),
				duration: (() => {
					if (ev.duration_type === "fixed") return { type: "fixed", value: ev.duration_value };
					if (ev.duration_type === "normal")
						return { type: "normal", mean: ev.duration_mean, stdev: ev.duration_std_dev };
					return { type: "uniform", lower: ev.duration_lower, upper: ev.duration_upper };
				})(),
				type: ev.type,
			};

			// merge subtype fields
			if (ev.type === "income" || ev.type === "expense") {
				Object.assign(base, {
					initialAmount: subtype.initial_amount,
					changeAmtOrPct: subtype.expected_change_numtype,
					changeDistribution:
						subtype.expected_change_type === "fixed"
							? { type: "fixed", value: subtype.expected_change_value }
							: subtype.expected_change_type === "normal"
							? {
									type: "normal",
									mean: subtype.expected_change_mean,
									stdev: subtype.expected_change_std_dev,
							  }
							: {
									type: "uniform",
									lower: subtype.expected_change_lower,
									upper: subtype.expected_change_upper,
							  },
					inflationAdjusted: subtype.inflation_adjusted,
					userFraction: subtype.user_percentage,
				});
				if (ev.type === "income") {
					base.socialSecurity = subtype.is_social;
				} else {
					base.discretionary = subtype.is_discretionary;
				}
			} else if (ev.type === "invest" || ev.type === "rebalance") {
				Object.assign(base, {
					assetAllocation: subtype.asset_allocation,
					glidePath: subtype.is_glide_path,
				});
				if (subtype.is_glide_path) {
					base.assetAllocation2 = subtype.asset_allocation2;
				}
				if (ev.type === "invest") {
					base.maxCash = subtype.max_cash;
				}
			}

			return base;
		});

		// Build the export object in one literal, in order:
		const exportObj = {
			// 1) Scenario identity + demographics
			name: data.name,
			maritalStatus: data.is_married ? "couple" : "individual",
			birthYears: data.is_married ? [data.birth_year, data.spouse_birth_year] : [data.birth_year],
			lifeExpectancy: data.is_married
				? [
						{
							type: data.life_expectancy_type,
							...(data.life_expectancy_type === "fixed"
								? { value: data.life_expectancy_value }
								: {
										mean: data.life_expectancy_mean,
										stdev: data.life_expectancy_std_dev,
								  }),
						},
						{
							type: data.spouse_life_expectancy_type,
							...(data.spouse_life_expectancy_type === "fixed"
								? { value: data.spouse_life_expectancy_value }
								: {
										mean: data.spouse_life_expectancy_mean,
										stdev: data.spouse_life_expectancy_std_dev,
								  }),
						},
				  ]
				: [
						{
							type: data.life_expectancy_type,
							...(data.life_expectancy_type === "fixed"
								? { value: data.life_expectancy_value }
								: {
										mean: data.life_expectancy_mean,
										stdev: data.life_expectancy_std_dev,
								  }),
						},
				  ],

			// 2) investmentTypes
			investmentTypes: invTypes,

			// 3) investments
			investments: investments,

			// 4) eventSeries
			eventSeries: eventSeries,

			// 5) inflation assumption
			inflationAssumption: {
				type: data.inflation_assumption_type,
				...(data.inflation_assumption_type === "fixed"
					? { value: data.inflation_assumption_value }
					: data.inflation_assumption_type === "normal"
					? { mean: data.inflation_assumption_mean, stdev: data.inflation_assumption_std_dev }
					: {
							lower: data.inflation_assumption_lower,
							upper: data.inflation_assumption_upper,
					  }),
			},

			// 6) after‑tax contribution limit
			afterTaxContributionLimit: data.after_tax_contribution_limit,

			// 7) strategies
			spendingStrategy: data.spending_strategy,
			expenseWithdrawalStrategy: data.expense_withdrawl_strategy,
			RMDStrategy: data.rmd_strategy,

			// 8) Roth conversion settings
			RothConversionOpt: data.is_roth_optimizer_enabled,
			...(data.is_roth_optimizer_enabled && {
				RothConversionStart: data.roth_start_year,
				RothConversionEnd: data.roth_end_year,
				RothConversionStrategy: data.roth_conversion_strategy,
			}),

			// 9) financial goal
			financialGoal: data.financial_goal,

			// 10) residence state
			residenceState: data.state_of_residence,
		};

		// then dump as YAML:
		const yamlString = yaml.dump(exportObj);

		// Send YAML to client
		res.setHeader("Content-Type", "application/x-yaml");
		res.setHeader("Content-Disposition", `attachment; filename=scenario-${scenarioId}.yaml`);
		res.send(yamlString);
	} catch (err) {
		console.error("Export YAML failed:", err);
		res.status(400).json("Failed to export scenario to YAML");
	}
});

router.post("/import-yaml", upload.single("file"), async (req, res) => {
	const { user } = req.session;
	if (!user) return res.status(401).json("User not authenticated");
	if (!req.file) return res.status(400).json("No file uploaded");

	try {
		// 1) Parse YAML
		const doc = yaml.load(req.file.buffer.toString("utf8"));

		// 2) Destructure exactly your format
		const {
			name,
			maritalStatus,
			birthYears = [],
			lifeExpectancy = [],
			investmentTypes = [],
			investments = [],
			eventSeries: eventSeriesList = [],
			inflationAssumption = {},
			afterTaxContributionLimit,
			spendingStrategy = [],
			expenseWithdrawalStrategy = [],
			RMDStrategy = [],
			RothConversionOpt = false,
			RothConversionStart = null,
			RothConversionEnd = null,
			RothConversionStrategy = [],
			financialGoal,
			residenceState,
		} = doc;

		// 3) Create core Scenario
		const newScenario = await Scenario.create({
			name: `${name} (Imported)`,
			user_id: user.id,

			// marriage + birth years
			is_married: maritalStatus === "couple",
			birth_year: birthYears[0] || null,
			spouse_birth_year: maritalStatus === "couple" ? birthYears[1] : null,

			// life expectancy
			life_expectancy_type: lifeExpectancy[0]?.type,
			life_expectancy_value: lifeExpectancy[0]?.type === "fixed" ? lifeExpectancy[0].value : null,
			life_expectancy_mean: lifeExpectancy[0]?.type === "normal" ? lifeExpectancy[0].mean : null,
			life_expectancy_std_dev: lifeExpectancy[0]?.type === "normal" ? lifeExpectancy[0].stdev : null,

			spouse_life_expectancy_type: maritalStatus === "couple" ? lifeExpectancy[1]?.type : null,
			spouse_life_expectancy_value:
				maritalStatus === "couple" && lifeExpectancy[1]?.type === "fixed" ? lifeExpectancy[1].value : null,
			spouse_life_expectancy_mean:
				maritalStatus === "couple" && lifeExpectancy[1]?.type === "normal" ? lifeExpectancy[1].mean : null,
			spouse_life_expectancy_std_dev:
				maritalStatus === "couple" && lifeExpectancy[1]?.type === "normal" ? lifeExpectancy[1].stdev : null,

			// inflation assumption
			inflation_assumption_type: inflationAssumption.type,
			inflation_assumption_value: inflationAssumption.type === "fixed" ? inflationAssumption.value : null,
			inflation_assumption_mean: inflationAssumption.type === "normal" ? inflationAssumption.mean : null,
			inflation_assumption_std_dev: inflationAssumption.type === "normal" ? inflationAssumption.stdev : null,
			inflation_assumption_lower: inflationAssumption.type === "uniform" ? inflationAssumption.lower : null,
			inflation_assumption_upper: inflationAssumption.type === "uniform" ? inflationAssumption.upper : null,

			// after‑tax limit & goal & state
			after_tax_contribution_limit: afterTaxContributionLimit,
			financial_goal: financialGoal,
			state_of_residence: residenceState,

			// strategies
			spending_strategy: spendingStrategy,
			expense_withdrawl_strategy: expenseWithdrawalStrategy,
			rmd_strategy: RMDStrategy,

			// Roth conversion
			is_roth_optimizer_enabled: RothConversionOpt,
			roth_start_year: RothConversionOpt ? RothConversionStart : null,
			roth_end_year: RothConversionOpt ? RothConversionEnd : null,
			roth_conversion_strategy: RothConversionOpt ? RothConversionStrategy : null,
		});

		// 4) InvestmentTypes → DB + build name→id map
		const typeMap = {};
		for (const t of investmentTypes) {
			const {
				name: tName,
				description,
				returnAmtOrPct,
				returnDistribution,
				expenseRatio,
				incomeAmtOrPct,
				incomeDistribution,
				taxability,
			} = t;

			const newType = await InvestmentType.create({
				name: tName,
				description: description || null,

				expected_change_type: returnDistribution.type,
				expected_change_numtype: returnAmtOrPct,
				expected_change_value: returnDistribution.type === "fixed" ? returnDistribution.value : null,
				expected_change_mean: returnDistribution.type === "normal" ? returnDistribution.mean : null,
				expected_change_std_dev: returnDistribution.type === "normal" ? returnDistribution.stdev : null,

				expense_ratio: expenseRatio,

				expected_income_type: incomeDistribution.type,
				expected_income_numtype: incomeAmtOrPct,
				expected_income_value: incomeDistribution.type === "fixed" ? incomeDistribution.value : null,
				expected_income_mean: incomeDistribution.type === "normal" ? incomeDistribution.mean : null,
				expected_income_std_dev: incomeDistribution.type === "normal" ? incomeDistribution.stdev : null,

				taxability: Boolean(taxability),
				scenario_id: newScenario.id,
			});

			typeMap[tName] = newType.id;
		}

		// 5) Investments → DB + build oldID→newID map
		const investmentMap = {};
		for (const inv of investments) {
			const { investmentType, value, taxStatus, id: oldId } = inv;
			const newInv = await Investment.create({
				special_id: oldId,
				value,
				tax_status: taxStatus,
				scenario_id: newScenario.id,
				investment_type_id: typeMap[investmentType],
			});
			investmentMap[oldId] = newInv.id;
		}

		// 6) Remap strategies (IDs)
		const remap = (arr) => arr.map((old) => investmentMap[old]).filter(Boolean);
		await Scenario.update(
			{
				expense_withdrawl_strategy: remap(expenseWithdrawalStrategy),
				roth_conversion_strategy: remap(RothConversionStrategy),
				rmd_strategy: remap(RMDStrategy),
				// spending_strategy is event‑based, handled below
			},
			{ where: { id: newScenario.id } }
		);

		// 7) EventSeries + sub‑tables
		const spendingByEvent = [];
		for (const ev of eventSeriesList) {
			const {
				name: evName,
				description,
				start,
				duration,
				type,
				initialAmount,
				changeAmtOrPct,
				changeDistribution,
				inflationAdjusted,
				userFraction,
				socialSecurity,
				discretionary,
				assetAllocation,
				glidePath,
				assetAllocation2,
				maxCash,
			} = ev;

			// base EventSeries row
			const row = await EventSeries.create({
				name: evName,
				description: description || null,
				type,
				start_year_type: start.type,
				start_year_value: start.type === "fixed" ? start.value : null,
				start_year_mean: start.type === "normal" ? start.mean : null,
				start_year_std_dev: start.type === "normal" ? start.stdev : null,
				start_year_lower: start.type === "uniform" ? start.lower : null,
				start_year_upper: start.type === "uniform" ? start.upper : null,
				start_year_other_event: ["startWith", "startAfter"].includes(start.type) ? start.eventSeries : null,
				duration_type: duration.type,
				duration_value: duration.type === "fixed" ? duration.value : null,
				duration_mean: duration.type === "normal" ? duration.mean : null,
				duration_std_dev: duration.type === "normal" ? duration.stdev : null,
				duration_lower: duration.type === "uniform" ? duration.lower : null,
				duration_upper: duration.type === "uniform" ? duration.upper : null,
				scenario_id: newScenario.id,
			});

			// subtype
			if (type === "income" || type === "expense") {
				const common = {
					id: row.id,
					initial_amount: initialAmount,
					expected_change_type: changeDistribution.type,
					expected_change_numtype: changeAmtOrPct,
					expected_change_value: changeDistribution.type === "fixed" ? changeDistribution.value : null,
					expected_change_mean: changeDistribution.type === "normal" ? changeDistribution.mean : null,
					expected_change_std_dev: changeDistribution.type === "normal" ? changeDistribution.stdev : null,
					expected_change_lower: changeDistribution.type === "uniform" ? changeDistribution.lower : null,
					expected_change_upper: changeDistribution.type === "uniform" ? changeDistribution.upper : null,
					inflation_adjusted: inflationAdjusted,
					user_percentage: userFraction,
				};

				if (type === "income") {
					await IncomeEventSeries.create({
						...common,
						is_social: Boolean(socialSecurity),
					});
				} else {
					await ExpenseEventSeries.create({
						...common,
						is_discretionary: Boolean(discretionary),
					});
					if (discretionary) spendingByEvent.push(row.id);
				}
			} else if (type === "invest") {
				await InvestEventSeries.create({
					id: row.id,
					is_glide_path: glidePath,
					asset_allocation: assetAllocation,
					asset_allocation2: glidePath ? assetAllocation2 : null,
					max_cash: maxCash,
				});
			} else if (type === "rebalance") {
				await RebalanceEventSeries.create({
					id: row.id,
					is_glide_path: glidePath,
					asset_allocation: assetAllocation,
					asset_allocation2: glidePath ? assetAllocation2 : null,
				});
			}
		}

		// 8) Finally, save the spending_strategy by event IDs
		await Scenario.update({ spending_strategy: spendingByEvent }, { where: { id: newScenario.id } });

		// 9) Return the fully populated scenario
		const populated = await Scenario.findOne({
			where: { id: newScenario.id },
			include: [
				{ model: InvestmentType, as: "InvestmentTypes" },
				{ model: Investment, as: "Investments" },
				{
					model: EventSeries,
					as: "EventSeries",
					include: [
						{ model: IncomeEventSeries, as: "IncomeEventSeries" },
						{ model: ExpenseEventSeries, as: "ExpenseEventSeries" },
						{ model: InvestEventSeries, as: "InvestEventSeries" },
						{
							model: RebalanceEventSeries,
							as: "RebalanceEventSeries",
						},
					],
				},
			],
		});

		res.status(201).json({
			message: "Scenario imported successfully",
			scenario: populated,
		});
	} catch (err) {
		console.error("YAML import failed:", err);
		res.status(400).json("Invalid YAML structure or data");
	}
});

module.exports = router;
