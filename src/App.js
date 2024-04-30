import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainPage from './components/MainPage';
import AddCasePage from './components/AddCasePage';
import NavBar from './components/NavBar';
import AllCases from './components/AllCases';
import Cookies from 'js-cookie'; // Import Cookies module
import Register from './components/Register';
import Login from './components/Login';
import MyCases from './components/MyCases';
import Inbox from './components/Inbox';
import ClientRequests from './components/ClientRequests';

const App = () => {
  // Check if user is logged in
  const isLoggedIn = Cookies.get('username') !== undefined;

  return (
    <Router>
      <div>
        {isLoggedIn && <NavBar />} {/* Render NavBar only if user is logged in */}
        <Routes>
          {!isLoggedIn && <Route path="/" element={<Register />} />} {/* Render Register component if user is not logged in */}
          <Route path="/MainPage" element={<MainPage />} /> {/* Render MainPage component */}
          <Route path="/add-case" element={<AddCasePage />} />
          <Route path="/all-cases" element={<AllCases/>}/>
          <Route path="/login" element={<Login />} /> {/* Render Login component */}
          <Route path="/register" element={<Register />} /> {/* Render Register component */}
          <Route path="/my-cases" element={<MyCases/>}/>
          <Route path="/inbox" element={<Inbox/>}/>
          <Route path="/lawyers" element={<ClientRequests/>}/>
        </Routes>
      </div>
    </Router>
  );
};

export default App;
