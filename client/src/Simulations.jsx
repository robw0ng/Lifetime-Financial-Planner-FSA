import { useData } from './DataContext';
import { useState } from 'react';
import React, { useRef, useEffect } from 'react';
import { useSelected } from './SelectedContext';
import styles from './Simulations.module.css';
import { sampleBarData } from './data/sampleData';
import * as d3 from 'd3';
import EventSeriesList from './EventSeries.jsx';

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

function EventSeriesListShort() {
  const { selectedEventSeries, setSelectedEventSeries, deselectEventSeries, selectedScenario } =
    useSelected();


  let seriesArray = selectedScenario ? Array.from(selectedScenario.EventSeries || []) : [];

  if (seriesArray.length === 0) {
    seriesArray.push({ id: null, name: null, type: null, startYear: { value: null } });
  }

  const selectEvent = (event) => {
    if (selectedEventSeries && event.id === selectedEventSeries.id) {
      deselectEventSeries();
    } else {
      setSelectedEventSeries(event);
    }
  };


  return (
    <section
      className={`${styles['outer-container']} ${styles['scenario-list-container']}`}
    >
      <div
        className={`${styles['inner-container']} ${styles['scenario-list']}`}
      >
        <h2 className={styles['scenario-list-title']}>Event Series:</h2>
        <div className={styles['scenario-item-list']}>
          {seriesArray.map((event, index) => (
            <div
              key={event.id ?? index}
              className={
                selectedEventSeries?.id === event.id
                  ? `${styles['selected']} ${styles['event-series-item']}`
                  : styles['event-series-item']
              }
              onClick={event.id !== null ? () => selectEvent(event) : undefined}
            >
              <span>{event.name}</span>
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
    simStyle2,
    setSimStyle,
    setSimStyle2,
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

  function selectRO1(){
    setSimStyle2(0);
  }

  function selectStartYear1(){
    setSimStyle2(1);
  }

  function selectYearDuration1(){
    setSimStyle2(2);
  }

  function selectInitialIncome(){
    setSimStyle2(3);
  }

  function selectPercentage(){
    setSimStyle2(4);
  }


  const[regularData, setRegularData] = useState({
    numRuns:'',
  });

  const[oneData, setOneData] = useState({
    numRuns:'',
    rmdSelect: '', //boolean whether or not the user chose the rmd as the parameter
    numericType: '', //0, 1, or 2, depending on the type of numeric value being used as the dimension
    lowerBound: '',
    upperBound: '',
    stepSize: '',
    //also an event series would be selected

  });

  const[twoData, setTwoData] = useState({
    numRuns:'',
  });

  const handleRegChange = (e) => {
		const { name, value, type, checked } = e.target;
		setRegularData((prev) => ({
			...prev,
			[name]: type === 'checkbox' ? checked : value,
		}));
  }

  const handleOneChange = (e) => {
      const { name, value, type, checked } = e.target;
      setOneData((prev) => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value,
      }));
  };

  const handleTwoChange = (e) => {
      const { name, value, type, checked } = e.target;
      setTwoData((prev) => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value,
      }));
    };
  const handleRegSubmit = async (e) => {
    e.preventDefault();   
  }

  const handleSubmit = async (e) => {
    e.preventDefault();   
  }
  
  
  const renderOneSimOptions = () =>{
    switch(simStyle2){
      case 0:
       //roth optimizer true false setup here
        return(
        <form onSubmit = {handleSubmit} className ="form-container">
          <div>
            This option will run two sets of simulations, one with the Roth Optimizer enabled and one without
          </div>
          <div>
            Number of Sims to run:
          </div>
          <input             
            type="number"
            value={regularData.numRuns}
            name="numRuns"
            onChange={handleRegChange}>
          </input>
          <button type="submit" className="submit-btn">
            Run Simulations
          </button>
        </form>
        );

      case 1:
        return(
          <form onSubmit = {handleSubmit} className ="form-container">
          <EventSeriesListShort/>
          <div>
            Number of Sims to run:
          </div>
          <input             
            type="number"
            value={regularData.numRuns}
            name="numRuns"
            onChange={handleRegChange}>
          </input>
          <button type="submit" className="submit-btn">
            Run Simulations
          </button>
        </form>
      );
      case 2:
        //supposed to be reserved for duration but idk I think this is stupid
      case 3:
        //Initial income selector
        return(
          <form onSubmit = {handleRegSubmit} className ="form-container">
          <EventSeriesListShort/>
          <div>
            Number of Sims to run:
          </div>
          <input             
            type="number"
            value={regularData.numRuns}
            name="numRuns"
            onChange={handleRegChange}>
          </input>
          <button type="submit" className="submit-btn">
            Run Simulations
          </button>
        </form>
      );
      case 4:
        return(
          <form onSubmit = {handleSubmit} className ="form-container">
          <EventSeriesListShort/>
          <div>
            Number of Sims to run:
          </div>
          <input             
            type="number"
            value={regularData.numRuns}
            name="numRuns"
            onChange={handleRegChange}>
          </input>
          <button type="submit" className="submit-btn">
            Run Simulations
          </button>
        </form>
      );
        //percentage selector
    }
  }
  const renderSimOptions = () => {
    switch (simStyle) {
      case 0:
        return (
          <form onSubmit = {handleSubmit} className ="form-container">
            <div>
              Number of Sims to run:
            </div>
            <input             
              type="number"
              value={regularData.numRuns}
              name="numRuns"
              onChange={handleRegChange}
              required
            >
              

            </input>
            <button type="submit" className="submit-btn">
					    Run Simulations
				    </button>
          </form>
        //   <div className={styles['options']}>
        //   {/* your “One Dimension” options */}
        //   <label>
        //     <input type="radio" name="dim" /> Show only income
        //   </label>
        //   <label>
        //     <input type="radio" name="dim" /> Show only expenses
        //   </label>
        // </div>
        );
      case 1:
          return (
              <div className={styles['options']}>
              <div className={`${styles['scenario-shared-button-container']}`}>
              <button 
              className={
                simStyle2 === 0
                ? `${styles['share-button']} ${styles['selected']}`
                : styles['share-button']          
                }
                onClick={selectRO1}
              >
              Roth Optimizer</button>
              
              <button 
              className={
                simStyle2 === 1
                ? `${styles['share-button']} ${styles['selected']}`
                : styles['share-button']          
              }
              onClick={selectStartYear1}
              >
              Years</button>
              <button 
              className={
                simStyle2 === 3
                ? `${styles['share-button']} ${styles['selected']}`
                : styles['share-button']          
              }
              onClick={selectInitialIncome}
              >
              Income
              </button>
              <button 
              className={
                simStyle2 === 4
                ? `${styles['share-button']} ${styles['selected']}`
                : styles['share-button']          
              }
              onClick={selectPercentage}
              >
              Percentage
              </button>
              
              <div className={styles['simulation-options-container']}>
                {renderOneSimOptions()}
              </div>
              </div> 

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

  if (!selectedScenario) {
    return (
      <div className={styles['summary']}>
        <div className={styles['outer-container']}>
          <div className={styles['inner-container']}>
            <div className={styles['active-scenario']}>
              <span>📊 Active Scenario: </span>
              <span>None Selected!</span>
            </div>
            <div className={styles['no-selection-message']}>
              you must select a scenario to proceed
            </div>
          </div>
        </div>
      </div>
    );
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