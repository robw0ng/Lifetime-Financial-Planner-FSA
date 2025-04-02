const { simulateScenario } = require('./simulation');
const { User, Scenario, Investment, InvestmentType, EventSeries, IncomeEventSeries, ExpenseEventSeries, InvestEventSeries, RebalanceEventSeries } = require("./models");
require("dotenv").config();
const db = require("./models");

async function createTestScenario() {
    // Create base scenario for testing
    const user = await User.create({
        name: 'Test User',
        email: 'testuser@example.com',
      });
  
    const scenario = await Scenario.create({
        user_id: user.id,
        name: "Retirement Planning Scenario",
        is_married: true,
        birth_year: 1985,
        spouse_birth_year: 1987,
        life_expectancy_type: "fixed",
        life_expectancy_value: 80,
        spouse_life_expectancy_type: "normal",
        spouse_life_expectancy_mean: 82,
        spouse_life_expectancy_std_dev: 3,
        after_tax_contribution_limit: 7000,
        state_of_residence: "NY",
        financial_goal: 10000,
        inflation_assumption_type: "fixed",
        inflation_assumption_value: 0.03,
        is_roth_optimizer_enabled: true,
        roth_start_year: 2050,
        roth_end_year: 2060,
        spending_strategy: [],
        expense_withdrawl_strategy: [],
        rmd_strategy: [],
        roth_conversion_strategy: [],
    });

    // Create investment types
    const cashType = await InvestmentType.create({
        name: "cash",
        description: "cash",
        expected_change_type: "fixed",
        expected_change_value: 0,
        expense_ratio: 0,
        expected_income_type: "fixed",
        expected_income_value: 0,
        taxability: true,
        scenario_id: scenario.id
    });

    const spType = await InvestmentType.create({
        name: "S&P 500",
        description: "S&P 500 index fund",
        expected_change_type: "fixed",
        expected_change_value: 0.01,
        expense_ratio: 0.001,
        expected_income_type: "normal",
        expected_income_mean: 0.01,
        expected_income_std_dev: 0.005,
        taxability: true,
        scenario_id: scenario.id
    });

    const bondType = await InvestmentType.create({
        name: "tax-exempt bonds",
        description: "NY tax-exempt bonds",
        expected_change_type: "fixed",
        expected_change_value: 0,
        expense_ratio: 0.004,
        expected_income_type: "normal",
        expected_income_mean: 0.03,
        expected_income_std_dev: 0.01,
        taxability: false,
        scenario_id: scenario.id
    });

    // Create investments
    const cash_investment = await Investment.create({
        special_id: "cash",
        value: 100,
        tax_status: "non-retirement",
        investment_type_id: cashType.id,
        scenario_id: scenario.id
    });

    const SP_non_retirement = await Investment.create({
        special_id: "S&P 500 non-retirement",
        value: 10000,
        tax_status: "non-retirement",
        investment_type_id: spType.id,
        scenario_id: scenario.id
    });

    const bond_non_retirement = await Investment.create({
        special_id: "tax-exempt bonds",
        value: 2000,
        tax_status: "non-retirement",
        investment_type_id: bondType.id,
        scenario_id: scenario.id
    });

    const SP_pretax = await Investment.create({
        special_id: "S&P 500 pre-tax",
        value: 10000,
        tax_status: "pre-tax",
        investment_type_id: spType.id,
        scenario_id: scenario.id
    });

    const SP_aftertax = await Investment.create({
        special_id: "S&P 500 after-tax",
        value: 2000,
        tax_status: "after-tax",
        investment_type_id: spType.id,
        scenario_id: scenario.id
    });

    // Create event series
    // Salary (Income Event)
    const salaryEvent = await EventSeries.create({
        name: "salary",
        type: "income",
        start_year_type: "fixed",
        start_year_value: 2025,
        duration_type: "fixed",
        duration_value: 40,
        scenario_id: scenario.id
    });

    await IncomeEventSeries.create({
        id: salaryEvent.id,
        initial_amount: 75000,
        expected_change_type: "uniform",
        expected_change_lower: 500,
        expected_change_upper: 2000,
        inflation_adjusted: false,
        user_percentage: 1.0,
        is_social: false
    });

    // Food (Expense Event)
    const foodEvent = await EventSeries.create({
        name: "food",
        type: "expense",
        start_year_type: "with_event",
        start_year_other_event: "salary",
        duration_type: "fixed",
        duration_value: 200,
        scenario_id: scenario.id
    });

    await ExpenseEventSeries.create({
        id: foodEvent.id,
        initial_amount: 5000,
        expected_change_type: "normal",
        expected_change_mean: 0.02,
        expected_change_std_dev: 0.01,
        inflation_adjusted: true,
        user_percentage: 0.5,
        is_discretionary: false
    });

    // Vacation (Expense Event)
    const vacationEvent = await EventSeries.create({
        name: "vacation",
        type: "expense",
        start_year_type: "with_event",
        start_year_other_event: "salary",
        duration_type: "fixed",
        duration_value: 40,
        scenario_id: scenario.id
    });

    await ExpenseEventSeries.create({
        id: vacationEvent.id,
        initial_amount: 1200,
        expected_change_type: "fixed",
        expected_change_value: 0,
        inflation_adjusted: true,
        user_percentage: 0.6,
        is_discretionary: true
    });

    // Streaming Services (Expense Event)
    const streamingEvent = await EventSeries.create({
        name: "streaming services",
        type: "expense",
        start_year_type: "with_event",
        start_year_other_event: "salary",
        duration_type: "fixed",
        duration_value: 40,
        scenario_id: scenario.id
    });

    await ExpenseEventSeries.create({
        id: streamingEvent.id,
        initial_amount: 500,
        expected_change_type: "fixed",
        expected_change_value: 0,
        inflation_adjusted: true,
        user_percentage: 1.0,
        is_discretionary: true
    });

    // My Investments (Invest Event)
    const investEvent = await EventSeries.create({
        name: "my investments",
        type: "invest",
        start_year_type: "uniform",
        start_year_lower: 2025,
        start_year_upper: 2030,
        duration_type: "fixed",
        duration_value: 10,
        scenario_id: scenario.id
    });

    await InvestEventSeries.create({
        id: investEvent.id,
        is_glide_path: true,
        asset_allocation: {
            "S&P 500 non-retirement": 0.6,
            "S&P 500 after-tax": 0.4
        },
        asset_allocation2: {
            "S&P 500 non-retirement": 0.8,
            "S&P 500 after-tax": 0.2
        },
        max_cash: 1000
    });

    // Rebalance Event
    const rebalanceEvent = await EventSeries.create({
        name: "rebalance",
        type: "rebalance",
        start_year_type: "uniform",
        start_year_lower: 2025,
        start_year_upper: 2030,
        duration_type: "fixed",
        duration_value: 10,
        scenario_id: scenario.id
    });

    await RebalanceEventSeries.create({
        id: rebalanceEvent.id,
        is_glide_path: false,
        asset_allocation: {
            "S&P 500 non-retirement": 0.7,
            "tax-exempt bonds": 0.3
        }
    });

    const spendingStrategy = ["vacation", "streaming services"];  // List of discretionary expenses
    const expenseWithdrawalStrategy = [
        SP_non_retirement.special_id,
        bond_non_retirement.special_id,
        SP_aftertax.special_id
    ];  // List of investments for expense withdrawals
    const RMDStrategy = [SP_pretax.special_id];  // Pre-tax investments for RMDs
    const RothConversionStrategy = [SP_pretax.special_id];

    scenario.spending_strategy = spendingStrategy;
    scenario.expense_withdrawl_strategy = expenseWithdrawalStrategy;
    scenario.rmd_strategy = RMDStrategy;
    scenario.roth_conversion_strategy = RothConversionStrategy;

    await scenario.save()
    console.log(scenario)

    return scenario;
}

async function runTest() {
    try {
        //create the scenario or find it
        let scenario;
        try {
            scenario = await createTestScenario();
            console.log("Created test scenario");
        } catch {}

        console.log("Finding test scenario...")
        scenario = await Scenario.findOne({
            where: { name: "Retirement Planning Scenario" },
            include: [
                { model: Investment, as: "Investments" },
                { model: InvestmentType, as: "InvestmentTypes" },
                { model: EventSeries,
                    include: [
                        { model: IncomeEventSeries },
                        { model: ExpenseEventSeries },
                        { model: InvestEventSeries },
                        { model: RebalanceEventSeries }
                    ],
                    as: "EventSeries"
                },
            ],
        });

        console.log("Running simulation...");
        await simulateScenario(scenario);
        
        console.log("Simulation completed successfully!");
    } catch (error) {
        console.error("Error running simulation:", error);
    }
}

runTest();
