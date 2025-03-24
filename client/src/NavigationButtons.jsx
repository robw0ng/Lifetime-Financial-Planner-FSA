import React from "react";
import styles from "./NavigationBar.module.css";
import { Link, useLocation } from 'react-router-dom';


function NavigationButtons() {
  const location = useLocation();
  return (
    <div className={styles.navColumn}>
    <div className={styles.buttonContainer}>
      <Link to="/" className={location.pathname === "/" ? styles.active : styles.navButton}>
        Dashboard
      </Link>
      <Link to="/scenarios" className={location.pathname === "/scenarios" ? styles.active : styles.navButton}>
        Scenarios
      </Link>
      <Link to="/investments" className={location.pathname === "/investments" ? styles.active : styles.navButton}>
        Investments
      </Link>
      <Link to="/eventseries" className={location.pathname === "/eventseries" ? styles.active : styles.navButton}>
        Event Series
      </Link>
      <Link to="/simulations" className={location.pathname === "/simulations" ? styles.active : styles.navButton}>
        Simulations
      </Link>
    </div>
  </div>
  );
}

export default NavigationButtons;
