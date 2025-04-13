import { Link } from "react-router-dom";
import { useSelected } from "./SelectedContext";
import { useData } from "./DataContext";
import styles from "./EventSeries.module.css";

function EventSeriesActions({ eventSeries }) {
  const { selectedScenario, deselectEventSeries, setSelectedEventSeries } = useSelected();
  const { deleteEventSeries, duplicateEventSeries } = useData();

  if (!eventSeries) {
    eventSeries = {
      id: null,
      name: "None!",
    };
  }

  const handleDelete = () => {
    if (eventSeries.id !== null && selectedScenario?.id) {
      const confirmDelete = window.confirm("Are you sure you want to delete this event series?");
      if (confirmDelete) {
        deleteEventSeries(selectedScenario.id, eventSeries.id);
        deselectEventSeries();
      }
    }
  };

  const handleDuplicate = async () => {
    if (eventSeries.id !== null && selectedScenario?.id) {
      const duplicated = await duplicateEventSeries(selectedScenario.id, eventSeries.id);
      setSelectedEventSeries(duplicated);
    }
  };

  return (
    <section className={`${styles["outer-container"]} ${styles["event-series-actions-container"]}`}>
      <div className={`${styles["inner-container"]} ${styles["event-series-actions"]}`}>
        <div className={styles["event-series-actions-content"]}>
          <h2>Event Series Actions:</h2>

          {selectedScenario ? (
            <Link to="/create-event-series" className={`${styles["action-button"]} ${styles["create-btn"]}`}>
              <button
                className={`${styles["action-button"]} ${styles["create"]}`}
                disabled={selectedScenario && selectedScenario.permission && selectedScenario.permission !== "rw"}
              >
                Create New Event Series
              </button>
            </Link>
          ) : (
            <Link className={`${styles["action-button"]} ${styles["create"]}`}>
              <button
                className={`${styles["action-button"]} ${styles["create"]}`}
                disabled={selectedScenario && selectedScenario.permission && selectedScenario.permission !== "rw"}
              >
                Create New Event Series
              </button>
            </Link>
          )}

          <h3>
            <label>Selected Series:</label>
            <label>{eventSeries.name}</label>
          </h3>

          <button
            className={`${styles["action-button"]} ${styles["duplicate"]}`}
            onClick={handleDuplicate}
            disabled={selectedScenario && selectedScenario.permission && selectedScenario.permission !== "rw"}
          >
            Duplicate Event Series
          </button>

          {eventSeries.id !== null ? (
            <Link to={`/edit-event-series/${eventSeries.id}`} className={styles["action-button"]}>
              <button
                className={`${styles["action-button"]} ${styles["edit"]}`}
                disabled={selectedScenario && selectedScenario.permission && selectedScenario.permission !== "rw"}
              >
                Edit Event Series
              </button>
            </Link>
          ) : (
            <Link className={styles["action-button"]}>
              <button
                className={`${styles["action-button"]} ${styles["edit"]}`}
                disabled={selectedScenario && selectedScenario.permission && selectedScenario.permission !== "rw"}
              >
                Edit Event Series
              </button>
            </Link>
          )}

          <button
            className={`${styles["action-button"]} ${styles["delete"]}`}
            onClick={handleDelete}
            disabled={selectedScenario && selectedScenario.permission && selectedScenario.permission !== "rw"}
          >
            Delete Event Series
          </button>
        </div>
      </div>
    </section>
  );
}

function EventSeriesList() {
  const { selectedScenario, selectedEventSeries, setSelectedEventSeries, deselectEventSeries } = useSelected();

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
    <div className={`${styles["outer-container"]} ${styles["event-series-list-container"]}`}>
      <div className={`${styles["inner-container"]} ${styles["event-series-list"]}`}>

        <h2>Event Series:</h2>
        <div className={styles["event-series-list-header"]}>
          <span className={styles["event-series-span"]}>Name</span>
          <span>|</span>
          <span className={styles["event-series-span"]}>Start Year</span>
          <span>|</span>
          <span className={styles["event-series-span"]}>Type</span>
        </div>
        <div className={styles["event-series-item-list"]}>
          {seriesArray.map((event, index) => (
            <div
              key={event.id ?? index}
              className={
                selectedEventSeries?.id === event.id
                  ? `${styles["selected"]} ${styles["event-series-item"]}`
                  : styles["event-series-item"]
              }
              onClick={event.id !== null ? () => selectEvent(event) : undefined}
            >
              <span className={styles["event-series-span"]}>
                {event?.name ?? "—"}
              </span>

              {/* <span className={styles["event-series-span"]}>
                {event.startYear?.value ?? "—"}
              </span> */}
              <span className={styles["event-series-span"]}>
                {event.start_year_type === "fixed"
                  ? event.start_year_value
                  : event.start_year_type === "normal"
                  ? `N(${event.start_year_mean}, ${event.start_year_std_dev})`
                  : event.start_year_type === "uniform"
                  ? `U(${event.start_year_lower}, ${event.start_year_upper})`
                  : event.start_year_type === "sameAsEvent" || event.start_year_type === "yearAfterEvent"
                  ? `${event.start_year_type} (${event.start_year_other_event})`
                  : "—"}
              </span>

              <span className={styles["event-series-span"]}>
                {event?.type ?? "—"}
                </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function EventSeriesInfo({ event }) {
  if (!event) {
    event = {
      name: null,
      type: null,
      description: null,
    };
  }

  // // Render start year information
  // const renderStartYear = () => {
  //   if (!event.startYear) return "";
  //   if (event.startYear.type === "fixed") {
  //     return `${event.startYear.value} (Fixed)`;
  //   } else if (event.startYear.type === "uniform") {
  //     return `Uniform [Min: ${event.startYear.min}, Max: ${event.startYear.max}]`;
  //   } else if (event.startYear.type === "normal") {
  //     return `Normal [Mean: ${event.startYear.mean}, Std: ${event.startYear.std}]`;
  //   } else if (event.startYear.type === "sameAsEvent") {
  //     return `Same as Event (${event.startYear.reference})`;
  //   } else if (event.startYear.type === "yearAfterEvent") {
  //     return `Year After Event (${event.startYear.reference})`;
  //   }
  //   return "";
  // };
  const renderStartYear = () => {
    if (!event.start_year_type) return "—";
  
    switch (event.start_year_type) {
      case "fixed":
        return `${event.start_year_value} (Fixed)`;
      case "uniform":
        return `Uniform [Min: ${event.start_year_lower}, Max: ${event.start_year_upper}]`;
      case "normal":
        return `Normal [Mean: ${event.start_year_mean}, Std: ${event.start_year_std_dev}]`;
      case "sameAsEvent":
        return `Same as Event (${event.start_year_other_event})`;
      case "yearAfterEvent":
        return `Year After Event (${event.start_year_other_event})`;
      default:
        return "—";
    }
  };
  

  // Render duration information
  // const renderDuration = () => {
  //   if (!event.duration) return "";
  //   if (event.duration.type === "fixed") {
  //     return `${event.duration.value} years (Fixed)`;
  //   } else if (event.duration.type === "uniform") {
  //     return `Uniform [Min: ${event.duration.min}, Max: ${event.duration.max}] years`;
  //   } else if (event.duration.type === "normal") {
  //     return `Normal [Mean: ${event.duration.mean}, Std: ${event.duration.std}] years`;
  //   }
  //   return "";
  // };
  const renderDuration = () => {
    if (!event.duration_type) return "—";
  
    switch (event.duration_type) {
      case "fixed":
        return `${event.duration_value} years (Fixed)`;
      case "uniform":
        return `Uniform [Min: ${event.duration_lower}, Max: ${event.duration_upper}] years`;
      case "normal":
        return `Normal [Mean: ${event.duration_mean}, Std: ${event.duration_std_dev}] years`;
      default:
        return "—";
    }
  };

  // Render expected change information
  const renderExpectedChange = () => {
    const change = event.expected_change_type;
    if (!change) return "";
    if (event.expected_change_type === "fixed") {
      return `${event.expected_change_value} (Fixed)`;
    } else if (event.expected_change_type === "uniform") {
      return `Uniform [Min: ${event.expected_change_lower}, Max: ${event.expected_change_upper}]`;
    } else if (event.expected_change_type === "normal") {
      return `Normal [Mean: ${event.expected_change_mean}, Std: ${event.expected_change_std_dev}]`;
    }
    return "";
  };

  // Render allocation details for invest/rebalance
  const renderAllocation = () => {
    const allocation = event.allocation;
    if (!allocation) return "";

    if (typeof allocation === "object") {
      return (
        <pre style={{ whiteSpace: "pre-wrap", fontSize: "0.85rem" }}>
          {JSON.stringify(allocation, null, 2)}
        </pre>
      );
    }
    return allocation;
  };

  return (
    <section className={styles["outer-container"]}>
      <div className={styles["inner-container"]}>
        <div className={styles["event-series-info"]}>
          <h2 className={styles["scenario-name"]}>Event Series Details:</h2>

          <div className={styles["info-row"]}>
            <label className={styles["info-item"]}>Name:</label>
            <span className={styles["info-value"]}>{event.name}</span>
          </div>

          <div className={styles["info-row"]}>
            <label className={styles["info-item"]}>Type:</label>
            <span className={styles["info-value"]}>{event.type}</span>
          </div>

          <div className={`${styles["info-row"]} ${styles["description-row"]}`}>
            <label className={`${styles["info-item"]} ${styles["description-item"]}`}>
              Description:
            </label>
            <span className={`${styles["info-value"]} ${styles["description-value"]}`}>
              {event.description}
            </span>
          </div>

          <div className={styles["info-row"]}>
            <label className={styles["info-item"]}>Start Year:</label>
            <span className={styles["info-value"]}>{renderStartYear()}</span>
          </div>

          <div className={styles["info-row"]}>
            <label className={styles["info-item"]}>Duration:</label>
            <span className={styles["info-value"]}>{renderDuration()}</span>
          </div>

          {(event.type === "income" || event.type === "expense") && (
            <>
              <div className={styles["info-row"]}>
                <label className={styles["info-item"]}>Initial Amount:</label>
                <span className={styles["info-value"]}>
                  ${event.initial_amount?.toLocaleString()}
                </span>
              </div>

              <div className={styles["info-row"]}>
                <label className={styles["info-item"]}>Expected Change:</label>
                <span className={styles["info-value"]}>{renderExpectedChange()}</span>
              </div>

              <div className={styles["info-row"]}>
                <label className={styles["info-item"]}>Inflation Adjusted:</label>
                <span className={styles["info-value"]}>
                  {event.inflation_adjusted ? "Yes" : "No"}
                </span>
              </div>

              {event.user_percentage !== null && (
                <div className={styles["info-row"]}>
                  <label className={styles["info-item"]}>User Percentage:</label>
                  <span className={styles["info-value"]}>{event.user_percentage}%</span>
                </div>
              )}

              {event.type === "income" && (
                <div className={styles["info-row"]}>
                  <label className={styles["info-item"]}>Social Security:</label>
                  <span className={styles["info-value"]}>
                    {event.is_social ? "Yes" : "No"}
                  </span>
                </div>
              )}

              {event.type === "expense" && (
                <div className={styles["info-row"]}>
                  <label className={styles["info-item"]}>Discretionary:</label>
                  <span className={styles["info-value"]}>
                    {event.is_discretionary ? "Yes" : "No"}
                  </span>
                </div>
              )}
            </>
          )}

          {(event.type === "invest" || event.type === "rebalance") && (
            <>
              <div className={styles["info-row"]}>
                <label className={styles["info-item"]}>Allocation Type:</label>
                <span className={styles["info-value"]}>{event.allocationType}</span>
              </div>

              <div className={styles["info-row"]}>
                <label className={styles["info-item"]}>Allocation:</label>
                <span className={styles["info-value"]}>{renderAllocation()}</span>
              </div>

              {event.type === "invest" && (
                <div className={styles["info-row"]}>
                  <label className={styles["info-item"]}>Max Cash:</label>
                  <span className={styles["info-value"]}>
                    ${event.maxCash?.toLocaleString()}
                  </span>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </section>
  );
}

function ScenarioList() {
  const {
    selectedScenario,
    setSelectedScenario,
    deselectScenario,
    deselectEventSeries,
    shared, 
    setShared 
} = useSelected();

  function selectScenario(scenario) {
    if (selectedScenario && scenario.id === selectedScenario.id) {
      deselectScenario();
    } else if (scenario.id !== 0) {
      setSelectedScenario(scenario);
      deselectEventSeries();
    }
  }

  const { scenarios, sharedScenarios, fetchShared } = useData();
  let scenariosList = scenarios;
  let sharedScenariosList = sharedScenarios;

  function selectShared(){
    setShared(true);
    fetchShared();
  }

  function selectOwned(){
    setShared(false);
  }

  // If the scenarios list is empty, display a placeholder item
  if (scenariosList.length <= 0) {
    scenariosList = [{ name: "No scenarios available...", id: null }];
  }

  if (sharedScenariosList.length <= 0){
    sharedScenariosList = [{ name: "No scenarios available...", id: null }];
  }

  return (
    <section className={`${styles["outer-container"]} ${styles["scenario-list-container"]}`}>
      <div className={`${styles["inner-container"]} ${styles["scenario-list"]}`}>
        <div className={`${styles["scenario-shared-button-container"]}`}>
          <button 
          className={
            shared === false
            ? `${styles["share-button"]} ${styles["selected"]}`
            : styles["share-button"]          
          }
          onClick={selectOwned}
          >
          Owned</button>
          <button 
          className={
            shared === true
            ? `${styles["share-button"]} ${styles["selected"]}`
            : styles["share-button"]          
          }
          onClick={selectShared}
          >
            Shared</button>
        </div>
        <h2 className={styles["scenario-list-title"]}>Scenarios:</h2>
        <div className={styles["scenario-item-list"]}>
          {shared === true ? 
            (sharedScenariosList.map((shared_scenario, index) => (
              <div
                key={shared_scenario.id}
                className={
                  selectedScenario && shared_scenario.id === selectedScenario.id
                    ? `${styles["selected"]} ${styles["scenario-item"]}`
                    : styles["scenario-item"]
                }
                onClick={
                  shared_scenario.id !== null ? () => selectScenario(shared_scenario) : undefined
                }
              >
                <span>{shared_scenario.name}</span>
              </div>
            ))) 
            :
            (scenariosList.map((scenario, index) => (
              <div
                key={scenario.id}
                className={
                  selectedScenario && scenario.id === selectedScenario.id
                    ? `${styles["selected"]} ${styles["scenario-item"]}`
                    : styles["scenario-item"]
                }
                onClick={
                  scenario.id !== null ? () => selectScenario(scenario) : undefined
                }
              >
                <span>{scenario.name}</span>
              </div>
            )))
          }
        </div>
      </div>
    </section>
  );
}

function EventSeriesGraph(){
  return (
    <div className={styles["event-series-graph"]}>
      <div className={styles["outer-container"]}>
        <div className={styles["inner-container"]}>
          graph goes here
        </div>
      </div>
    </div>
  )
}

export default function EventSeries() {
  const { selectedEventSeries } = useSelected();

  return (
    <main className={styles["event-series"]}>
      <section className={styles["column"]}>
        <EventSeriesActions eventSeries={selectedEventSeries} />
        <ScenarioList />
      </section>
      <section className={styles["column"]}>
        <EventSeriesList />
      </section>
      <section className={styles["column"]}>
        <EventSeriesInfo event={selectedEventSeries} />
        <EventSeriesGraph />
      </section>
    </main>
  );
}
