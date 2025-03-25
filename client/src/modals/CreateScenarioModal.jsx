import React, { useState } from "react";
import styles from "./Modal.module.css";
import { useSelectedScenario } from "../SelectedContext";

function CreateScenarioModal({ onClose }) {
  const { setSelectedScenario } = useSelectedScenario();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    isMarried: false,
    birthYear: "",
    lifeExpectancy: "",
    stateOfResidence: "",
    financialGoal: "",
    inflationAssumption: "",
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSelectedScenario(formData);
    onClose();
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <h2>Create a New Scenario</h2>
        <form onSubmit={handleSubmit}>
          <label>Scenario Name: <input type="text" name="name" value={formData.name} onChange={handleChange} required /></label>
          <label>Description: <textarea name="description" value={formData.description} onChange={handleChange} required /></label>
          <label>Marital Status: <input type="checkbox" name="isMarried" checked={formData.isMarried} onChange={handleChange} /> Married</label>
          <label>Birth Year: <input type="number" name="birthYear" value={formData.birthYear} onChange={handleChange} required /></label>
          <label>Life Expectancy: <input type="number" name="lifeExpectancy" value={formData.lifeExpectancy} onChange={handleChange} required /></label>
          <label>State: <input type="text" name="stateOfResidence" value={formData.stateOfResidence} onChange={handleChange} required /></label>
          <label>Financial Goal: <input type="text" name="financialGoal" value={formData.financialGoal} onChange={handleChange} required /></label>
          <label>Inflation Assumption: <input type="number" step="0.1" name="inflationAssumption" value={formData.inflationAssumption} onChange={handleChange} required /></label>

          <div className={styles.buttonGroup}>
            <button type="submit">Create</button>
            <button type="button" onClick={onClose}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateScenarioModal;
