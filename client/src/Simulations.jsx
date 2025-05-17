import { useData } from './DataContext';
import { useState } from 'react';
import React, { useRef, useEffect } from 'react';
import { useSelected } from './SelectedContext';
import styles from './Simulations.module.css';

import * as d3 from 'd3';
import EventSeriesList from './EventSeries.jsx';
import { Link } from 'react-router-dom';
import ParseChartString from './Charts';

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
  const {
    selectedEventSeries,
    setSelectedEventSeries,
    deselectEventSeries,
    selectedScenario,
    selectedSim,
    setSelectedSim,
    simStyle,    // bring in simStyle too
    simStyle2,
  } = useSelected();

  useEffect(() => {
    deselectEventSeries();
  }, [selectedScenario]);

  // 1) raw array of event series
  const rawSeries = selectedScenario
    ? Array.from(selectedScenario.EventSeries || [])
    : [];

  // 2) apply filters:
  // - if simStyle === 3: only income or expense series
  // - else if simStyle2 === 4: only invest series with exactly 2 assets
  // - otherwise show all
  const filteredSeries =
    simStyle2 === 3
      ? rawSeries.filter(ev =>
          ev.type === 'income' || ev.type === 'expense'
        )
      : simStyle2 === 4
      ? rawSeries.filter(
          ev =>
            ev.type === 'invest' &&
            ev.asset_allocation &&
            Object.keys(ev.asset_allocation).length === 2
        )
      : rawSeries;

  // 3) fallback if empty
  const seriesArray =
    filteredSeries.length > 0
      ? filteredSeries
      : [{ id: null, name: null, type: null, startYear: { value: null } }];

  const selectEvent = (event) => {
    if (selectedEventSeries?.id === event.id) {
      deselectEventSeries();
    } else {
      setSelectedEventSeries(event);
    }
  };

  return (
    <section className={`${styles['outer-container']} ${styles['scenario-list-container']}`}>
      <div className={`${styles['inner-container']} ${styles['scenario-list']}`}>
        <h2 className={styles['scenario-list-title']}>Event Series:</h2>
        <div className={styles['scenario-item-list']}>
          {seriesArray.map((event, idx) => (
            <div
              key={event.id ?? idx}
              className={
                selectedEventSeries?.id === event.id
                  ? `${styles['selected']} ${styles['event-series-item']}`
                  : styles['event-series-item']
              }
              onClick={event.id != null ? () => selectEvent(event) : undefined}
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
    selectedScenario,
    selectedEventSeries,
    setChartStrings,
  } = useSelected();

  const {
    updateChartConfigs,
    fetchLatestSimulation,
    latestSimulation
  } = useData();
  // guard in case there’s no scenario yet:

  function selectRegular(){
    setSimStyle(0);
  }
  
  function selectOneDim(){
    setSimStyle(1);
  }

  function selectTwoDim(){
    setSimStyle(2);
    console.log(simStyle);
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
  const {runSimulation} = useData();

  const[oneData, setOneData] = useState({
    numRuns:'',
    rmdSelect: false, //boolean whether or not the user chose the rmd as the parameter
    numericType: '', //0, 1, or 2, depending on the type of numeric value being used as the dimension
    lowerBound: '',
    upperBound: '',
    stepSize: '',
    duration: false,
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
    

    try{
      runSimulation(selectedScenario.id, regularData.numRuns);
      await updateChartConfigs(latestSimulation.id, null);
      setChartStrings([]);
    }catch(err){
      console.error("error running simulation:", err);
      return null;
    }
  }
  const handleOneRMDSubmit = async (e) => {
    const {explore1d} = useData();
    e.preventDefault();
    try{
       explore1d(selectedScenario.id, "rmd", 0 ,0 ,0, oneData.numRuns);
    }catch (err){
      console.error('Error running simulation: ', err);
    }
  }

  const handleOneYearSubmit = async (e) => {
    const {explore1d} = useData();
    e.preventDefault();
    try{
      if(oneData.duration === false){
        explore1d(selectedScenario.id, "year-date", oneData.lowerBound, oneData.upperBound, oneData.stepSize, oneData.numRuns); //add support for passing selectedEventSeries
      }else if(oneData.duration === true){
        explore1d(selectedScenario.id, "year-duration", oneData.lowerBound, oneData.upperBound, oneData.stepSize, oneData.numRuns);
      }
       
    }catch (err){
      console.error('Error running simulation: ', err);
    }
    e.preventDefault();   
  }

  const handleOneIncomeSubmit = async (e) => {
    const {explore1d} = useData();
    e.preventDefault();
    try{
      explore1d(selectedScenario.id, "income", oneData.lowerBound, oneData.upperBound, oneData.stepSize, oneData.numRuns); //add support for passing selectedEventSeries
    }catch (err){
      console.error('Error running simulation: ', err);
    }
    e.preventDefault();   
  }
  const handleSubmit = async (e) => {
    e.preventDefault();   
  }
  
  const handleOnePercentSubmit = async (e) =>{
    const {explore1d} = useData();
    e.preventDefault();
    try{
      explore1d(selectedScenario.id, "percent", oneData.lowerBound, oneData.upperBound, oneData.stepSize, oneData.numRuns); //add support for passing selectedEventSeries
    }catch (err){
      console.error('Error running simulation: ', err);
    }
    e.preventDefault();   
  }

  const renderOneSimOptions = () => {
    switch (simStyle2) {
      case 0:
        return (
          <form onSubmit={handleOneRMDSubmit} className="form-container">
            <div>
              This option will run two sets of simulations, one with the Roth
              Optimizer enabled and one without.
            </div>
            <div>
            { !(selectedScenario?.is_roth_optimizer_enabled) ? (
              <div style={{ color: 'crimson' }}>
                To use this parameter, the scenario must have the roth optimizer enabled.
              </div>
            ) : (
              <>
                <div>
                  Number of Sims to run:
                </div>
                <input
                  type="number"
                  value={oneData.numRuns}
                  name="numRuns"
                  onChange={handleOneChange}
                />
                <button type="submit" className="submit-btn">
                  Run Simulations
                </button>
              </>
            ) }
            </div>
          </form>
        );

      case 1:
        return(
          <form onSubmit = {handleOneYearSubmit} className ="form-container">
          <EventSeriesListShort/>
          <div>
            Number of Sims to run:
          </div>
          <input             
            type="number"
            value={oneData.numRuns}
            name="numRuns"
            onChange={handleOneChange}
            required>
            
          </input>
          <div>
            Duration of series? If left unchecked, numeric value will be considered as start year.
          </div>
          <input             
            type="checkbox"
            value={oneData.duration}
            name="duration"
            onChange={handleOneChange}
            required>
          </input>
          <div>
            lower bound:
          </div>
          <input             
            type="number"
            value={oneData.lowerBound}
            name="lowerBound"
            onChange={handleOneChange}
            required>
          </input>
          <div>
            upper bound:
          </div>
          <input             
            type="number"
            value={oneData.upperBound}
            name="upperBound"
            onChange={handleOneChange}
            required>
          </input>
          <div>
            step size:
          </div>
          <input             
            type="number"
            value={oneData.stepSize}
            name="stepSize"
            onChange={handleOneChange}
            required>
          </input>
          {selectedEventSeries !== null && (
            <button type="submit" className="submit-btn">
              Run Simulations
            </button>
            )
          }

        </form>
      );
      case 2:
        //supposed to be reserved for duration but idk I think this is stupid
      case 3:
        //Initial income selector
        return(
          <form onSubmit = {handleOneIncomeSubmit} className ="form-container">
          <EventSeriesListShort/>
          <div>
            Number of Sims to run:
          </div>
          <input             
            type="number"
            value={regularData.numRuns}
            name="numRuns"
            onChange={handleOneChange}
            required>
          </input>
          <div>
            lower bound:
          </div>
          <input             
            type="number"
            value={regularData.lowerBound}
            name="lowerBound"
            onChange={handleOneChange}
            required>
          </input>
          <div>
            upper bound:
          </div>
          <input             
            type="number"
            value={regularData.upperBound}
            name="upperBound"
            onChange={handleOneChange}
            required>
          </input>
          <div>
            step size:
          </div>
          <input             
            type="number"
            value={regularData.stepSize}
            name="stepSize"
            onChange={handleOneChange}
            required>
          </input>
          {selectedEventSeries !== null && (
            <button type="submit" className="submit-btn">
              Run Simulations
            </button>
            )
          }

        </form>
      );
      case 4:
        return(
          <form onSubmit = {handleOnePercentSubmit} className ="form-container">
          <EventSeriesListShort/>
          <div>
            Number of Sims to run:
          </div>
          <input             
            type="number"
            value={regularData.numRuns}
            name="numRuns"
            onChange={handleOneChange}
            required>
            
          </input>
          <div>
            lower bound:
          </div>
          <input             
            type="number"
            value={regularData.lowerBound}
            name="lowerBound"
            onChange={handleOneChange}
            required>
          </input>
          <div>
            upper bound:
          </div>
          <input             
            type="number"
            value={regularData.upperBound}
            name="upperBound"
            onChange={handleOneChange}
            required>
          </input>
          <div>
            step size:
          </div>
          <input             
            type="number"
            value={regularData.stepSize}
            name="stepSize"
            onChange={handleOneChange}
            required>
          </input>
          {selectedEventSeries !== null && (
            <button type="submit" className="submit-btn">
              Run Simulations
            </button>
            )
          }

        </form>
      );
        //percentage selector
    }
  }
  const renderSimOptions = () => {
    switch (simStyle) {
      case 0:
        return (
          <form onSubmit = {handleRegSubmit} className ="form-container">
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

// export function SuccessGraph({ data = sampleBarData }) {
//   const containerRef = useRef(null);

//   useEffect(() => {
//     if (data && containerRef.current) {
//       // Clear any previous content
//       d3.select(containerRef.current).selectAll("*").remove();

//       // Set up SVG canvas
//       const svg = d3.select(containerRef.current)
//                     .append("svg")
//                     .attr("width", 500)
//                     .attr("height", 300);

//       const margin = { top: 20, right: 30, bottom: 30, left: 40 };
//       const width = 500 - margin.left - margin.right;
//       const height = 300 - margin.top - margin.bottom;

//       const g = svg.append("g")
//                    .attr("transform", `translate(${margin.left},${margin.top})`);

//       // Create scales
//       const x = d3.scaleBand()
//                   .domain(data.map(d => d.name))
//                   .range([0, width])
//                   .padding(0.1);

//       const y = d3.scaleLinear()
//                   .domain([0, d3.max(data, d => d.value)])
//                   .nice()
//                   .range([height, 0]);

//       // Append axes
//       g.append("g")
//        .attr("transform", `translate(0,${height})`)
//        .call(d3.axisBottom(x));

//       g.append("g")
//        .call(d3.axisLeft(y));

//       // Append bars
//       g.selectAll(".bar")
//        .data(data)
//        .enter()
//        .append("rect")
//          .attr("class", "bar")
//          .attr("x", d => x(d.name))
//          .attr("y", d => y(d.value))
//          .attr("width", x.bandwidth())
//          .attr("height", d => height - y(d.value));
//     }
//   }, [data]);

//   return (
//     <div className={styles["success-graph"]}>
//       <div className={styles["outer-container"]}>
//         <div className={styles["inner-container"]} ref={containerRef}>
//           {/* D3 will render the bar chart here */}
//         </div>
//       </div>
//     </div>
//   );
// }


function SuccessGraph() {
  const {
    chartStrings,
    setChartStrings,
    selectedScenario,
    setSelectedScenario,
  } = useSelected();

  const {
    updateChartConfigs,
    fetchLatestSimulation,
    latestSimulation
  } = useData();

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!latestSimulation?.id || !selectedScenario?.id) return;

    try {
      // 1) send new chartStrings to server
      await updateChartConfigs(latestSimulation.id, chartStrings);

      // 2) pull back the updated simulation into context
      await fetchLatestSimulation(selectedScenario.id);

      // 3) force the parent to rerun its effect & re-render
      const tmp = selectedScenario;
      setSelectedScenario(null);
      setSelectedScenario(tmp);
    } catch (err) {
      console.error('Error generating charts:', err);
    }
  };

  const handleRemove = (idx) =>
    setChartStrings(prev => prev.filter((_, i) => i !== idx));

  return (
    <div className={styles['outer-container']}>
      <div className={styles['inner-container']}>
        <Link to="/create-chart">
          <button
            className={`${styles['action-button']} ${styles['create']}`}
          >
            Add a chart to generate
          </button>
        </Link>

        {chartStrings && chartStrings.length > 0 && (
          <ul className={styles['chart-list']}>
            {chartStrings.map((name, idx) => (
              <li key={idx} className={styles['chart-list-item']}>
                {name}
                <button
                  type="button"
                  className={styles['remove-button']}
                  onClick={() => handleRemove(idx)}
                  aria-label={`Remove ${name}`}
                >
                  &times;
                </button>
              </li>
            ))}
          </ul>
        )}

        <button
          className={`${styles['action-button']} ${styles['create']}`}
          onClick={handleGenerate}
        >
          generate charts
        </button>
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

function CustomDropdown({ items }) {
  const { selectedScenario, selectedChart, setSelectedChart } = useSelected();
  if (!selectedScenario) return null;

  return (
    <div className={styles['options']}>
      <label>
        Choose chart:
        <select
          value={selectedChart || ''}
          onChange={e => setSelectedChart(e.target.value)}
        >
          <option value="" disabled>
            -- select an option --
          </option>
          {(items) && items.map(item => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}


// function CustomDropdown({ items }) {
//   const [open, setOpen] = useState(false);
//   const {selectedChart, setSelectedChart, selectedScenario} = useSelected();
//   const ref = useRef(null);

//   // close when clicking outside
//   useEffect(() => {
//     const onClick = (e) => {
//       if (ref.current && !ref.current.contains(e.target)) {
//         setOpen(false);
//       }
//     };
//     document.addEventListener('mousedown', onClick);
//     return () => document.removeEventListener('mousedown', onClick);
//   }, []);

//   if(!selectedScenario){
//     return <></>
//   }
//   return (
//     <div className={styles.dropdown} ref={ref}>
//       <button
//         type="button"
//         className={styles.toggle}
//         onClick={() => setOpen((o) => !o)}
//       >
//         {selectedChart} ▾
//       </button>

//       {open && (
//         <ul className={styles.menu}>
//           {items.map((item) => (
//             <li
//               key={item}
//               className={styles.item}
//               onClick={() => {
//                 setSelectedChart(item);
//                 setOpen(false);
//               }}
//             >
//               {item}
//             </li>
//           ))}
//         </ul>
//       )}
//     </div>
//   );
// }


export default function Simulations(){
    const {chartStrings, setChartStrings, selectedChart, setSelectedChart, setSelectedSim, selectedSim,selectedScenario, reloadKey, setReloadKey} = useSelected();
    const {fetchLatestSimulation,latestSimulation,setLatestSimulation} = useData();

    useEffect(() => {
      if(selectedScenario){
        
        setSelectedSim((fetchLatestSimulation(selectedScenario.id)));
        console.log("should show null");
        console.log(latestSimulation);
        setSelectedChart(null);
      }else{
        setLatestSimulation(0);
        
      }
    }, [selectedScenario]);


    return (
        <div className={styles['dashboard']}>
            <div className={`${styles['column']} ${styles['col-1']}`}> 
                <ScenarioList />
                <Summary />
                
            </div>
            <div className={`${styles['column']} ${styles['col-2']}`}>
              
              {/* <SuccessGraph /> */}
              <div className={styles['outer-container']}>
              
                <div className={styles['inner-container']} key ={ reloadKey} >
                
                { (latestSimulation && !latestSimulation.charts_updated_flag)
                    ? (
                      <div className={styles.loading}>
                        <SuccessGraph/>
                      </div>
                    )
                    : (
                      <>
                        {
                        (latestSimulation) &&
                        (<div>
                        <CustomDropdown items={latestSimulation.chart_configs} />
                        <ParseChartString command={selectedChart} />
                        </div>)

                        }
                      </>
                    )
                }
              
                { (latestSimulation == 0 && selectedScenario) &&
                  (<div>
                    You gotta run a sim!
                  </div>)
                }
                </div>
              </div>
              
            </div>
        </div>
    );
}
