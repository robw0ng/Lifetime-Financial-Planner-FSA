// src/data/sampleGridSimulationRuns.js

import { simulateResults, initialInvestments } from './sampleSimulationRuns';

const NUM_RUNS   = 100;
const START_YEAR = 2025;
const NUM_YEARS  = 20;

// Parameter ranges for your 2D exploration
export const P1_VALUES = [10, 20, 30, 40];
export const P2_VALUES = [10, 20, 30, 40, 50, 60, 70, 80];

/**
 * gridData is a 2D array: gridData[i][j] corresponds to
 *   p1 = P1_VALUES[i], p2 = P2_VALUES[j]
 * Each cell has { p1, p2, runs }, where runs is an array
 * of NUM_RUNS simulations with both offsets applied.
 */
export const gridData = P1_VALUES.map(p1 =>
  P2_VALUES.map(p2 => {
    const offset1 = (p1 - P1_VALUES[0]) * 1000;
    const offset2 = (p2 - P2_VALUES[0]) * 1000;

    // Generate NUM_RUNS independent runs
    const runs = Array.from({ length: NUM_RUNS }, () => {
      const baseRun = simulateResults(initialInvestments, START_YEAR, NUM_YEARS);
      // Apply both offsets to each year's investments
      return baseRun.map(year => ({
        ...year,
        investments: year.investments.map(inv => ({
          ...inv,
          value: Number((inv.value + offset1 + offset2).toFixed(2))
        }))
      }));
    });

    return { p1, p2, runs };
  })
);
