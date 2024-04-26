// App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'; // Import Routes
import MainPage from './components/MainPage';
import AddCasePage from './components/AddCasePage';
import NavBar from './components/NavBar';
import AllCases from './components/AllCases';

const App = () => {
  return (
    <Router>
      <div>
        <NavBar />
        <Routes> {/* Wrap Route components within a Routes element */}
          <Route path="/" element={<MainPage />} /> {/* Render MainPage component as the first component */}
          <Route path="/add-case" element={<AddCasePage />} />
          <Route path="/all-cases" element={<AllCases/>}/>
          {/* Add more routes for other pages */}
        </Routes>
      </div>
    </Router>
  );
};

export default App;
