// src/data/sampleSimulationData.js

/**
 * Generates sample simulation runs.
 *
 * @param {number} nRuns - Number of simulation runs to generate.
 * @param {number} startYear - The starting year for the simulation.
 * @param {number} maxYears - Maximum number of years per simulation (i.e. life expectancy).
 * @returns {Array<Array<Object>>} An array of simulation runs; each run is an array of "yearData" objects.
 */
export function generateSampleSimulations(nRuns, startYear, maxYears) {
    const simulationRuns = [];
    console.log(`Generating ${nRuns} simulation run(s) starting from year ${startYear} with up to ${maxYears} year(s) each.`);
  
    for (let i = 0; i < nRuns; i++) {
      const run = [];
      let currentYear = startYear;
  
      // Start with base values that can vary by run.
      let income = 50000 + Math.random() * 10000;    // Starting income between ~50k and 60k.
      let expenses = 30000 + Math.random() * 5000;     // Starting expenses between ~30k and 35k.
      
      console.log(`\n=== Simulation Run ${i + 1} ===`);
      
      for (let j = 0; j < maxYears; j++) {
        const net = income - expenses;
        const yearData = {
          year: currentYear,
          investments: [], // Not used for the chart.
          eventSeries: [], // Not used for the chart.
          totalIncome: income,
          totalExpenses: expenses,
          federalTax: 0,
          stateTax: 0,
          capitalGainsTax: 0,
          earlyWithdrawalTax: 0,
          discretionaryExpensesPaidPercentage: 0
        };
  
        // Log details for this year
        console.log(`Year ${currentYear}: income=${income.toFixed(2)}, expenses=${expenses.toFixed(2)}, net=${net.toFixed(2)}`);
        
        run.push(yearData);
  
        // Simulate early termination: after at least 3 years, there's a chance the simulation ends.
        if (j > 2 && Math.random() < 0.1) {
          console.log(`Simulation run ${i + 1} terminated early at year ${currentYear}.`);
          break;
        }
  
        // Prepare for the next year.
        currentYear++;
  
        // Increase income and expenses to simulate growth.
        // For income, grow between 3% and 7%.
        const incomeGrowthFactor = 1 + (0.03 + Math.random() * 0.04);
        income = income * incomeGrowthFactor;
  
        // For expenses, also grow between 3% and 7%.
        const expenseGrowthFactor = 1 + (0.03 + Math.random() * 0.04);
        expenses = expenses * expenseGrowthFactor;
      }
  
      console.log(`Simulation run ${i + 1} complete; generated ${run.length} year(s) of data.`);
      simulationRuns.push(run);
    }
    return simulationRuns;
  }
  
  /**
   * Aggregates simulation runs to compute, for each year, the percentage of runs
   * in which the net (totalIncome - totalExpenses) meets or exceeds the financial goal.
   *
   * Only simulation runs that have data for a particular year are considered in the percentage calculation.
   *
   * @param {Array<Array<Object>>} simulationRuns - The array of simulation runs.
   * @param {number} financialGoal - The financial goal to test against.
   * @returns {Array<Object>} An array of objects, each with a "year" and "percentage" property.
   */
  export function aggregateSimulationResults(simulationRuns, financialGoal) {
    // We'll use an object to gather counts per year.
    const aggregated = {};
    console.log(`\nAggregating simulation results using financial goal: ${financialGoal}`);
  
    simulationRuns.forEach((run, runIndex) => {
      console.log(`\nProcessing simulation run ${runIndex + 1}, ${run.length} year(s)`);
      run.forEach(yearData => {
        const { year, totalIncome, totalExpenses } = yearData;
        const net = totalIncome - totalExpenses;
        console.log(`  Year ${year}: net=${net.toFixed(2)}`);
        if (!aggregated[year]) {
          aggregated[year] = { total: 0, success: 0 };
        }
        aggregated[year].total += 1;
        if (net >= financialGoal) {
          aggregated[year].success += 1;
        }
      });
    });
  
    // Convert the aggregated object into an array of { year, percentage }.
    const result = Object.keys(aggregated).map(yearStr => {
      const year = parseInt(yearStr, 10);
      const record = aggregated[year];
      const percentage = (record.success / record.total) * 100;
      console.log(`\nYear ${year}: ${record.success} of ${record.total} runs met the goal (${percentage.toFixed(2)}%)`);
      return { year, percentage };
    });
  
    // Sort the results by year.
    result.sort((a, b) => a.year - b.year);
    console.log(`\nAggregated Results:`, result);
    return result;
  }
  