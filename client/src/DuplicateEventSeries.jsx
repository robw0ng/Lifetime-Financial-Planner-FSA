import { useNavigate } from "react-router-dom";
import { useData } from "./DataContext";
import { useSelected } from "./SelectedContext";
import "./DuplicateEventSeries.css";

export default function DuplicateEventSeries() {
  const navigate = useNavigate();
  const { selectedScenario, selectedEventSeries, setSelectedEventSeries } = useSelected();
  const { duplicateEventSeries } = useData();

  if (!selectedEventSeries) {
    return <div className="duplicate-event-series-container">No event series selected.</div>;
  }

  const handleDuplicate = async () => {
    if (!selectedScenario) {
      alert("Please select a scenario first.");
      return;
    }
    
    const duplicatedEvent = await duplicateEventSeries(selectedScenario.id, selectedEventSeries.id);
    setSelectedEventSeries(duplicatedEvent);
    navigate("/"); // Redirect after duplication
  };

  return (
    <div className="duplicate-event-series-container">
      <h2>Duplicate Event Series</h2>
      <p>Are you sure you want to duplicate "{selectedEventSeries.name}"?</p>
      <button onClick={handleDuplicate}>Duplicate</button>
    </div>
  );
}
