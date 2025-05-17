// src/data/batchedSimulationData.js

import { simulateResults, initialInvestments } from './sampleSimulationRuns';

// Configuration
const NUM_RUNS     = 100;                // number of runs per batch
const START_YEAR   = 2025;
const NUM_YEARS    = 20;
// your “batches”—first one is baseline
const BATCH_LABELS = [10, 20, 30, 40];

const baseRuns = Array.from({ length: NUM_RUNS }, () =>
  simulateResults(initialInvestments, START_YEAR, NUM_YEARS)
);

export const batchedSimulationData = BATCH_LABELS.map(label => {
  const offset = (label - BATCH_LABELS[0]) * 10000;
  return {
    label,
    runs: baseRuns.map(run =>
      run.map(year => {

        const investments = year.investments.map(inv => ({
          ...inv,
          value: Number((inv.value + offset).toFixed(2))
        }));

        return {
          ...year,
          investments,
    
        };
      })
    )
  };
});
