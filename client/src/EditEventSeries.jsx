import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useData } from "./DataContext";
import { useSelected } from "./SelectedContext";
import "./EditEventSeries.css";

export default function EditEventSeries() {
  const navigate = useNavigate();
  const { selectedScenario, selectedEventSeries, setSelectedEventSeries } = useSelected();
  const { editEventSeries } = useData();

  const [formData, setFormData] = useState({
    name: "",
    type: "income",
    startYear: { value: "", type: "fixed" },
    duration: { value: "", type: "fixed" },
    initialAmount: "",
    expectedChange: { value: "", type: "fixed" },
    inflationAdjusted: false,
    userPercentage: "",
    isSocialSecurity: false,
    isDiscretionary: false,
    allocationType: "",
    allocation: "",
    maxCash: "",
  });

  useEffect(() => {
    if (selectedEventSeries) {
      setFormData({ ...selectedEventSeries });
    }
  }, [selectedEventSeries]);

  if (!selectedEventSeries) {
    return <div className="edit-event-series-container">No event series selected.</div>;
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => {
      const keys = name.split(".");
      if (keys.length > 1) {
        return {
          ...prev,
          [keys[0]]: {
            ...prev[keys[0]],
            [keys[1]]: value,
          },
        };
      }
      return {
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedScenario) {
      alert("Please select a scenario first.");
      return;
    }

    await editEventSeries(selectedScenario.id, formData);
    setSelectedEventSeries(formData);
    navigate("/eventseries"); // Redirect after edit
  };

  return (
    <div className="edit-event-series-container">
      <h2>Edit Event Series</h2>
      <form onSubmit={handleSubmit}>
        <label>
          Name:
          <input type="text" name="name" value={formData.name} onChange={handleChange} required />
        </label>

        <label>
          Type:
          <select name="type" value={formData.type} onChange={handleChange}>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
            <option value="invest">Invest</option>
            <option value="rebalance">Rebalance</option>
          </select>
        </label>

        <label>
          Start Year:
          <input type="number" name="startYear.value" value={formData.startYear?.value || ""} onChange={handleChange} required />
        </label>

        <label>
          Duration:
          <input type="number" name="duration.value" value={formData.duration?.value || ""} onChange={handleChange} required />
        </label>

        {(formData.type === "income" || formData.type === "expense") && (
          <>
            <label>
              Initial Amount:
              <input type="number" name="initialAmount" value={formData.initialAmount || ""} onChange={handleChange} />
            </label>
            <label>
              Expected Change:
              <input type="number" name="expectedChange.value" value={formData.expectedChange?.value || ""} onChange={handleChange} />
            </label>
            <label>
              Inflation Adjusted:
              <input type="checkbox" name="inflationAdjusted" checked={formData.inflationAdjusted} onChange={handleChange} />
            </label>
          </>
        )}

        {(formData.type === "invest" || formData.type === "rebalance") && (
          <>
            <label>
              Allocation Type:
              <input type="text" name="allocationType" value={formData.allocationType || ""} onChange={handleChange} />
            </label>
            <label>
              Allocation:
              <textarea name="allocation" value={formData.allocation || ""} onChange={handleChange} />
            </label>
            {formData.type === "invest" && (
              <label>
                Max Cash:
                <input type="number" name="maxCash" value={formData.maxCash || ""} onChange={handleChange} />
              </label>
            )}
          </>
        )}

        <button type="submit">Save Changes</button>
      </form>
    </div>
  );
}
