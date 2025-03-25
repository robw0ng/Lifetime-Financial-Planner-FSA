import React from "react";
import styles from "./Modal.module.css";

function DeleteScenarioModal({ onClose, scenario }) {
  const handleDelete = () => {
    console.log("Deleting scenario:", scenario);
    onClose();
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <h2>Delete Scenario</h2>
        <p>Are you sure you want to delete "{scenario.name}"? This action cannot be undone.</p>
        <div className={styles.buttonGroup}>
          <button onClick={handleDelete}>Yes, Delete</button>
          <button onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

export default DeleteScenarioModal;
