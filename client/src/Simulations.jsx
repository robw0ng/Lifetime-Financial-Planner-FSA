import { useData } from './DataContext';
import React, { useRef, useEffect } from 'react';
import { useSelected } from './SelectedContext';
import styles from './Simulations.module.css';
import { sampleBarData } from './data/sampleData';
import * as d3 from 'd3';
function ScenarioList() {
  const { selectedScenario, setSelectedScenario, deselectScenario } =
    useSelected();

  function selectScenario(scenario) {
    if (selectedScenario && scenario.id === selectedScenario.id) {
      deselectScenario();
    } else if (scenario.id !== 0) {
      setSelectedScenario(scenario);
      console.log(scenario);
    }
  }

  const { scenarios, setScenarios } = useData();
  let scenariosList = scenarios;

  if (scenariosList.length <= 0) {
    scenariosList = [{ name: 'No scenarios available...', id: null }];
  }

  return (
    <section
      className={`${styles['outer-container']} ${styles['scenario-list-container']}`}
    >
      <div
        className={`${styles['inner-container']} ${styles['scenario-list']}`}
      >
        <h2 className={styles['scenario-list-title']}>Scenarios:</h2>
        <div className={styles['scenario-item-list']}>
          {scenariosList.map((scenario, index) => (
            <div
              key={scenario.id}
              className={
                selectedScenario && scenario.id === selectedScenario.id
                  ? `${styles['selected']} ${styles['scenario-item']}`
                  : styles['scenario-item']
              }
              onClick={
                scenario.id !== null ? () => selectScenario(scenario) : undefined
              }
            >
              <span>{scenario.name}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Summary(){

  const { 
    oneDim,
    setOneDim,
    selectedScenario
  } = useSelected();

  function selectOneDim(){
    setOneDim(true);
  }

  function selectTwoDim(){
    setOneDim(false);
  }

  return (
    <div className={styles['summary']}>
      <div className={styles['outer-container']}>
        <div className={styles['inner-container']}>
        <div className={styles['active-scenario']}>
            <span>📊 Active Scenario: </span>
            <span>{selectedScenario?.name ?? 'None Selected!'}</span>
        </div>
        <h2 className={styles['summary-title']}>Simulate:</h2>
          <div className={`${styles['scenario-shared-button-container']}`}>
          <button 
          className={
            oneDim === true
            ? `${styles['share-button']} ${styles['selected']}`
            : styles['share-button']          
          }
          onClick={selectOneDim}
          >
          One Dimension</button>
          <button 
          className={
            oneDim === false
            ? `${styles['share-button']} ${styles['selected']}`
            : styles['share-button']          
          }
          onClick={selectTwoDim}
          >
          Two Dimension</button>
        </div> 
        </div>
      </div>
    </div>
  );
}

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

function InvestmentsGraph(){
  return (
    <div className={styles['investment-graph']}>
      <div className={styles['outer-container']}>
        <div className={styles['inner-container']}>
          INVESTMENTS GRAPH HERE
        </div>
      </div>
    </div>

  );
}

export default function Simulations(){
    return (
        <div className={styles['dashboard']}>
            <div className={`${styles['column']} ${styles['col-1']}`}> 
                <ScenarioList />
                <Summary />
                
            </div>
            <div className={`${styles['column']} ${styles['col-2']}`}>
              
              <SuccessGraph />
            </div>
        </div>
    );
}