import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from '../css/NavBar.module.css'; // Import CSS module
import Cookies from 'js-cookie'; // Import Cookies

function NavBar() {
  const navigate = useNavigate(); // Initialize useNavigate hook
  const [isLoggedIn, setIsLoggedIn] = useState(Cookies.get('username') !== undefined);
  const username = Cookies.get('username');

  const userRole = Cookies.get('role');

  // Function to handle logout
  const handleLogout = () => {
    Cookies.remove('username'); // Remove the 'username' cookie
    Cookies.remove('role');
    setIsLoggedIn(false); // Update isLoggedIn state
    navigate('/login'); // Redirect to the login page
  };

  return (
    <nav className={styles.nav}>
      {isLoggedIn && ( // Conditionally render the navbar only if user is logged in
        <ul>
          <li><Link to="/MainPage">Home</Link></li>
          <li><Link to="/add-case">Add Case</Link></li>
          {/* Conditionally render the "All Cases" link based on the user's role */}
          {userRole !== 'Owners/Clients' && <li><Link to="/all-cases">All Cases</Link></li>}
          {/* Conditionally render the "ClientRequests" link only for clients */}
          {userRole === 'Owners/Clients' && <li><Link to="/lawyers">Lawyers</Link></li>}
          <li><Link to="/my-cases">My Cases</Link></li>
          <li><Link to="/inbox">Inbox</Link></li>
          <li className={styles.userSection}>
            <span>{username}</span>
            <button onClick={handleLogout}>Logout</button>
          </li>
        </ul>
      )}
    </nav>
  );
}

export default NavBar;
