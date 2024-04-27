import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from '../css/NavBar.module.css'; // Import CSS module
import Cookies from 'js-cookie'; // Import Cookies

function NavBar() {
  const navigate = useNavigate(); // Initialize useNavigate hook
  const [isLoggedIn, setIsLoggedIn] = useState(Cookies.get('username') !== undefined);

  // Function to handle logout
  const handleLogout = () => {
    Cookies.remove('username'); // Remove the 'username' cookie
    setIsLoggedIn(false); // Update isLoggedIn state
    navigate('/login'); // Redirect to the login page
  };

  return (
    <nav className={styles.nav}>
    <ul>
      <li><Link to="/MainPage">Home</Link></li>
      <li><Link to="/add-case">Add Case</Link></li>
      <li><Link to="/all-cases">All Cases</Link></li>
      {isLoggedIn && <li><button onClick={handleLogout}>Logout</button></li>}
    </ul>
  </nav>
  );
}

export default NavBar;
