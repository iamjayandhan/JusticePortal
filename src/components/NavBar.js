import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from '../css/NavBar.module.css'; // Import CSS module
import Cookies from 'js-cookie'; // Import Cookies

function NavBar() {
  const navigate = useNavigate(); // Initialize useNavigate hook
  const [isLoggedIn, setIsLoggedIn] = useState(Cookies.get('username') !== undefined);
  const username = Cookies.get('username');
  const userRole = Cookies.get('role');
  const [isMenuOpen, setIsMenuOpen] = useState(false); // State to manage menu visibility

  // Function to handle logout
  const handleLogout = () => {
    Cookies.remove('username'); // Remove the 'username' cookie
    Cookies.remove('role');
    setIsLoggedIn(false); // Update isLoggedIn state
    navigate('/login'); // Redirect to the login page
  };

  // Function to toggle menu
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // Function to handle menu item click
  const handleMenuItemClick = () => {
    setIsMenuOpen(false); // Close the menu when a menu item is clicked
  };

  return (
    isLoggedIn && (
      <nav className={styles.nav}>
        <div className={styles.menuToggle} onClick={toggleMenu}>
          <div className={styles.bar}></div>
          <div className={styles.bar}></div>
          <div className={styles.bar}></div>
        </div>
        <ul className={`${styles.menu} ${isMenuOpen ? styles.active : ''}`}>
          <li><Link to="/MainPage" onClick={handleMenuItemClick}>Home</Link></li>
          <li><Link to="/add-case" onClick={handleMenuItemClick}>Add Case</Link></li>
          {userRole !== 'Owners/Clients' && <li><Link to="/all-cases" onClick={handleMenuItemClick}>All Cases</Link></li>}
          {userRole === 'Owners/Clients' && <li><Link to="/lawyers" onClick={handleMenuItemClick}>Lawyers</Link></li>}
          <li><Link to="/my-cases" onClick={handleMenuItemClick}>My Cases</Link></li>
          <li><Link to="/inbox" onClick={handleMenuItemClick}>Inbox</Link></li>
          <li><Link to="/profile" onClick={handleMenuItemClick}>Profile</Link></li>
          <li className={styles.userSection}>
            <span>{username}</span>
            <button onClick={handleLogout}>Logout</button>
          </li>
        </ul>
      </nav>
    )
  );
}

export default NavBar;
