"use client";
import * as React from "react";
import styles from "./NavigationBar.module.css";
import NavigationButtons from "./NavigationButtons";
import NavigationUser from "./NavigationUser";

function NavigationBar() {
  return (
    <nav className={styles.navigationBar}>
      <div className={styles.container}>
        <div className={styles.brandColumn}>
          <h1 className={styles.brandTitle}>
            Lifetime Financial Planner
          </h1>
        </div>
        <NavigationButtons />
        <NavigationUser />
      </div>
    </nav>
  );
}

export default NavigationBar;
