import "./EventSeries.css"
import "./Investments.css"
import { Link } from "react-router-dom";
import { useSelected } from "./SelectedContext";
import { useData } from "./DataContext";

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
    <section className="event-series-actions-container">
      <div className="event-series-actions">
        <h2>Event Series Actions:</h2>

        {selectedScenario ? (
          <Link to="/create-event-series" className="action-button create-btn">
            Create New Event Series
          </Link>
        ) : (
          <Link className="action-button create-btn">Create New Event Series</Link>
        )}

        <h3>
          <label>Selected Series:</label>
          <label>{eventSeries.name}</label>
        </h3>

        <button className="action-button dup-btn" onClick={handleDuplicate}>
          Duplicate
        </button>

        {eventSeries.id !== null ? (
          <Link to={`/edit-event-series/${eventSeries.id}`} className="action-button edit-btn">
            Edit
          </Link>
        ) : (
          <Link className="action-button edit-btn">Edit</Link>
        )}

        <button className="action-button del-btn" onClick={handleDelete}>
          Delete
        </button>
      </div>
    </section>
  );
}

function EventSeriesList() {
    const {
      selectedScenario,
      selectedEventSeries,
      setSelectedEventSeries,
      deselectEventSeries,
    } = useSelected();
  
    let seriesArray = selectedScenario ? Array.from(selectedScenario.events || []) : [];
  
    if (seriesArray.length === 0) {
      seriesArray.push({ id: null, name: "No event series available", type: "", startYear: { value: "—" } });
    }
  
    const selectEvent = (event) => {
      if (selectedEventSeries && event.id === selectedEventSeries.id) {
        deselectEventSeries();
      } else {
        setSelectedEventSeries(event);
      }
    };
  
    return (
      <div className="investmentListContainer">
        <div className="investmentList">
          <h2 className="title">Event Series:</h2>
          <div className="header">
            <span className="investment-span">Name</span>
            <span className="investment-span">Start Year</span>
            <span className="investment-span">Type</span>
          </div>
          {seriesArray.map((event, index) => (
            <div
              key={event.id ?? index}
              className={
                selectedEventSeries?.id === event.id
                  ? "selectedInvestmentItem"
                  : "investmentItem"
              }
              onClick={event.id !== null ? () => selectEvent(event) : undefined}
            >
              <span className="investment-span">{event.name}</span>
              <span className="investment-span">{event.startYear?.value ?? "—"}</span>
              <span className="investment-span">{event.type}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  function EventSeriesInfo({ event }) {
    if (!event) {
      event = {
        name: "No Event Selected",
        type: "",
        description: "",
      };
    }
  
    const renderStartYear = () => {
      if (!event.startYear) return "—";
      return `${event.startYear.value} (${event.startYear.type})${
        event.startYear.reference ? `, ref: ${event.startYear.reference}` : ""
      }`;
    };
  
    const renderDuration = () => {
      if (!event.duration) return "—";
      return `${event.duration.value} (${event.duration.type})`;
    };
  
    const renderExpectedChange = () => {
      const change = event.expectedChange;
      if (!change) return "—";
      return `${change.value} (${change.type})`;
    };
  
    const renderAllocation = () => {
      const allocation = event.allocation;
      if (!allocation) return "—";
  
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
      <section className="event-series-info-container">
        <h2>Event Series Info</h2>
  
        <div className="info-row">
          <label>Name:</label>
          <span>{event.name}</span>
        </div>
  
        <div className="info-row">
          <label>Type:</label>
          <span>{event.type}</span>
        </div>
  
        <div className="info-row">
          <label>Description:</label>
          <span>{event.description || "—"}</span>
        </div>
  
        <div className="info-row">
          <label>Start Year:</label>
          <span>{renderStartYear()}</span>
        </div>
  
        <div className="info-row">
          <label>Duration:</label>
          <span>{renderDuration()}</span>
        </div>
  
        {(event.type === "income" || event.type === "expense") && (
          <>
            <div className="info-row">
              <label>Initial Amount:</label>
              <span>${event.initialAmount?.toLocaleString() ?? "—"}</span>
            </div>
  
            <div className="info-row">
              <label>Expected Change:</label>
              <span>{renderExpectedChange()}</span>
            </div>
  
            <div className="info-row">
              <label>Inflation Adjusted:</label>
              <span>{event.inflationAdjusted ? "Yes" : "No"}</span>
            </div>
  
            <div className="info-row">
              <label>User Percentage:</label>
              <span>{event.userPercentage ?? "—"}%</span>
            </div>
  
            {event.type === "income" && (
              <div className="info-row">
                <label>Social Security:</label>
                <span>{event.isSocialSecurity ? "Yes" : "No"}</span>
              </div>
            )}
  
            {event.type === "expense" && (
              <div className="info-row">
                <label>Discretionary:</label>
                <span>{event.isDiscretionary ? "Yes" : "No"}</span>
              </div>
            )}
          </>
        )}
  
        {(event.type === "invest" || event.type === "rebalance") && (
          <>
            <div className="info-row">
              <label>Allocation Type:</label>
              <span>{event.allocationType ?? "—"}</span>
            </div>
  
            <div className="info-row">
              <label>Allocation:</label>
              <span>{renderAllocation()}</span>
            </div>
  
            {event.type === "invest" && (
              <div className="info-row">
                <label>Max Cash:</label>
                <span>${event.maxCash?.toLocaleString() ?? "—"}</span>
              </div>
            )}
          </>
        )}
      </section>
    );
  }

function ScenarioList() {
    const { selectedScenario, setSelectedScenario, deselectScenario, deselectInvestment } = useSelected();
    const { scenarios } = useData();

    function selectScenario(scenario){
        if (selectedScenario && (scenario.id === selectedScenario.id)){
            deselectScenario();
        }
        else if (scenario.id !== 0){
            setSelectedScenario(scenario);
            deselectInvestment();
        }
    }
    let scenariosList = scenarios;

    // If the scenarios list is empty, display a placeholder item
    if (scenariosList.length <= 0) {
        scenariosList = [{ name: 'No scenarios to show...', id: null }];
    }

    return (
        <section className="scenarioListContainer">
            <div className="scenario-list">
                <div className="title">
                    <h2 className="title">Scenarios:</h2>
                    <div className="header">
                        <span>Name:</span>
                    </div>
                    {scenariosList.map((scenario, index) => (
                        <div
                            key={index}
                            className={
                                selectedScenario && (scenario.id === selectedScenario.id)
                                    ? "selectedScenarioItem"
                                    : "scenarioItem"
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

export default function EventSeries() {
  const { selectedEventSeries } = useSelected();

  return (
    <main className="event-series">
      <section className="column">
        <EventSeriesActions eventSeries={selectedEventSeries} />
        <ScenarioList />
      </section>
      <section className="column">
        <EventSeriesList />
      </section>
      <section className="column">
        <EventSeriesInfo event={selectedEventSeries} />
      </section>
    </main>
  );
}
