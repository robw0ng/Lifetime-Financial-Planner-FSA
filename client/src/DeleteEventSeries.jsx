import { useNavigate } from 'react-router-dom';
import { useData } from './DataContext';
import { useSelected } from './SelectedContext';
// import "./DeleteEventSeries.css";

export default function DeleteEventSeries() {
  const navigate = useNavigate();
  const { selectedScenario, selectedEventSeries, setSelectedEventSeries } = useSelected();
  const { deleteEventSeries } = useData();

  if (!selectedEventSeries) {
    return <div className="delete-event-series-container">No event series selected.</div>;
  }

  const handleDelete = async () => {
    if (!selectedScenario) {
      alert('Please select a scenario first.');
      return;
    }
    
    const confirmDelete = window.confirm(`Are you sure you want to delete "${selectedEventSeries.name}"?`);
    if (confirmDelete) {
      await deleteEventSeries(selectedScenario.id, selectedEventSeries.id);
      setSelectedEventSeries(null);
      navigate('/'); // Redirect after deletion
    }
  };

  return (
    <div className="delete-event-series-container">
      <h2>Delete Event Series</h2>
      <p>Are you sure you want to delete "{selectedEventSeries.name}"?</p>
      <button onClick={handleDelete}>Delete</button>
    </div>
  );
}
