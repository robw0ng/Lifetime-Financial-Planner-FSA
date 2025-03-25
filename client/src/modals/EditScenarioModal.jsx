import React, { useState } from "react";
import styles from "./Modal.module.css";

function EditScenarioModal({ onClose, scenario }) {
  const [formData, setFormData] = useState(scenario);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Updated Scenario:", formData);
    onClose();
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <h2>Edit Scenario</h2>
        <form onSubmit={handleSubmit}>
          <label>Scenario Name: <input type="text" name="name" value={formData.name} onChange={handleChange} /></label>
          <label>Description: <textarea name="description" value={formData.description} onChange={handleChange} /></label>
          <div className={styles.buttonGroup}>
            <button type="submit">Save</button>
            <button type="button" onClick={onClose}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditScenarioModal;
