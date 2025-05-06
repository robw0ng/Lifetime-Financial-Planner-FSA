// src/components/ChartHandler.jsx

import React, { useMemo } from 'react';
import { sampleSimulationRuns } from './data/sampleSimulationRuns';
import {
    ResponsiveContainer,
    ComposedChart,
    Area,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ReferenceLine,
    LineChart
  } from 'recharts';

/**
 * Compute per-year success rate based solely on that year's totalIncome.
 * Returns [{ year, probability }, …], where probability is in [0,100].
 */
function computeYearlySuccessRate(runs, goal) {
  if (!runs.length) return [];
  const years = runs[0].map(d => d.year);
  const totalRuns = runs.length;

  return years.map((year, i) => {
    const count = runs.reduce(
      (acc, run) => acc + (run[i].totalIncome >= goal ? 1 : 0),
      0
    );
    return {
      year,
      probability: (count / totalRuns) * 100
    };
  });
}

function computeQuantiles(runs, type) {
  if (!runs.length) return [];

  // pick which field to chart
  let accessor;
  switch (type) {
    case 'total_investments':
      accessor = rec => rec.investments.reduce((sum, v) => sum + v, 0);
      break;
    case 'total_income':
      accessor = rec => rec.totalIncome;
      break;
    case 'total_expenses':
      accessor = rec => rec.totalExpenses;
      break;
    case "early_withdrawal_tax":
        accessor = rec => rec.earlyWithdrawalTax;
        break;

    case "percentage_of_total_discretionary_expenses":
        accessor = rec => rec.percentageOfTotalDiscretionaryExpenses;
        break;
        
    default:
      throw new Error(`Unknown quantile type: ${type}`);
  }

  const years = runs[0].map(d => d.year);

  return years.map((year, i) => {
    const vals = runs
      .map(run => accessor(run[i]))
      .sort((a, b) => a - b);

    const q = q => {
      const pos = (vals.length - 1) * q;
      const lo = Math.floor(pos), hi = Math.ceil(pos);
      return vals[lo] + (vals[hi] - vals[lo]) * (pos - lo);
    };

    return {
      year,
      p10: q(0.1),
      p20: q(0.2),
      p30: q(0.3),
      p40: q(0.4),
      median: q(0.5),
      p60: q(0.6),
      p70: q(0.7),
      p80: q(0.8),
      p90: q(0.9)
    };
  });
}
  
  /**
   * Build band widths and bases for stacking in the shaded chart.
   */
  function buildBandData(quantData) {
    return quantData.map(d => ({
      year: d.year,
      base10: d.p10,
      band1090: d.p90 - d.p10,
      base20: d.p20,
      band2080: d.p80 - d.p20,
      base30: d.p30,
      band3070: d.p70 - d.p30,
      base40: d.p40,
      band4060: d.p60 - d.p40,
      median: d.median
    }));
  }



/**
 * Master renderer: takes a numeric code and spits back the right chart.
 * For chartType === 0, renders “Probability of success over time.”
 */
export default function parseChartString(str) {
    const goal = 100000;
    const words = str ? str.trim().split(/\s+/) : '' ;
  switch (words[0]) {
    case "Probability_of_success_over_time": {
      // ← adjust this threshold to your scenario’s goal
      
      const data = computeYearlySuccessRate(sampleSimulationRuns, goal);

      return (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart
            data={data}
            margin={{ top: 20, right: 20, bottom: 20, left: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="year" />
            <YAxis
              domain={[0, 100]}
              tickFormatter={v => `${v.toFixed(0)}%`}
            />
            <Tooltip formatter={v => `${v.toFixed(1)}%`} />
            <Line
              type="monotone"
              dataKey="probability"
              stroke="#007bff"
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      );
    }
    
    case "Probability_ranges_for_a_selected_quantity_over_time:": {
        // Financial goal line
            // Compute and memoize quantiles & bands
            let quantData = useMemo(
            () => computeQuantiles(sampleSimulationRuns, words[1]),
            []
            );
            let data = useMemo(() => buildBandData(quantData), [quantData]);
    
            return (
            <ResponsiveContainer width="100%" height={350}>
                <ComposedChart data={data} margin={{ top: 20, right: 20, bottom: 20, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="year" />
                <YAxis />
                <Tooltip formatter={val => new Intl.NumberFormat().format(val)} />
                <ReferenceLine y={goal} stroke="red" strokeDasharray="3 3" label="Goal" />
    
                {/* 10–90% band */}
                <Area type="monotone" dataKey="base10" stackId="1" stroke="none" fill="none" />
                <Area type="monotone" dataKey="band1090" stackId="1" stroke="none" fill="#8884d8" fillOpacity={0.15} />
    
                {/* 20–80% band */}
                <Area type="monotone" dataKey="base20" stackId="2" stroke="none" fill="none" />
                <Area type="monotone" dataKey="band2080" stackId="2" stroke="none" fill="#8884d8" fillOpacity={0.30} />
    
                {/* 30–70% band */}
                <Area type="monotone" dataKey="base30" stackId="3" stroke="none" fill="none" />
                <Area type="monotone" dataKey="band3070" stackId="3" stroke="none" fill="#8884d8" fillOpacity={0.50} />
    
                {/* 40–60% band */}
                <Area type="monotone" dataKey="base40" stackId="4" stroke="none" fill="none" />
                <Area type="monotone" dataKey="band4060" stackId="4" stroke="none" fill="#8884d8" fillOpacity={0.70} />
    
                {/* Median line */}
                <Line type="monotone" dataKey="median" stroke="#333" dot={false} strokeWidth={2} />
                </ComposedChart>
            </ResponsiveContainer>
            );
      }

    // …other chartType cases here…

    default:
      return <div>Unknown chart type: {words}</div>;
  }
}
