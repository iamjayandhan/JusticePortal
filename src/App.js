import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import MainPage from './components/MainPage';
import AddCasePage from './components/AddCasePage';
import NavBar from './components/NavBar';
import AllCases from './components/AllCases';
import Cookies from 'js-cookie';
import Register from './components/Register';
import Login from './components/Login';
import MyCases from './components/MyCases';
import Inbox from './components/Inbox';
import ClientRequests from './components/ClientRequests';
import Snackbar from '@mui/material/Snackbar';
import Profile from './components/Profile';
import SecretPage from './components/SecretPage';
import Loader from './components/Loader'; // Import the Loader component
import ContactForm from './components/ContactForm';

const App = () => {
  const isLoggedIn = Cookies.get('username') !== undefined;
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [buffer, setBuffer] = useState('');
  const cheatCode = 'leavemealone';
  const [showLoader, setShowLoader] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowLoader(false);
    }, 3000); // Hide loader after 5 seconds

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handleKeyDown = (event) => {
      const { key } = event;
      setBuffer((prevBuffer) => {
        const newBuffer = (prevBuffer + key).slice(-cheatCode.length);
        if (newBuffer === cheatCode) {
          const audio = new Audio(require('../src/cheat_sound.mp3'));
          audio.play();
          setOpenSnackbar(true);
          setTimeout(() => {
            window.location.href = "/secret-page";
          }, 2000); // Delay for 2 seconds (2000 milliseconds)
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

  if (showLoader) {
    return <Loader />;
  }

  return (
    <Router>
      <div>
        {isLoggedIn && <NavBar />}
        <Routes>
          {!isLoggedIn && <Route path="/" element={<Register />} />}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/MainPage" element={isLoggedIn ? <MainPage /> : <Navigate to="/" />} />
          <Route path="/add-case" element={isLoggedIn ? <AddCasePage /> : <Navigate to="/" />} />
          <Route path="/all-cases" element={isLoggedIn ? <AllCases /> : <Navigate to="/" />} />
          <Route path="/my-cases" element={isLoggedIn ? <MyCases /> : <Navigate to="/" />} />
          <Route path="/inbox" element={isLoggedIn ? <Inbox /> : <Navigate to="/" />} />
          <Route path="/lawyers" element={isLoggedIn ? <ClientRequests /> : <Navigate to="/" />} />
          <Route path="/profile" element={isLoggedIn ? <Profile /> : <Navigate to="/" />} />
          <Route path="/contact" element={isLoggedIn ? <ContactForm /> : <Navigate to="/" />} />
          <Route path="/secret-page" element={isLoggedIn ? <SecretPage /> : <Navigate to="/" />} />
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
