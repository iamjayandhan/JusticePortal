// components/MainPage.js
import React from 'react';
import { Link } from 'react-router-dom';
import '../css/MainPage.css';

function MainPage() {
  return (
    <div className='container'>
      <h1>Welcome to the Justice Portal</h1>
      <p>
        The Justice Portal revolutionizes case management processes by providing a centralized platform for seamless scheduling, tracking, and monitoring of various types of cases across diverse legal domains.
      </p>
      <h2>Key Features:</h2>
      <ul>
        <li>Efficient scheduling of hearings</li>
        <li>Real-time case tracking</li>
        <li>Document submission and management</li>
        <li>User-friendly interface for all stakeholders</li>
        <li>Secure data encryption and compliance with privacy regulations</li>
      </ul>
      <h2>Our Mission:</h2>
      <p>
        Our mission is to enhance the efficiency and effectiveness of judicial proceedings while upholding the principles of fairness and access to justice for all.
      </p>
      <Link to="/all-cases">
        <button>View Cases</button>
      </Link>
    </div>
  );
}

export default MainPage;
