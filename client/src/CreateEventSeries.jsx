import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useData } from "./DataContext";
import { useSelected } from "./SelectedContext";
import "./CreateEventSeries.css";

export default function CreateEventSeries() {


  const [formData, setFormData] = useState({
    name: "",
    type: "income", // Default type
    startYearValue: "",
    startYearType: "fixed",
    durationValue: "",
    durationType: "fixed",
    initialAmount: "",
    expectedChangeValue: "",
    expectedChangeType: "fixed",
    inflationAdjusted: false,
    userPercentage: "",
    isSocialSecurity: false,
    isDiscretionary: false,
    allocationType: "",
    allocation: "",
    maxCash: "",
  });

  const navigate = useNavigate();
  const { selectedScenario } = useSelected();
  const { createEventSeries } = useData();
  
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedScenario) {
      alert("Please select a scenario first.");
      return;
    }

    const newEventSeries = {
      name: formData.name,
      type: formData.type,
      startYear: { value: Number(formData.startYearValue), type: formData.startYearType },
      duration: { value: Number(formData.durationValue), type: formData.durationType },
      initialAmount: formData.type === "income" || formData.type === "expense" ? Number(formData.initialAmount) : null,
      expectedChange: formData.type === "income" || formData.type === "expense" ? { value: Number(formData.expectedChangeValue), type: formData.expectedChangeType } : null,
      inflationAdjusted: formData.inflationAdjusted,
      userPercentage: formData.userPercentage ? Number(formData.userPercentage) : null,
      isSocialSecurity: formData.type === "income" ? formData.isSocialSecurity : null,
      isDiscretionary: formData.type === "expense" ? formData.isDiscretionary : null,
      allocationType: formData.type === "invest" || formData.type === "rebalance" ? formData.allocationType : null,
      allocation: formData.type === "invest" || formData.type === "rebalance" ? formData.allocation : null,
      maxCash: formData.type === "invest" ? Number(formData.maxCash) : null,
    };

    await createEventSeries(selectedScenario.id, newEventSeries);
    navigate("/eventseries"); // Redirect after creation
  };

  return (
    <div className="create-event-series-container">
      <h2>Create Event Series</h2>
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
          <input type="number" name="startYearValue" value={formData.startYearValue} onChange={handleChange} required />
        </label>

        <label>
          Duration:
          <input type="number" name="durationValue" value={formData.durationValue} onChange={handleChange} required />
        </label>

        {(formData.type === "income" || formData.type === "expense") && (
          <>
            <label>
              Initial Amount:
              <input type="number" name="initialAmount" value={formData.initialAmount} onChange={handleChange} />
            </label>
            <label>
              Expected Change:
              <input type="number" name="expectedChangeValue" value={formData.expectedChangeValue} onChange={handleChange} />
            </label>
          </>
        )}

        {(formData.type === "invest" || formData.type === "rebalance") && (
          <>
            <label>
              Allocation Type:
              <input type="text" name="allocationType" value={formData.allocationType} onChange={handleChange} />
            </label>
            <label>
              Allocation:
              <textarea name="allocation" value={formData.allocation} onChange={handleChange} />
            </label>
          </>
        )}

        <button type="submit">Create Event Series</button>
      </form>
    </div>
  );
}