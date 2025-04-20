import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';
import { useData } from "./DataContext";
import { useSelected } from "./SelectedContext";
import styles from "./Dashboard.module.css";
import { sampleBarData, sampleLineData } from "./data/sampleData";

// ScenarioList Component
function ScenarioList() {
  const { selectedScenario, setSelectedScenario, deselectScenario } = useSelected();
  const { scenarios } = useData();

  function selectScenario(scenario) {
    if (selectedScenario && scenario.id === selectedScenario.id) {
      deselectScenario();
    } else if (scenario.id !== 0) {
      setSelectedScenario(scenario);
      console.log(scenario);
    }
  }

  let scenariosList = scenarios;
  if (scenariosList.length <= 0) {
    scenariosList = [{ name: "No scenarios available...", id: null }];
  }

  return (
    <section className={`${styles["outer-container"]} ${styles["scenario-list-container"]}`}>
      <div className={`${styles["inner-container"]} ${styles["scenario-list"]}`}>
        <h2 className={styles["scenario-list-title"]}>Scenarios:</h2>
        <div className={styles["scenario-item-list"]}>
          {scenariosList.map((scenario) => (
            <div
              key={scenario.id}
              className={
                selectedScenario && scenario.id === selectedScenario.id
                  ? `${styles["selected"]} ${styles["scenario-item"]}`
                  : styles["scenario-item"]
              }
              onClick={scenario.id !== null ? () => selectScenario(scenario) : undefined}
            >
              <span>{scenario.name}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Summary Component
function Summary() {
  const { selectedScenario } = useSelected();
  const totalPortfolioValue = selectedScenario?.investments
    ? Array.from(selectedScenario.investments).reduce((sum, investment) => sum + investment.value, 0)
    : 0;
  const formattedPortfolioValue = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(totalPortfolioValue);

  return (
    <div className={styles["summary"]}>
      <div className={styles["outer-container"]}>
        <div className={styles["inner-container"]}>
          <h2 className={styles["summary-title"]}>Summary:</h2>
          <div className={styles["active-scenario"]}>
            <span>📊 Active Scenario: </span>
            <span>{selectedScenario?.name ?? "None Selected!"}</span>
          </div>
          <div className={styles["total-portfolio-value"]}>
            <span>💰 Total Portfolio Value: </span>
            <span>{formattedPortfolioValue}</span>
          </div>
          <div className={styles["last-simulation-run"]}>
            <span>📈 Last Simulation Run: </span>
          </div>
          <div className={styles["probability-success"]}>
            <span>🎯 Probability Of Success: </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Bar Chart Component (SuccessGraph)
export function SuccessGraph({ data = sampleBarData }) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (data && containerRef.current) {
      // Clear any previous content
      d3.select(containerRef.current).selectAll("*").remove();

      // Set up SVG canvas
      const svg = d3.select(containerRef.current)
                    .append("svg")
                    .attr("width", 500)
                    .attr("height", 300);

      const margin = { top: 20, right: 30, bottom: 30, left: 40 };
      const width = 500 - margin.left - margin.right;
      const height = 300 - margin.top - margin.bottom;

      const g = svg.append("g")
                   .attr("transform", `translate(${margin.left},${margin.top})`);

      // Create scales
      const x = d3.scaleBand()
                  .domain(data.map(d => d.name))
                  .range([0, width])
                  .padding(0.1);

      const y = d3.scaleLinear()
                  .domain([0, d3.max(data, d => d.value)])
                  .nice()
                  .range([height, 0]);

      // Append axes
      g.append("g")
       .attr("transform", `translate(0,${height})`)
       .call(d3.axisBottom(x));

      g.append("g")
       .call(d3.axisLeft(y));

      // Append bars
      g.selectAll(".bar")
       .data(data)
       .enter()
       .append("rect")
         .attr("class", "bar")
         .attr("x", d => x(d.name))
         .attr("y", d => y(d.value))
         .attr("width", x.bandwidth())
         .attr("height", d => height - y(d.value));
    }
  }, [data]);

  return (
    <div className={styles["success-graph"]}>
      <div className={styles["outer-container"]}>
        <div className={styles["inner-container"]} ref={containerRef}>
          {/* D3 will render the bar chart here */}
        </div>
      </div>
    </div>
  );
}

// Line Chart Component (InvestmentsGraph)
export function InvestmentsGraph({ data = sampleLineData }) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (data && containerRef.current) {
      // Clear any previous content
      d3.select(containerRef.current).selectAll("*").remove();

      // Set up SVG canvas
      const svg = d3.select(containerRef.current)
                    .append("svg")
                    .attr("width", 500)
                    .attr("height", 300);

      const margin = { top: 20, right: 30, bottom: 30, left: 40 };
      const width = 500 - margin.left - margin.right;
      const height = 300 - margin.top - margin.bottom;

      const g = svg.append("g")
                   .attr("transform", `translate(${margin.left},${margin.top})`);

      // Parse date strings into Date objects (if dates exist)
      const parseDate = d3.timeParse("%Y-%m-%d");
      data.forEach(d => {
        if (d.date) {
          d.date = parseDate(d.date);
        }
      });

      // Create scales
      const x = d3.scaleTime()
                  .domain(d3.extent(data, d => d.date))
                  .range([0, width]);

      const y = d3.scaleLinear()
                  .domain([0, d3.max(data, d => d.value)])
                  .nice()
                  .range([height, 0]);

      // Append axes
      g.append("g")
       .attr("transform", `translate(0,${height})`)
       .call(d3.axisBottom(x));

      g.append("g")
       .call(d3.axisLeft(y));

      // Define the line generator
      const line = d3.line()
                     .x(d => x(d.date))
                     .y(d => y(d.value));

      // Append the line path
      g.append("path")
       .datum(data)
       .attr("fill", "none")
       .attr("stroke", "steelblue")
       .attr("stroke-width", 2)
       .attr("d", line);
    }
  }, [data]);

  return (
    <div className={styles["investment-graph"]}>
      <div className={styles["outer-container"]}>
        <div className={styles["inner-container"]} ref={containerRef}>
          {/* D3 will render the line chart here */}
        </div>
      </div>
    </div>
  );
}

// Main Dashboard Component
export default function Dashboard() {
  return (
    <div className={styles["dashboard"]}>
      <div className={`${styles["column"]} ${styles["col-1"]}`}>
        <Summary />
        <ScenarioList />
      </div>
      <div className={`${styles["column"]} ${styles["col-2"]}`}>
        <SuccessGraph data={sampleBarData} />
        <InvestmentsGraph data={sampleLineData} />
      </div>
    </div>
  );
}
