// src/components/ChartHandler.jsx

import React, { useMemo } from 'react';
import { useSelected } from './SelectedContext';
import { useData } from './DataContext';
import { simulatedData as sampleSimulation } from './data/sampleSimulationRuns';
import { batchedSimulationData } from './data/batchedSimulationData';
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
          .reduce((sum, inv) => sum + Number(inv.value || 0), 0);
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

function computeYearlySuccessRate(runs, goal) {
  if (!runs.length) return [];
  const years = runs[0].map(r => r.year);
  return years.map((year, i) => {
    const count = runs.filter(run =>
      run[i].investments.reduce((s, inv) => s + Number(inv.value || inv), 0) >= goal
    ).length;
    return { year, probability: (count / runs.length) * 100 };
  });
}


export function ProbSuccessChart({ runs, goal }) {
  const data = useMemo(() => computeYearlySuccessRate(runs, goal), [runs, goal]);
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data} margin={{ top:20, right:20, bottom:20, left:0 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="year" allowDecimals={false} />
        <YAxis domain={[0,100]} tickFormatter={v => `${v}%`} />
        <Tooltip formatter={v => `${v.toFixed(1)}%`} />
        <Line type="monotone" dataKey="probability" stroke="#007bff" dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}


function computeQuantiles(runs, type) {
  if (!runs.length) return [];
  const accessorMap = {
    total_investments: r => r.investments.reduce((s, inv) => s + Number(inv.value || inv), 0),
    total_income:      r => r.totalIncome,
    total_expenses:    r => r.totalExpenses,
    early_withdrawal_tax: r => r.earlyWithdrawalTax,
    percentage_of_total_discretionary_expenses: r => r.percentageOfTotalDiscretionaryExpenses
  };
  const accessor = accessorMap[type];
  if (!accessor) throw new Error(`Unknown quantile type: ${type}`);
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
}

function buildBandData(data) {
  return data.map(d => ({
    year: d.year,
    base10: d.p10, band1090: d.p90 - d.p10,
    base20: d.p20, band2080: d.p80 - d.p20,
    base30: d.p30, band3070: d.p70 - d.p30,
    base40: d.p40, band4060: d.p60 - d.p40,
    median: d.median
  }));
}

function ProbRangesChart({ runs, quantity, goal }) {
  const quant = useMemo(() => computeQuantiles(runs, quantity), [runs, quantity]);
  const data  = useMemo(() => buildBandData(quant), [quant]);

  return (
    <ResponsiveContainer width="100%" height={350}>
      <ComposedChart data={data} margin={{ top:20, right:20, bottom:20, left:0 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="year" />
        <YAxis />
        <Tooltip formatter={v => new Intl.NumberFormat().format(v)} />
        <ReferenceLine y={goal} stroke="red" strokeDasharray="3 3" label="Goal" />

        {/* 10th–90th percentile band */}
        <Area type="monotone" dataKey="base10"   stackId="1" stroke="none" fillOpacity={0} />
        <Area type="monotone" dataKey="band1090" stackId="1" stroke="none" fill="#8884d8" fillOpacity={0.15} />

        {/* 20th–80th percentile band */}
        <Area type="monotone" dataKey="base20"   stackId="2" stroke="none" fillOpacity={0} />
        <Area type="monotone" dataKey="band2080" stackId="2" stroke="none" fill="#8884d8" fillOpacity={0.3} />

        {/* 30th–70th percentile band */}
        <Area type="monotone" dataKey="base30"   stackId="3" stroke="none" fillOpacity={0} />
        <Area type="monotone" dataKey="band3070" stackId="3" stroke="none" fill="#8884d8" fillOpacity={0.45} />

        {/* 40th–60th percentile band */}
        <Area type="monotone" dataKey="base40"   stackId="4" stroke="none" fillOpacity={0} />
        <Area type="monotone" dataKey="band4060" stackId="4" stroke="none" fill="#8884d8" fillOpacity={0.6} />

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
          .sort((a,b) => a - b);
        if (isMedian) {
          const m = Math.floor(totals.length/2);
          row[b.label] = totals.length % 2 === 0
            ? (totals[m-1] + totals[m]) / 2
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
      <LineChart data={data} margin={{ top:20, right:20, bottom:20, left:0 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="year" allowDecimals={false} />
        <YAxis
          domain={isMedian ? undefined : [0,100]}
          tickFormatter={v => isMedian ? v : `${v.toFixed(1)}%`}
        />
        <Tooltip formatter={v => isMedian ? v.toLocaleString() : `${v.toFixed(1)}%`} />
        <Legend verticalAlign="top" height={36} />
        {batches.map((b,i) => (
          <Line
            key={b.label}
            dataKey={String(b.label)}
            name={`Batch ${b.label}`}
            stroke={['#007bff','#28a745','#dc3545'][i % 3]}
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
            vals.sort((a,b) => a - b);
            const m = Math.floor(vals.length/2);
            return vals.length % 2 === 0
              ? (vals[m-1] + vals[m]) / 2
              : vals[m];
          })()
        : vals.reduce((s,n) => s + n, 0) / vals.length;
      row[key] = Number(v.toFixed(2));
    });
    return row;
  });

  const keep = keys.filter(key => !data.every(r => r[key] < threshold));
  const other = keys.filter(k => !keep.includes(k));
  if (other.length) {
    data.forEach(r => {
      r.Other = other.reduce((s,k) => s + r[k], 0);
    });
    keep.push('Other');
  }
  return { data, keys: keep };
}

export function InvestmentStackedBarChart({ selection, threshold }) {
  const { data, keys } = useStackedInvestmentData(selection, threshold);
  const palette = ['#8884d8','#82ca9d','#ffc658','#ff8042','#8dd1e1','#a4de6c','#d0ed57','#8a89a6'];
  return (
    <ResponsiveContainer width="100%" height={400}>
      <BarChart data={data} margin={{ top:20, right:20, bottom:20, left:0 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="year" />
        <YAxis />
        <Tooltip />
        <Legend />
        {keys.map((key,i) => (
          <Bar key={key} dataKey={key} stackId="invest" fill={palette[i % palette.length]} />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}

export function ParameterLineChart({ batches, goal, quantity }) {
  const data = batches.map(batch => {
    const last = batch.runs[0].length - 1;
    const totals = batch.runs
      .map(run => run[last].investments.reduce((s,v) => s + Number(v || 0), 0))
      .sort((a,b) => a - b);
    let value;
    if (quantity === 'final_probability_of_success') {
      const count = totals.filter(t => t >= goal).length;
      value = (count / totals.length) * 100;
    } else if (quantity === 'median_total_investments') {
      const m = Math.floor(totals.length/2);
      value = totals.length % 2 === 0
        ? (totals[m-1] + totals[m]) / 2
        : totals[m];
    } else {
      value = totals.reduce((s,n) => s + n, 0) / totals.length;
    }
    return { batch: batch.label, value };
  });
  const isProb = quantity === 'final_probability_of_success';

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data} margin={{ top:20, right:20, bottom:20, left:0 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="batch" />
        <YAxis domain={isProb ? [0,100] : undefined} tickFormatter={v => isProb ? `${v.toFixed(1)}%` : v} />
        <Tooltip formatter={v => isProb ? `${v.toFixed(1)}%` : v.toLocaleString()} />
        <Line dataKey="value" stroke="#ff7300" dot={{ r:4 }} />
      </LineChart>
    </ResponsiveContainer>
  );
}

export default function ParseChartString({ command }) {
  const { selectedScenario } = useSelected();
  const runs    = useChartRuns();
  const batches = batchedSimulationData;
  const goal    = selectedScenario?.financial_goal ?? 0;
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
    default:
      return <div>Unknown chart type: {cmd}</div>;
  }
}
