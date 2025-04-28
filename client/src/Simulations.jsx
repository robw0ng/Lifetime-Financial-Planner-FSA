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
    simStyle,
    setSimStyle,
    selectedScenario
  } = useSelected();

  function selectRegular(){
    setSimStyle(0);
  }
  function selectOneDim(){
    setSimStyle(1);
  }

  function selectTwoDim(){
    setSimStyle(2);
  }


  const renderSimOptions = () => {
    switch (simStyle) {
      case 0:
        return (
          <div className={styles['options']}>
            {/* put your “Regular” options here */}
            <label>
              <input type="checkbox" /> Include taxes
            </label>
            <label>
              <input type="checkbox" /> Include inflation
            </label>
          </div>
        );
      case 1:
        return (
          <div className={styles['options']}>
            {/* your “One Dimension” options */}
            <label>
              <input type="radio" name="dim" /> Show only income
            </label>
            <label>
              <input type="radio" name="dim" /> Show only expenses
            </label>
          </div>
        );
      case 2:
        return (
          <div className={styles['options']}>
            {/* your “Two Dimension” options */}
            <label>
              X-axis:
              <select>
                <option value="time">Time</option>
                <option value="age">Age</option>
              </select>
            </label>
            <label>
              Y-axis:
              <select>
                <option value="wealth">Wealth</option>
                <option value="spending">Spending</option>
              </select>
            </label>
          </div>
        );
      default:
        return null;
    }
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
            simStyle === 0
            ? `${styles['share-button']} ${styles['selected']}`
            : styles['share-button']          
          }
          onClick={selectRegular}
          >
          Regular</button>
          <button 
          className={
            simStyle === 1
            ? `${styles['share-button']} ${styles['selected']}`
            : styles['share-button']          
          }
          onClick={selectOneDim}
          >
          One Dimension</button>
          <button 
          className={
            simStyle === 2
            ? `${styles['share-button']} ${styles['selected']}`
            : styles['share-button']          
          }
          onClick={selectTwoDim}
          >
          Two Dimension
          </button>
          
          <div className={styles['simulation-options-container']}>
            {renderSimOptions()}
          </div>
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