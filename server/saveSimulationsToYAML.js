const fs = require('fs');
const yaml = require('js-yaml');
const path = require('path');

/**
 * Save grouped simulation results to a YAML file.
 * @param {Array<Object>} simulations - Array of { scenarioName, results }
 * @param {string} filename - Path to the YAML file to write
 */
function saveSimulationsToYAML(simulations, filename) {
  const cleanedSimulations = simulations.map(({ scenarioName, results }) => ({
    scenarioName,
    results: results.map(yearData => ({
      year: yearData.year,
      investments: yearData.investments.map(inv => ({
        id: inv.special_id,
        value: Math.round(inv.value * 100) / 100
      })),
      eventSeries: yearData.eventSeries.map(evt => ({
        name: evt.name,
        type: evt.type,
        amount: Math.round(evt.amount * 100) / 100
      })),
      totalIncome: yearData.totalIncome,
      totalExpenses: yearData.totalExpenses,
      federalTax: yearData.federalTax,
      stateTax: yearData.stateTax,
      capitalGainsTax: yearData.capitalGainsTax,
      earlyWithdrawalTax: yearData.earlyWithdrawalTax,
      discretionaryExpensesPaidPercentage: yearData.discretionaryExpensesPaidPercentage
    }))
  }));

  const filePath = path.resolve(filename);
  const yamlString = yaml.dump(cleanedSimulations, { lineWidth: -1 });

  fs.writeFileSync(filePath, yamlString, 'utf8');
  console.log(`✅ Saved simulation results to ${filePath}`);
}

module.exports = {
  saveSimulationsToYAML
};
