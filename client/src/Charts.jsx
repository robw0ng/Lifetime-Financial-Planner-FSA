// src/components/ChartHandler.jsx

import React, { useMemo, useState } from 'react';
import Plot from 'react-plotly.js';
import { useSelected } from './SelectedContext';
import { useData } from './DataContext';
import { simulatedData as sampleSimulation } from './data/sampleSimulationRuns';
import { batchedSimulationData } from './data/batchedSimulationData';
import { gridData } from './data/sampleGridSimulations';
import {
  ResponsiveContainer,
  LineChart,
  ComposedChart,
  BarChart,
  Bar,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  Legend
} from 'recharts';

function computeMetric(runs, quantity, goal) {
  const totals = runs.map(run => {
    const last = run[run.length - 1];
    return (last.investments || [])
      .reduce((sum, inv) => sum + Number(inv.value || inv), 0);
  });

  if (quantity === 'prob_of_success') {
    const count = totals.filter(t => t >= goal).length;
    return totals.length ? (count / totals.length) * 100 : 0;
  }
  if (quantity === 'median_total_investments') {
    const sorted = [...totals].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 === 0
      ? (sorted[mid - 1] + sorted[mid]) / 2
      : sorted[mid];
  }
  const sum = totals.reduce((s, x) => s + x, 0);
  return totals.length ? sum / totals.length : 0;
}

function useChartRuns() {
  const { selectedScenario } = useSelected();
  const { latestSimulation: liveSimulation } = useData();
  const sim = selectedScenario?.name === 'test'
    ? sampleSimulation
    : liveSimulation;

  return useMemo(() => {
    const results = sim?.results || [];
    return results.map(run =>
      run.map(yearObj => {
        const totalInv = (yearObj.investments || [])
          .reduce((sum, inv) => sum + Number(inv.value || inv), 0);
        return {
          year: yearObj.year,
          investments: yearObj.investments || [],
          totalIncome: totalInv,
          totalExpenses: yearObj.totalExpenses,
          earlyWithdrawalTax: yearObj.earlyWithdrawalTax,
          percentageOfTotalDiscretionaryExpenses:
            yearObj.discretionaryExpensesPaidPercentage,
        };
      })
    );
  }, [sim]);
}

export function ProbSuccessChart({ runs, goal }) {
  const data = useMemo(() => {
    if (!runs.length) return [];
    const years = runs[0].map(r => r.year);
    return years.map((year, i) => {
      const count = runs.filter(run =>
        run[i].investments.reduce((s, inv) => s + Number(inv.value || inv), 0) >= goal
      ).length;
      return { year, probability: (count / runs.length) * 100 };
    });
  }, [runs, goal]);

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data} margin={{ top: 20, right: 20, bottom: 20, left: 60 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="year" allowDecimals={false} />
        <YAxis domain={[0, 100]} tickFormatter={v => `${v}%`} />
        <Tooltip formatter={v => `${v.toFixed(1)}%`} />
        <Line type="monotone" dataKey="probability" stroke="#007bff" dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}

export function ProbRangesChart({ runs, quantity, goal }) {
  const quantiles = useMemo(() => {
    if (!runs.length) return [];
    const accessorMap = {
      total_investments: r => r.investments.reduce((s, inv) => s + Number(inv.value || inv), 0),
      total_income: r => r.totalIncome,
      total_expenses: r => r.totalExpenses,
      early_withdrawal_tax: r => r.earlyWithdrawalTax,
      percentage_of_total_discretionary_expenses: r => r.percentageOfTotalDiscretionaryExpenses
    };
    const accessor = accessorMap[quantity];
    const years = runs[0].map(r => r.year);
    return years.map((year, i) => {
      const vals = runs.map(r => accessor(r[i])).sort((a, b) => a - b);
      const q = q => {
        const pos = (vals.length - 1) * q;
        const lo = Math.floor(pos), hi = Math.ceil(pos);
        return vals[lo] + (vals[hi] - vals[lo]) * (pos - lo);
      };
      return {
        year,
        p10: q(0.1), p20: q(0.2), p30: q(0.3), p40: q(0.4),
        median: q(0.5), p60: q(0.6), p70: q(0.7), p80: q(0.8), p90: q(0.9)
      };
    });
  }, [runs, quantity]);

  const data = useMemo(() => quantiles.map(d => ({
    year: d.year,
    base10: d.p10, band1090: d.p90 - d.p10,
    base20: d.p20, band2080: d.p80 - d.p20,
    base30: d.p30, band3070: d.p70 - d.p30,
    base40: d.p40, band4060: d.p60 - d.p40,
    median: d.median
  })), [quantiles]);

  return (
    <ResponsiveContainer width="100%" height={350}>
      <ComposedChart data={data} margin={{ top: 20, right: 20, bottom: 20, left: 60 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="year" />
        <YAxis />
        <Tooltip formatter={v => new Intl.NumberFormat().format(v)} />
        <ReferenceLine y={goal} stroke="red" strokeDasharray="3 3" label="Goal" />
        <Area type="monotone" dataKey="base10" stackId="1" fillOpacity={0} />
        <Area type="monotone" dataKey="band1090" stackId="1" fill="#8884d8" fillOpacity={0.15} />
        <Area type="monotone" dataKey="base20" stackId="2" fillOpacity={0} />
        <Area type="monotone" dataKey="band2080" stackId="2" fill="#8884d8" fillOpacity={0.3} />
        <Area type="monotone" dataKey="base30" stackId="3" fillOpacity={0} />
        <Area type="monotone" dataKey="band3070" stackId="3" fill="#8884d8" fillOpacity={0.45} />
        <Area type="monotone" dataKey="base40" stackId="4" fillOpacity={0} />
        <Area type="monotone" dataKey="band4060" stackId="4" fill="#8884d8" fillOpacity={0.6} />
        <Line type="monotone" dataKey="median" stroke="#333" dot={false} strokeWidth={2} />
      </ComposedChart>
    </ResponsiveContainer>
  );
}

export function MultiLineChart({ batches, goal, quantity }) {
  const isMedian = quantity === 'median_total_investments';
  const data = useMemo(() => {
    if (!batches.length) return [];
    const years = batches[0].runs[0].map(y => y.year);
    return years.map((y, idx) => {
      const row = { year: y };
      batches.forEach(b => {
        const totals = b.runs
          .map(run => run[idx].investments.reduce((s, inv) => s + Number(inv.value || inv), 0))
          .sort((a, b) => a - b);
        if (isMedian) {
          const m = Math.floor(totals.length / 2);
          row[b.label] = totals.length % 2 === 0
            ? (totals[m - 1] + totals[m]) / 2
            : totals[m];
        } else {
          const count = totals.filter(t => t >= goal).length;
          row[b.label] = (count / totals.length) * 100;
        }
      });
      return row;
    });
  }, [batches, goal, isMedian]);

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data} margin={{ top: 20, right: 20, bottom: 20, left: 60 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="year" allowDecimals={false} />
        <YAxis
          domain={isMedian ? undefined : [0, 100]}
          tickFormatter={v => isMedian ? v : `${v.toFixed(1)}%`}
        />
        <Tooltip formatter={v => isMedian ? v.toLocaleString() : `${v.toFixed(1)}%`} />
        <Legend verticalAlign="top" height={36} />
        {batches.map((b, i) => (
          <Line
            key={b.label}
            dataKey={String(b.label)}
            name={`Batch ${b.label}`}
            stroke={['#007bff', '#28a745', '#dc3545'][i % 3]}
            dot={false}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}

function useStackedInvestmentData(selection = 'average', threshold = 0) {
  const { selectedScenario } = useSelected();
  const { latestSimulation: liveSimulation } = useData();
  const sim = selectedScenario?.name === 'test'
    ? sampleSimulation
    : liveSimulation;
  const runs = sim?.results || [];

  if (!runs.length) return { data: [], keys: [] };
  const years = runs[0].map(y => y.year);
  const invSet = new Set();
  runs.forEach(run =>
    run.forEach(yr =>
      yr.investments.forEach(inv => invSet.add(inv.special_id))
    )
  );
  let keys = Array.from(invSet);

  const data = years.map((year, idx) => {
    const row = { year };
    keys.forEach(key => {
      const vals = runs.map(run => {
        const inv = run[idx].investments.find(i => i.special_id === key);
        return inv ? Number(inv.value || 0) : 0;
      });
      const v = selection === 'median'
        ? (() => {
            vals.sort((a, b) => a - b);
            const m = Math.floor(vals.length / 2);
            return vals.length % 2 === 0
              ? (vals[m - 1] + vals[m]) / 2
              : vals[m];
          })()
        : vals.reduce((s, n) => s + n, 0) / vals.length;
      row[key] = Number(v.toFixed(2));
    });
    return row;
  });

  const keep = keys.filter(key => !data.every(r => r[key] < threshold));
  const other = keys.filter(k => !keep.includes(k));
  if (other.length) {
    data.forEach(r => {
      r.Other = other.reduce((s, k) => s + r[k], 0);
    });
    keep.push('Other');
  }
  return { data, keys: keep };
}

export function InvestmentStackedBarChart({ selection, threshold }) {
  const { data, keys } = useStackedInvestmentData(selection, threshold);
  const palette = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#8dd1e1', '#a4de6c', '#d0ed57', '#8a89a6'];
  return (
    <ResponsiveContainer width="100%" height={400}>
      <BarChart data={data} margin={{ top: 20, right: 20, bottom: 20, left: 60 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="year" />
        <YAxis />
        <Tooltip />
        <Legend />
        {keys.map((key, i) => (
          <Bar key={key} dataKey={key} stackId="invest" fill={palette[i % palette.length]} />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}

export function ParameterLineChart({ batches, goal, quantity }) {
  console.log(batches);
  const data = batches.map(batch => {
    const totals = batch.runs.map(run => {
      const last = run[run.length - 1];
      const invs = Array.isArray(last.investments) ? last.investments : [];
      return invs.reduce((sum, inv) => sum + Number(inv.value || inv), 0);
    });
    let value = 0;
    if (quantity === 'final_probability_of_success') {
      const count = totals.filter(t => t >= goal).length;
      value = totals.length ? (count / totals.length) * 100 : 0;
    } else if (quantity === 'median_total_investments') {
      const sorted = [...totals].sort((a, b) => a - b);
      const mid = Math.floor(sorted.length / 2);
      value = sorted.length % 2 === 0
        ? (sorted[mid - 1] + sorted[mid]) / 2
        : sorted[mid];
    } else {
      const sum = totals.reduce((s, x) => s + x, 0);
      value = sum;
    }
    return { batch: batch.label, value };
  });
  const isProb = quantity === 'final_probability_of_success';
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data} margin={{ top: 20, right: 20, bottom: 20, left: 60 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="batch" />
        <YAxis
          domain={isProb ? [0, 100] : ['auto', 'auto']}
          tickFormatter={v => isProb ? `${v.toFixed(1)}%` : v.toLocaleString()}
        />
        <Tooltip formatter={v => isProb ? `${v.toFixed(1)}%` : v.toLocaleString()} />
        <Line dataKey="value" stroke="#ff7300" dot={{ r: 4 }} />
      </LineChart>
    </ResponsiveContainer>
  );
}

export function SurfaceChart({
  gridData,
  quantity,
  goal,
  xLabel = 'Param 2',
  yLabel = 'Param 1',
  zLabel,
}) {
  const xValues = useMemo(
    () => (gridData[0] || []).map(cell => cell.p2),
    [gridData]
  );
  const yValues = useMemo(
    () => gridData.map(row => row[0]?.p1),
    [gridData]
  );
  if (!['prob_of_success','median_total_investments','average_total_investments']
      .includes(quantity)) {
    return <div>Invalid metric: {quantity}</div>;
  }
  const zMatrix = useMemo(
    () => gridData.map(row => row.map(cell => computeMetric(cell.runs, quantity, goal))),
    [gridData, quantity, goal]
  );
  return (
    <Plot
      data={[{ type: 'surface', x: xValues, y: yValues, z: zMatrix }]}
      layout={{
        scene: {
          xaxis: { title: xLabel },
          yaxis: { title: yLabel },
          zaxis: { title: zLabel },
        },
        margin: { t: 30, l: 60, r: 0, b: 0 },
      }}
      style={{ width: '100%', height: '500px' }}
    />
  );
}

export function ContourChart({
  gridData,
  quantity,
  goal,
  xLabel = 'Param 2',
  yLabel = 'Param 1',
  zLabel,
}) {
  console.log(gridData);
  const xValues = useMemo(
    () => (gridData[0] || []).map(cell => cell.p2),
    [gridData]
  );
  const yValues = useMemo(
    () => gridData.map(row => row[0]?.p1),
    [gridData]
  );
  if (!['prob_of_success','median_total_investments','average_total_investments']
      .includes(quantity)) {
    return <div>Invalid metric: {quantity}</div>;
  }
  const zMatrix = useMemo(
    () => gridData.map(row => row.map(cell => computeMetric(cell.runs, quantity, goal))),
    [gridData, quantity, goal]
  );
  return (
    <Plot
      data={[{
        type: 'contour',
        x: xValues,
        y: yValues,
        z: zMatrix,
        contours: { coloring: 'heatmap' },
        colorbar: { title: zLabel }
      }]}
      layout={{
        xaxis: { title: xLabel },
        yaxis: { title: yLabel },
        margin: { t: 30, l: 60, r: 30, b: 50 },
      }}
      style={{ width: '100%', height: '500px' }}
    />
  );
}

export default function ParseChartString({ command }) {
  const { selectedScenario } = useSelected();
  const runs = useChartRuns();
  const batches = batchedSimulationData;
  const goal = selectedScenario?.financial_goal ?? 0;
  const [cmd, qty] = (command || '').trim().split(/\s+/);

  if (!selectedScenario) {
    return <div>Please select a scenario.</div>;
  }
  switch (cmd) {
    case 'Probability_of_success_over_time':
      return <ProbSuccessChart runs={runs} goal={goal} />;
    case 'Probability_ranges_for_a_selected_quantity_over_time:':
      return <ProbRangesChart runs={runs} quantity={qty} goal={goal} />;
    case 'multi_line:':
      return <MultiLineChart batches={batches} goal={goal} quantity={qty} />;
    case 'Stacked_bar_chart:':
      return <InvestmentStackedBarChart selection={qty || 'average'} threshold={Number((command.split(/\s+/)[2] || 0))} />;
    case 'param_line:':
      return <ParameterLineChart batches={batches} goal={goal} quantity={qty} />;
    case 'surface:':
      return (
        <SurfaceChart
          gridData={gridData}
          quantity={qty}
          goal={goal}
          zLabel={qty === 'prob_of_success' ? 'Probability of Success (%)' : 'Total Investments'}
        />
      );
    case 'contour:':
      return (
        <ContourChart
          gridData={gridData}
          quantity={qty}
          goal={goal}
          zLabel={qty === 'prob_of_success' ? 'Probability of Success (%)' : 'Total Investments'}
        />
      );
    default:
      return <div></div>;
  }
}
