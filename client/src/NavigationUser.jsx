import React from "react";
import { useAuth } from "./AuthContext";
import { useNavigate } from "react-router-dom";
import styles from "./NavigationBar.module.css";
import defaultAvatar from './assets/nopfp.webp';

function NavigationUser() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout(); // Clear user state from AuthContext
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
