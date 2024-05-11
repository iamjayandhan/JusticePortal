import React, { useState, useEffect } from 'react';
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
import Snackbar from '@mui/material/Snackbar'; // Import Snackbar component from Material-UI

const App = () => {
  const isLoggedIn = Cookies.get('username') !== undefined;
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [buffer, setBuffer] = useState('');
  const cheatCode = 'leavemealone';

  useEffect(() => {
    const handleKeyDown = (event) => {
      const { key } = event;
      setBuffer((prevBuffer) => {
        const newBuffer = (prevBuffer + key).slice(-cheatCode.length);
        if (newBuffer === cheatCode) {
          setOpenSnackbar(true);
          const audio = new Audio(require('../src/cheat_sound.mp3'));
          audio.play();
          return '';
        }
        return newBuffer;
      });
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [cheatCode]);

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  return (
    <Router>
      <div>
        {isLoggedIn && <NavBar />}
        <Routes>
          {!isLoggedIn && <Route path="/" element={<Register />} />}
          <Route path="/MainPage" element={<MainPage />} />
          <Route path="/add-case" element={<AddCasePage />} />
          <Route path="/all-cases" element={<AllCases />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/my-cases" element={<MyCases />} />
          <Route path="/inbox" element={<Inbox />} />
          <Route path="/lawyers" element={<ClientRequests />} />
        </Routes>
        <Snackbar
          open={openSnackbar}
          autoHideDuration={3000}
          onClose={handleCloseSnackbar}
          message="Cheat activated!"
        />
      </div>
    </Router>
  );
};

export default App;
