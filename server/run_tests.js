const fs = require("fs");
const path = require("path");
const yaml = require("js-yaml");
const { simulateScenario } = require("./simulation");

function parseScenarioFromYAML(yamlText) {
	const doc = yaml.load(yamlText);

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

	const scenario = {
		id: "scenario_" + Date.now(),
		name: name,
		user_id: 1,

		is_married: maritalStatus === "couple",
		birth_year: birthYears[0] || null,
		spouse_birth_year: maritalStatus === "couple" ? birthYears[1] : null,

		life_expectancy_type: lifeExpectancy[0]?.type,
		life_expectancy_value: lifeExpectancy[0]?.type === "fixed" ? lifeExpectancy[0].value : null,
		life_expectancy_mean: lifeExpectancy[0]?.type === "normal" ? lifeExpectancy[0].mean : null,
		life_expectancy_std_dev: lifeExpectancy[0]?.type === "normal" ? lifeExpectancy[0].stdev : null,

		spouse_life_expectancy_type: maritalStatus === "couple" ? lifeExpectancy[1]?.type : null,
		spouse_life_expectancy_value: maritalStatus === "couple" && lifeExpectancy[1]?.type === "fixed" ? lifeExpectancy[1].value : null,
		spouse_life_expectancy_mean: maritalStatus === "couple" && lifeExpectancy[1]?.type === "normal" ? lifeExpectancy[1].mean : null,
		spouse_life_expectancy_std_dev: maritalStatus === "couple" && lifeExpectancy[1]?.type === "normal" ? lifeExpectancy[1].stdev : null,

		inflation_assumption_type: inflationAssumption.type,
		inflation_assumption_value: inflationAssumption.value ?? null,
		inflation_assumption_mean: inflationAssumption.mean ?? null,
		inflation_assumption_std_dev: inflationAssumption.stdev ?? null,
		inflation_assumption_lower: inflationAssumption.lower ?? null,
		inflation_assumption_upper: inflationAssumption.upper ?? null,

		after_tax_contribution_limit: afterTaxContributionLimit,
		financial_goal: financialGoal,
		state_of_residence: residenceState,

		spending_strategy: [],
		expense_withdrawl_strategy: [],
		rmd_strategy: [],

		is_roth_optimizer_enabled: RothConversionOpt,
		roth_start_year: RothConversionOpt ? RothConversionStart : null,
		roth_end_year: RothConversionOpt ? RothConversionEnd : null,
		roth_conversion_strategy: [],
		
		InvestmentTypes: [],
		Investments: [],
		EventSeries: [],
	};

    // 4) Parse InvestmentTypes
    investmentTypes.forEach((t) => {
        const type = {
            id: t.name,
            name: t.name,
            description: t.description || null,

            expected_change_type: t.returnDistribution.type,
            expected_change_numtype: t.returnAmtOrPct,
            expected_change_value: t.returnDistribution.value ?? null,
            expected_change_mean: t.returnDistribution.mean ?? null,
            expected_change_std_dev: t.returnDistribution.stdev ?? null,

            expense_ratio: t.expenseRatio,

            expected_income_type: t.incomeDistribution.type,
            expected_income_numtype: t.incomeAmtOrPct,
            expected_income_value: t.incomeDistribution.value ?? null,
            expected_income_mean: t.incomeDistribution.mean ?? null,
            expected_income_std_dev: t.incomeDistribution.stdev ?? null,

            taxability: Boolean(t.taxability),
        };
        scenario.InvestmentTypes.push(type);
    });

    // 5) Parse Investments
    investments.forEach((inv) => {
        const typeName = inv.investmentType;
		const isCash = typeName.toLowerCase() === "cash";
		const specialId = isCash ? "cash" : `${inv.taxStatus} ${typeName}`; // Conditional for cash

        const newInv = {
            id: inv.id,
            special_id: specialId,
            value: inv.value,
            tax_status: inv.taxStatus,
            investment_type_id: inv.investmentType,
        };

        scenario.Investments.push(newInv);
    });

	// 6) Remap Strategies
	scenario.expense_withdrawl_strategy = expenseWithdrawalStrategy;
	scenario.roth_conversion_strategy = RothConversionStrategy;
	scenario.rmd_strategy = RMDStrategy;
	scenario.spending_strategy = spendingStrategy;

	// 7) EventSeries
	eventSeriesList.forEach((ev, i) => {
		const base = {
			name: ev.name,
			description: ev.description || null,
			type: ev.type,

			start_year_type: ev.start.type,
			start_year_value: ev.start.value ?? null,
			start_year_mean: ev.start.mean ?? null,
			start_year_std_dev: ev.start.stdev ?? null,
			start_year_lower: ev.start.lower ?? null,
			start_year_upper: ev.start.upper ?? null,
			start_year_other_event: ["startWith", "startAfter"].includes(ev.start.type) ? ev.start.eventSeries : null,

			duration_type: ev.duration.type,
			duration_value: ev.duration.value ?? null,
			duration_mean: ev.duration.mean ?? null,
			duration_std_dev: ev.duration.stdev ?? null,
			duration_lower: ev.duration.lower ?? null,
			duration_upper: ev.duration.upper ?? null,
		};

		if (ev.type === "income" || ev.type === "expense") {
			base.initial_amount = ev.initialAmount;
			base.expected_change_type = ev.changeDistribution.type;
			base.expected_change_numtype = ev.changeAmtOrPct;
			base.expected_change_value = ev.changeDistribution.value ?? null;
			base.expected_change_mean = ev.changeDistribution.mean ?? null;
			base.expected_change_std_dev = ev.changeDistribution.stdev ?? null;
			base.expected_change_lower = ev.changeDistribution.lower ?? null;
			base.expected_change_upper = ev.changeDistribution.upper ?? null;
			base.inflation_adjusted = ev.inflationAdjusted;
			base.user_percentage = ev.userFraction;

			if (ev.type === "income") {
				base.is_social = Boolean(ev.socialSecurity);
			} else {
				base.is_discretionary = Boolean(ev.discretionary);
			}
		} else if (ev.type === "invest" || ev.type === "rebalance") {
			base.is_glide_path = ev.glidePath;
			base.asset_allocation = ev.assetAllocation;
			base.asset_allocation2 = ev.glidePath ? ev.assetAllocation2 : null;
			if (ev.type === "invest") base.max_cash = ev.maxCash;
		}

		scenario.EventSeries.push(base);
	});

	return scenario;
}

async function runTest() {
    const logDir = path.join(__dirname, "test_cases");
    const outputDir = path.join(__dirname, "log");

    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir);
    }

    const files = fs.readdirSync(logDir);
	const yamlFiles = files.filter(file => file.endsWith(".yaml"));
	console.log(yamlFiles)
    for (const file of yamlFiles) {
        const filePath = path.join(logDir, file);
        const fileContents = fs.readFileSync(filePath, "utf8");

        const logFilePath = path.join(outputDir, file.replace(".yaml", ".log"));
        const logStream = fs.createWriteStream(logFilePath, { flags: "w" });

        // Backup original console methods
        const originalLog = console.log;
        const originalError = console.error;

        // Redirect logs
        console.log = (...args) => logStream.write(args.map(String).join(" ") + "\n");
        console.error = (...args) => logStream.write(args.map(String).join(" ") + "\n");

        try {
            const scenario = parseScenarioFromYAML(fileContents);
            await simulateScenario(scenario);
        } catch (err) {
            console.error("Error during test run:", err);
        } finally {
            // Restore console
            console.log = originalLog;
            console.error = originalError;
            logStream.end();
        }
    }
}

runTest()