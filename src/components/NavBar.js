// NavBar.js
import React from 'react';
import { Link } from 'react-router-dom';
import styles from '../css/NavBar.module.css'; // Import CSS module

function NavBar() {
  return (
    <nav className={styles.nav}> {/* Apply the scoped class */}
      <ul>
        <li><Link to="/">Home</Link></li>
        <li><Link to="/add-case">Add Case</Link></li>
        <li><Link to="/all-cases">All Cases</Link></li>
        {/* Add more navigation links as needed */}
      </ul>
    </nav>
  );
}

export default NavBar;
