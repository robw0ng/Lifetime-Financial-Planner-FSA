import React from "react";
import { useAuth } from "./AuthContext";
import { useNavigate } from "react-router-dom";
import styles from "./NavigationBar.module.css";
import defaultAvatar from './assets/nopfp.webp';
import { useData } from "./DataContext";
import { useSelected } from "./SelectedContext";

function NavigationUser() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const {setScenarios} = useData();
  const 
  { deselectInvestment, 
    deselectScenario,
    deselectEventSeries,
    deselectStrategy,
    deselectStrategyItem } = useSelected();

  const handleLogout = () => {
    logout(); // Clear user state from AuthContext
    setScenarios([]);
    deselectInvestment();
    deselectScenario();
    deselectEventSeries();
    deselectStrategy();
    deselectStrategyItem();
    navigate('/login'); // Redirect to login page after logout
  };

  if (!user) return null;

  return (
    <div className={styles.profileColumn}>
      <div className={styles.profileContainer}>
        
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

export default NavigationUser;
