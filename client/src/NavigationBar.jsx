import * as React from "react";
import styles from "./NavigationBar.module.css";
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from "./AuthContext";
import { useNavigate } from "react-router-dom";
import defaultAvatar from './assets/nopfp.webp';
import { useData } from "./DataContext";
import { useSelected } from "./SelectedContext";

function NavigationUser() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const {setScenarios} = useData();
  const 
  { deselectScenario } = useSelected();

  const handleLogout = () => {
    logout(); // Clear user state from AuthContext
    setScenarios([]);
    deselectScenario();
    navigate('/login'); // Redirect to login page after logout
  };

  if (!user) return null;

  return (
      <div className={styles.profileColumn}>
        <div className={styles.profileContainer}>
          <Link 
            className={styles["user-profile-link"]} 
            to={user.email === null ? "#" : "/profile"}
          >
            <img
              src={
                user.name === 'Guest'
                ? defaultAvatar
                : user.picture
              }
              alt={user.name}
              className={styles.avatar}
              referrerPolicy="no-referrer"
            />

            <span className={styles.username}>
              {user.name === 'Guest' ? 'Guest' : user.name}
            </span>
          </Link>
          <button
            className={styles.signOutButton}
            onClick={handleLogout}
          >
            {user.name === 'Guest' ? 'Exit as Guest' : 'Sign Out'}
          </button>
        </div>
      </div>
  );
}

function NavigationButtons() {
  const location = useLocation();
  return (
    <div className={styles.navColumn}>
    <div className={styles.buttonContainer}>
      <Link to="/" className={location.pathname === "/" ? `${styles["active"]} ${styles["navButton"]}` : styles["navButton"]}>
        Dashboard
      </Link>
      <Link to="/scenarios" className={location.pathname === "/scenarios" ? `${styles["active"]} ${styles["navButton"]}` : styles["navButton"]}>
        Scenarios
      </Link>
      <Link to="/investments" className={location.pathname === "/investments" ? `${styles["active"]} ${styles["navButton"]}` : styles["navButton"]}>
        Investments
      </Link>
      <Link to="/eventseries" className={location.pathname === "/eventseries" ? `${styles["active"]} ${styles["navButton"]}` : styles["navButton"]}>
        Event Series
      </Link>
      <Link to="/strategies" className={location.pathname === "/strategies" ? `${styles["active"]} ${styles["navButton"]}` : styles["navButton"]}>
        Strategies
      </Link>
      <Link to="/simulations" className={location.pathname === "/simulations" ? `${styles["active"]} ${styles["navButton"]}` : styles["navButton"]}>
        Simulations
      </Link>
    </div>
  </div>
  );
}

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
