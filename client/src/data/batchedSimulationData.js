// src/data/batchedSimulationData.js

import { simulateResults, initialInvestments } from './sampleSimulationRuns';

// Configuration
const NUM_RUNS     = 100;                // number of runs per batch
const START_YEAR   = 2025;
const NUM_YEARS    = 20;
// your “batches”—first one is baseline
const BATCH_LABELS = [10, 2000, 5000];

// 1) Generate a base set of runs once
const baseRuns = Array.from({ length: NUM_RUNS }, () =>
  simulateResults(initialInvestments, START_YEAR, NUM_YEARS)
);

// 2) For each label, produce a batch by applying an offset to both investments & totalIncome
export const batchedSimulationData = BATCH_LABELS.map(label => {
  const offset = (label - BATCH_LABELS[0]) * 1000;
  return {
    label,
    runs: baseRuns.map(run =>
      run.map(year => {
        // shift each investment value
        const investments = year.investments.map(inv => ({
          ...inv,
          value: Number((inv.value + offset).toFixed(2))
        }));
        // also shift the totalIncome so success probabilities diverge
        //const totalIncome = Number((year.totalIncome + offset).toFixed(2));
        return {
          ...year,
          investments,
    
        };
      })
    )
  };
});
