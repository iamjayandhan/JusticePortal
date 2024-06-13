import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import styles from '../css/NavBar.module.css'; // Import CSS module
import Cookies from 'js-cookie'; // Import Cookies
import logo from '../components/Assets/court3.png'; // Import logo image

function NavBar() {
  const navigate = useNavigate(); // Initialize useNavigate hook
  const location = useLocation(); // Get current location
  const [isLoggedIn, setIsLoggedIn] = useState(Cookies.get('username') !== undefined);
  const username = Cookies.get('username');
  const userRole = Cookies.get('role');
  const [isMenuOpen, setIsMenuOpen] = useState(false); // State to manage menu visibility
  const [showLogoutModal, setShowLogoutModal] = useState(false); // State to control logout modal visibility
  const navRef = useRef(null); // Reference to the nav element

  // Function to handle logout
  const handleLogout = () => {
    setShowLogoutModal(true); // Show the confirmation modal
    setIsMenuOpen(false); // Close the menu when the logout button is clicked
  };

  // Function to confirm logout
  const confirmLogout = () => {
    Cookies.remove('username'); // Remove the 'username' cookie
    Cookies.remove('role');
    Cookies.remove('email');
    setIsLoggedIn(false); // Update isLoggedIn state
    navigate('/login'); // Redirect to the login page
  };

  // Function to cancel logout
  const cancelLogout = () => {
    setShowLogoutModal(false); // Hide the confirmation modal
  };

  // Function to toggle menu
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // Function to handle menu item click
  const handleMenuItemClick = () => {
    setIsMenuOpen(false); // Close the menu when a menu item is clicked
  };

  // Function to close menu when clicked outside
  const handleClickOutside = (event) => {
    if (navRef.current && !navRef.current.contains(event.target)) {
      setIsMenuOpen(false);
    }
  };

  // Add event listener for clicks outside the menu
  useEffect(() => {
    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    // Clean up event listener on component unmount
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  // Determine if the current page is the secret page
  const isSecretPage = location.pathname === '/secret-page';

  return (
    isLoggedIn && !isSecretPage && ( // Hide navbar on secret page
      <>
        <nav className={styles.nav} ref={navRef}>
          <div className={styles.logoContainer}>
            <a href="/MainPage" className={styles.logoLink}>
              <img src={logo} alt="Logo" className={styles.logo} onClick={() => console.log('Logo clicked')} />
              <span className={styles.logoText}>Justice Portal</span> {/* Text near the logo */}
            </a>
          </div>
          <div className={styles.menuToggle} onClick={toggleMenu}>
            <div className={styles.bar}></div>
            <div className={styles.bar}></div>
            <div className={styles.bar}></div>
          </div>
          <ul className={`${styles.menu} ${isMenuOpen ? styles.active : ''}`}>
            <li><Link to="/MainPage" onClick={handleMenuItemClick}>Home</Link></li>
            <li><Link to="/add-case" onClick={handleMenuItemClick}>Add Case</Link></li>
            {userRole !== 'Owners/Clients' && <li><Link to="/all-cases" onClick={handleMenuItemClick}>All Cases</Link></li>}
            <li><Link to="/lawyers" onClick={handleMenuItemClick}>Lawyers</Link></li>
            <li><Link to="/my-cases" onClick={handleMenuItemClick}>My Cases</Link></li>
            <li><Link to="/inbox" onClick={handleMenuItemClick}>Inbox</Link></li>
            <li><Link to="/profile" onClick={handleMenuItemClick}>Profile</Link></li>
            <li><Link to="/contact" onClick={handleMenuItemClick}>Contact</Link></li>
            <li className={styles.userSection}>
              <span>{username}</span>
              <button onClick={handleLogout}>Logout</button>
            </li>
          </ul>
        </nav>

        {/* Logout Confirmation Modal */}
        {showLogoutModal && (
          <div className={styles.confirmLogoutModal}>
            <div className={styles.modalContent}>
              <h3>Confirm Logout</h3>
              <p>Are you sure you want to log out?</p>
              <button className={styles.btnConfirm} onClick={confirmLogout}>Yes</button>
              <button className={styles.btnCancel} onClick={cancelLogout}>Cancel</button>
            </div>
          </div>
        )}
      </>
    )
  );
}

export default NavBar;
