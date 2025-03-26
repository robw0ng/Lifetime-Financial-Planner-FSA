import "./EventSeries.css"
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
  const { selectedScenario, selectedEventSeries, setSelectedEventSeries, deselectEventSeries } = useSelected();

  const seriesArray = selectedScenario ? Array.from(selectedScenario.events || []) : [];

  if (seriesArray.length === 0) {
    seriesArray.push({ id: null, name: "No event series available", type: "" });
  }

  const selectEvent = (event) => {
    if (selectedEventSeries && event.id === selectedEventSeries.id) {
      deselectEventSeries();
    } else {
      setSelectedEventSeries(event);
    }
  };

  return (
    <div className="eventSeriesListContainer">
      <div className="eventSeriesList">
        <h2 className="title">Event Series:</h2>
        <div className="header">
          <span className="event-span">Name</span>
          <span className="event-span">Type</span>
        </div>
        {seriesArray.map((event, index) => (
          <div
            key={event.id ?? index}
            className={
              selectedEventSeries?.id === event.id ? "selectedEventItem" : "eventItem"
            }
            onClick={event.id !== null ? () => selectEvent(event) : undefined}
          >
            <span className="event-span">{event.name}</span>
            <span className="event-span">{event.type}</span>
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
        {/* Add more fields here as needed based on event.type */}
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
