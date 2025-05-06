// export const sampleSimulationRuns = [
//   // Run #1
//   [
//     {
//       year: 2025,
//       investments: [100000],
//       eventSeries: [],
//       totalIncome: 1000000,
//       totalExpenses: 40000,
//       federalTax: 5000,
//       stateTax: 2000,
//       capitalGainsTax: 1000,
//       earlyWithdrawalTax: 0,
//       discretionaryExpensesPaidPercentage: 0.15,
//     },
//     {
//       year: 2026,
//       investments: [110000],
//       eventSeries: [],
//       totalIncome: 61000,
//       totalExpenses: 41000,
//       federalTax: 5100,
//       stateTax: 2050,
//       capitalGainsTax: 1100,
//       earlyWithdrawalTax: 0,
//       discretionaryExpensesPaidPercentage: 0.16,
//     },
//     {
//       year: 2027,
//       investments: [120000],
//       eventSeries: [],
//       totalIncome: 62000,
//       totalExpenses: 42000,
//       federalTax: 5200,
//       stateTax: 2100,
//       capitalGainsTax: 1200,
//       earlyWithdrawalTax: 0,
//       discretionaryExpensesPaidPercentage: 0.17,
//     },
//     {
//       year: 2028,
//       investments: [130000],
//       eventSeries: [],
//       totalIncome: 63000,
//       totalExpenses: 43000,
//       federalTax: 5300,
//       stateTax: 2150,
//       capitalGainsTax: 1300,
//       earlyWithdrawalTax: 0,
//       discretionaryExpensesPaidPercentage: 0.18,
//     },
//     {
//       year: 2029,
//       investments: [140000],
//       eventSeries: [],
//       totalIncome: 64000,
//       totalExpenses: 44000,
//       federalTax: 5400,
//       stateTax: 2200,
//       capitalGainsTax: 1400,
//       earlyWithdrawalTax: 0,
//       discretionaryExpensesPaidPercentage: 0.19,
//     },
//   ],

//   // Run #2
//   [
//     {
//       year: 2025,
//       investments: [100000],
//       eventSeries: [],
//       totalIncome: 1000000,
//       totalExpenses: 40000,
//       federalTax: 5000,
//       stateTax: 2000,
//       capitalGainsTax: 1000,
//       earlyWithdrawalTax: 0,
//       discretionaryExpensesPaidPercentage: 0.15,
//     },
//     {
//       year: 2026,
//       investments: [110000],
//       eventSeries: [],
//       totalIncome: 61000,
//       totalExpenses: 41000,
//       federalTax: 5100,
//       stateTax: 2050,
//       capitalGainsTax: 1100,
//       earlyWithdrawalTax: 0,
//       discretionaryExpensesPaidPercentage: 0.16,
//     },
//     {
//       year: 2027,
//       investments: [120000],
//       eventSeries: [],
//       totalIncome: 62000,
//       totalExpenses: 42000,
//       federalTax: 5200,
//       stateTax: 2100,
//       capitalGainsTax: 1200,
//       earlyWithdrawalTax: 0,
//       discretionaryExpensesPaidPercentage: 0.17,
//     },
//     {
//       year: 2028,
//       investments: [130000],
//       eventSeries: [],
//       totalIncome: 63000,
//       totalExpenses: 43000,
//       federalTax: 5300,
//       stateTax: 2150,
//       capitalGainsTax: 1300,
//       earlyWithdrawalTax: 0,
//       discretionaryExpensesPaidPercentage: 0.18,
//     },
//     {
//       year: 2029,
//       investments: [140000],
//       eventSeries: [],
//       totalIncome: 64000,
//       totalExpenses: 44000,
//       federalTax: 5400,
//       stateTax: 2200,
//       capitalGainsTax: 1400,
//       earlyWithdrawalTax: 0,
//       discretionaryExpensesPaidPercentage: 0.19,
//     },
//   ],
//   [
//     {
//       year: 2025,
//       investments: [100000],
//       eventSeries: [],
//       totalIncome: 1000000,
//       totalExpenses: 40000,
//       federalTax: 5000,
//       stateTax: 2000,
//       capitalGainsTax: 1000,
//       earlyWithdrawalTax: 0,
//       discretionaryExpensesPaidPercentage: 0.15,
//     },
//     {
//       year: 2026,
//       investments: [110000],
//       eventSeries: [],
//       totalIncome: 61000,
//       totalExpenses: 41000,
//       federalTax: 5100,
//       stateTax: 2050,
//       capitalGainsTax: 1100,
//       earlyWithdrawalTax: 0,
//       discretionaryExpensesPaidPercentage: 0.16,
//     },
//     {
//       year: 2027,
//       investments: [120000],
//       eventSeries: [],
//       totalIncome: 62000,
//       totalExpenses: 42000,
//       federalTax: 5200,
//       stateTax: 2100,
//       capitalGainsTax: 1200,
//       earlyWithdrawalTax: 0,
//       discretionaryExpensesPaidPercentage: 0.17,
//     },
//     {
//       year: 2028,
//       investments: [130000],
//       eventSeries: [],
//       totalIncome: 63000,
//       totalExpenses: 43000,
//       federalTax: 5300,
//       stateTax: 2150,
//       capitalGainsTax: 1300,
//       earlyWithdrawalTax: 0,
//       discretionaryExpensesPaidPercentage: 0.18,
//     },
//     {
//       year: 2029,
//       investments: [140000],
//       eventSeries: [],
//       totalIncome: 64000,
//       totalExpenses: 44000,
//       federalTax: 5400,
//       stateTax: 2200,
//       capitalGainsTax: 1400,
//       earlyWithdrawalTax: 0,
//       discretionaryExpensesPaidPercentage: 0.19,
//     },
//   ],
// ];
// src/data/sampleSimulationRuns.js

/**
 * Generate sample runs with varying investment trajectories
 * to showcase shaded quantile charts.
 */
const YEARS = Array.from({ length: 16 }, (_, i) => 2025 + i);

export const sampleSimulationRuns = Array.from(
  { length: 12 }, // 12 independent simulation runs
  (_, runIdx) => {
    // Introduce a tiny drift difference per run
    const drift = 0.04 + runIdx * 0.005;
    // Volatility (±10%) around the drift path
    const vol = 0.1;
    return YEARS.map((year, i) => {
      // deterministic growth
      const base = 100000 * Math.pow(1 + drift, i);
      // random log-normal noise
      const noiseFactor = Math.exp((Math.random() - 0.5) * vol);
      const value = Math.round(base * noiseFactor);
      return {
        year,
        // single 'investment' line per run
        investments: [value],
        totalIncome: value,
        totalExpenses:value,
        earlyWithdrawalTax:value,
        percentageOfTotalDiscretionaryExpenses: value,

      };
    });
  }
);
