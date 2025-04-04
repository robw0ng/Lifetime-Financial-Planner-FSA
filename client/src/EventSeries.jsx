import { Link } from "react-router-dom";
import { useSelected } from "./SelectedContext";
import { useData } from "./DataContext";
import styles from "./EventSeries.module.css";

function EventSeriesActions({ eventSeries }) {
  const { selectedScenario, deselectEventSeries } = useSelected();
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

  const handleDuplicate = () => {
    if (eventSeries.id !== null && selectedScenario?.id) {
      duplicateEventSeries(selectedScenario.id, eventSeries.id);
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
              >
                Create New Event Series
              </button>
            </Link>
          ) : (
            <Link className={`${styles["action-button"]} ${styles["create"]}`}>
              <button
                className={`${styles["action-button"]} ${styles["create"]}`}
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
          >
            Duplicate Event Series
          </button>

          {eventSeries.id !== null ? (
            <Link to={`/edit-event-series/${eventSeries.id}`} className={styles["action-button"]}>
              <button
                className={`${styles["action-button"]} ${styles["edit"]}`}
              >
                Edit Event Series
              </button>
            </Link>
          ) : (
            <Link className={styles["action-button"]}>
              <button
                className={`${styles["action-button"]} ${styles["edit"]}`}
              >
                Edit Event Series
              </button>
            </Link>
          )}

          <button
            className={`${styles["action-button"]} ${styles["delete"]}`}
            onClick={handleDelete}
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

  let seriesArray = selectedScenario ? Array.from(selectedScenario.events || []) : [];

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

              {event?.startYear?.value && <span>:</span>}

              <span className={styles["event-series-span"]}>
                {event.startYear?.value ?? "—"}
                </span>

              {event?.type && <span>:</span>}

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

  // Render start year information
  const renderStartYear = () => {
    if (!event.startYear) return "";
    if (event.startYear.type === "fixed") {
      return `${event.startYear.value} (Fixed)`;
    } else if (event.startYear.type === "uniform") {
      return `Uniform [Min: ${event.startYear.min}, Max: ${event.startYear.max}]`;
    } else if (event.startYear.type === "normal") {
      return `Normal [Mean: ${event.startYear.mean}, Std: ${event.startYear.std}]`;
    } else if (event.startYear.type === "sameAsEvent") {
      return `Same as Event (${event.startYear.reference})`;
    } else if (event.startYear.type === "yearAfterEvent") {
      return `Year After Event (${event.startYear.reference})`;
    }
    return "";
  };

  // Render duration information
  const renderDuration = () => {
    if (!event.duration) return "";
    if (event.duration.type === "fixed") {
      return `${event.duration.value} years (Fixed)`;
    } else if (event.duration.type === "uniform") {
      return `Uniform [Min: ${event.duration.min}, Max: ${event.duration.max}] years`;
    } else if (event.duration.type === "normal") {
      return `Normal [Mean: ${event.duration.mean}, Std: ${event.duration.std}] years`;
    }
    return "";
  };

  // Render expected change information
  const renderExpectedChange = () => {
    const change = event.expectedChange;
    if (!change) return "";
    if (change.type === "fixed") {
      return `${change.value} (Fixed)`;
    } else if (change.type === "uniform") {
      return `Uniform [Min: ${change.min}, Max: ${change.max}]`;
    } else if (change.type === "normal") {
      return `Normal [Mean: ${change.mean}, Std: ${change.std}]`;
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
                  ${event.initialAmount?.toLocaleString()}
                </span>
              </div>

              <div className={styles["info-row"]}>
                <label className={styles["info-item"]}>Expected Change:</label>
                <span className={styles["info-value"]}>{renderExpectedChange()}</span>
              </div>

              <div className={styles["info-row"]}>
                <label className={styles["info-item"]}>Inflation Adjusted:</label>
                <span className={styles["info-value"]}>
                  {event.inflationAdjusted ? "Yes" : "No"}
                </span>
              </div>

              {event.userPercentage !== null && (
                <div className={styles["info-row"]}>
                  <label className={styles["info-item"]}>User Percentage:</label>
                  <span className={styles["info-value"]}>{event.userPercentage}%</span>
                </div>
              )}

              {event.type === "income" && (
                <div className={styles["info-row"]}>
                  <label className={styles["info-item"]}>Social Security:</label>
                  <span className={styles["info-value"]}>
                    {event.isSocialSecurity ? "Yes" : "No"}
                  </span>
                </div>
              )}

              {event.type === "expense" && (
                <div className={styles["info-row"]}>
                  <label className={styles["info-item"]}>Discretionary:</label>
                  <span className={styles["info-value"]}>
                    {event.isDiscretionary ? "Yes" : "No"}
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
} = useSelected();
  const { scenarios } = useData();

  function selectScenario(scenario) {
    if (selectedScenario && scenario.id === selectedScenario.id) {
      deselectScenario();
    } else if (scenario.id !== 0) {
      setSelectedScenario(scenario);
      deselectEventSeries();
    }
  }
  let scenariosList = scenarios;

  // If the scenarios list is empty, display a placeholder item
  if (scenariosList.length <= 0) {
    scenariosList = [{ name: "No scenarios available...", id: null }];
  }

  return (
    <section
      className={`${styles["outer-container"]} ${styles["scenario-list-container"]}`}
    >
      <div
        className={`${styles["inner-container"]} ${styles["scenario-list"]}`}
      >
        <h2 className={styles["scenario-list-title"]}>Scenarios:</h2>
        <div className={styles["scenario-item-list"]}>
          {scenariosList.map((scenario, index) => (
            <div
              key={index}
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
          ))}
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
