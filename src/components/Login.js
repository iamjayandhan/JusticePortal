import React, { useState } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from './firebase';
import Cookies from 'js-cookie';
import { TextField, Button, Snackbar } from '@mui/material'; // Import Material-UI components
import eyeOpen from './Assets/eye_open.png';
import eyeClosed from './Assets/eye_closed.png';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginMessage, setLoginMessage] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [openSnackbar, setOpenSnackbar] = useState(false); // State to control Snackbar visibility

  const handleLogin = async (e) => {
    e.preventDefault();
  
    const usersCollectionRef = collection(db, 'users');
    const lowerCaseUsername = username.toLowerCase();
    const q = query(usersCollectionRef, where('username', '==', lowerCaseUsername));
  
    try {
      const querySnapshot = await getDocs(q);
  
      if (!querySnapshot.empty) {
        const userDoc = querySnapshot.docs[0].data();
  
        if (userDoc.password === password) {
          setLoginMessage('Authenticating...');
          Cookies.set('username', lowerCaseUsername);
  
          setTimeout(() => {
            window.location.href = '/MainPage';
          }, 3000);
        } else {
          setLoginMessage('Invalid credentials. Please try again.');
          setOpenSnackbar(true); // Open Snackbar for failure message
        }
      } else {
        setLoginMessage('Invalid credentials or user not registered. Please try again.');
        setOpenSnackbar(true); // Open Snackbar for failure message
      }
    } catch (error) {
      console.error('Error during login:', error);
      setLoginMessage('An error occurred during login. Please try again later.');
      setOpenSnackbar(true); // Open Snackbar for failure message
    }
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false); // Close Snackbar
  };

  return (
    <div className='container'>
      <h1>User Login</h1>
      <form onSubmit={handleLogin}>
        <TextField
          label="Username"
          variant="outlined"
          required
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          autoComplete="off"
        />
        <br />
        <div style={{ position: 'relative' }}>
          <TextField
            label="Password"
            type={passwordVisible ? 'text' : 'password'}
            variant="outlined"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <span
            style={{
              position: 'absolute',
              top: '39%',
              right: '30px',
              transform: 'translateY(-50%)',
            }}
            onClick={() => setPasswordVisible(!passwordVisible)}
          >
            <img
              src={passwordVisible ? eyeOpen : eyeClosed}
              alt="Toggle Password"
              style={{
                maxWidth: '24px',
                height: 'auto',
                cursor: 'pointer',
              }}
            />
          </span>
        </div>
        <br />
        <Button type="submit" variant="contained" color="primary">Login</Button>
      </form>
      <div>
        <p>Don't have an account? <span onClick={() => window.location.href = '/register'}>Register</span></p> {/* Link to Register page */}
      </div>
      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        message={loginMessage}
      />
    </div>
  );
};

export default Login;
