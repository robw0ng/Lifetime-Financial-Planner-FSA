import React from "react";
import styles from "./Modal.module.css";

function DuplicateScenarioModal({ onClose, scenario }) {
  const handleDuplicate = () => {
    console.log("Duplicating scenario:", scenario);
    onClose();
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <h2>Duplicate Scenario</h2>
        <p>Are you sure you want to duplicate "{scenario.name}"?</p>
        <div className={styles.buttonGroup}>
          <button onClick={handleDuplicate}>Yes, Duplicate</button>
          <button onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

export default DuplicateScenarioModal;
