// components/MainPage.js
import React from 'react';
import '../css/MainPage.css';

function MainPage() {
  return (
    <div className='container'>
      <h1>Welcome to the Justice Portal</h1>
      <p>
        The Justice Portal revolutionizes case management processes by providing a centralized platform for seamless scheduling, tracking, and monitoring of various types of cases across diverse legal domains.
      </p>
      <h2>Key Features:</h2>
          <div style={styles.listItemContainer}>
      <div style={styles.listItem}>Efficient scheduling of hearings</div>
      <div style={styles.listItem}>Real-time case tracking</div>
      <div style={styles.listItem}>User-friendly interface for all stakeholders</div>
    </div>


      <h2>Our Mission:</h2>
      <p>
        Our mission is to enhance the efficiency and effectiveness of judicial proceedings while upholding the principles of fairness and access to justice for all.
      </p>
    </div>
  );
}

export default MainPage;


const styles = {
  listItemContainer: {
    display: 'flex',
  },
  listItem: {
    fontSize: '1.1rem',
    color: '#455A64',
    lineHeight: '1.6',
    marginRight: '20px', // Add spacing between items horizontally
    marginBottom: '10px', // Add spacing between items vertically
  },
};


