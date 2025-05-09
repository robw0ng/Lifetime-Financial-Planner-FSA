// src/data/sampleSimulationRuns.js

/**
 * Simplified growth‐only simulation with randomness:
 *  - Each year every investment grows by GROWTH_RATE ± jitter
 *  - totalIncome = sum of investments
 *  - totalExpenses = (EXPENSE_RATIO ± jitter) × totalIncome
 *  - federalTax, stateTax, capitalGainsTax use fixed rates
 */
const GROWTH_RATE         = 1.05;    // base 5% growth per year
const GROWTH_JITTER       = 0.10;    // ±10% random on that growth
const EXPENSE_RATIO       = 0.30;    // base 30% of income
const EXPENSE_JITTER      = 0.10;    // ±10% random on expenses
const FEDERAL_TAX_RATE    = 0.20;    // 20% of totalIncome
const STATE_TAX_RATE      = 0.05;    //  5% of totalIncome
const CGT_RATE            = 0.15;    // 15% of gains
const EARLY_WITHDRAWAL_TAX = 0;      // stubbed

export function simulateResults(initialInvestments, startYear = 2025, numYears = 20) {
  // deep copy so we don’t mutate outside
  let investments = initialInvestments.map(inv => ({ ...inv }));
  let prevSum      = investments.reduce((sum, inv) => sum + inv.value, 0);

  const results = [];

  for (let i = 0; i < numYears; i++) {
    const year = startYear + i;

    // randomize growth around GROWTH_RATE
    const growthFactor = GROWTH_RATE * (1 + (Math.random() * 2 - 1) * GROWTH_JITTER);

    // apply to each investment
    investments = investments.map(inv => ({
      ...inv,
      value: Number((inv.value * growthFactor).toFixed(2)),
      // keep tax_status static or randomize here if you like
    }));

    const totalInv    = investments.reduce((sum, inv) => sum + inv.value, 0);
    const gains       = Number((totalInv - prevSum).toFixed(2));
    const totalIncome = totalInv;

    // randomize expense ratio around EXPENSE_RATIO
    const expenseRatio   = EXPENSE_RATIO * (1 + (Math.random() * 2 - 1) * EXPENSE_JITTER);
    const totalExpenses  = Number((totalIncome * expenseRatio).toFixed(2));

    // compute taxes
    const federalTax        = Number((totalIncome * FEDERAL_TAX_RATE).toFixed(2));
    const stateTax          = Number((totalIncome * STATE_TAX_RATE).toFixed(2));
    const capitalGainsTax   = Number((gains * CGT_RATE).toFixed(2));
    const earlyWithdrawalTax= EARLY_WITHDRAWAL_TAX;

    // push a structured year record
    results.push({
      year,
      stateTax,
      federalTax,
      eventSeries: [],               // stubbed out
      investments: investments.map(inv => ({ ...inv })),
      totalIncome,
      totalExpenses,
      capitalGainsTax,
      earlyWithdrawalTax,
      discretionaryExpensesPaidPercentage: 1 // assume fully paid
    });

    prevSum = totalInv;
  }

  return results;
}

// seed data
export const initialInvestments = [
  { id: 1, value: 2000000, special_id: 'cash',                    tax_status: 'non-retirement', scenario_id: 1, purchase_price: 100,   investment_type_id: 1 },
  { id: 2, value:  800000, special_id: 'S&P 500 non-retirement', tax_status: 'non-retirement', scenario_id: 1, purchase_price: 430000, investment_type_id: 2 },
  { id: 3, value:  400000, special_id: 'tax-exempt bonds',       tax_status: 'non-retirement', scenario_id: 1, purchase_price: 180000, investment_type_id: 3 },
];

// generate multiple runs so your bands reappear
const NUM_RUNS   = 100;
const START_YEAR = 2025;
const NUM_YEARS  = 20;

export const simulatedData = {
  results: Array.from({ length: NUM_RUNS }, () =>
    simulateResults(initialInvestments, START_YEAR, NUM_YEARS)
  )
};
