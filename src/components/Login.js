import React, { useState } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from './firebase';
import Cookies from 'js-cookie';
import { TextField, Button, Snackbar } from '@mui/material'; // Import Material-UI components
import eyeOpen from './Assets/eye_open.png';
import eyeClosed from './Assets/eye_closed.png';
import '../css/Login.css'; // Import component-specific styles

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
          const userRole = userDoc.role.substring(5); // Remove the first 8 characters ("Case%20")
          Cookies.set('role', userRole);  
          setTimeout(() => {
            window.location.href = '/MainPage';
          }, 100);
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
      <form onSubmit={handleLogin} className="login-form">
        <TextField
          label="Username"
          variant="outlined"
          required
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          autoComplete="off"
          className="input-field1"
        />
        <br />
        <div className="password-field">
          <TextField
            label="Password"
            type={passwordVisible ? 'text' : 'password'}
            variant="outlined"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input-field2"
          />
          <span
            className="toggle-password"
            onClick={() => setPasswordVisible(!passwordVisible)}
          >
            <img
              src={passwordVisible ? eyeOpen : eyeClosed}
              alt="Toggle Password"
              className="eye-icon"
            />
          </span>
        </div>
        <br />
        <Button type="submit" variant="contained" color="primary">Login</Button>
      </form>
      <div>
        <p>Don't have an account? <span onClick={() => window.location.href = '/register'} className="register-link">Register</span></p>
      </div>
      <Snackbar
        open={openSnackbar}
        autoHideDuration={100}
        onClose={handleCloseSnackbar}
        message={loginMessage}
      />
    </div>
  );
};

export default Login;
