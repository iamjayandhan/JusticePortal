import React, { useState } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from './firebase';
import Cookies from 'js-cookie';
import { TextField, Button, Snackbar } from '@mui/material';
import eyeOpen from './Assets/eye_open.png';
import eyeClosed from './Assets/eye_closed.png';
import '../css/Login.css';
import myImage from './Assets/court3.png';

const Login = () => {
  const [identifier, setIdentifier] = useState(''); // Change 'username' to 'identifier' to accommodate both email and username
  const [password, setPassword] = useState('');
  const [loginMessage, setLoginMessage] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [openSnackbar, setOpenSnackbar] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
  
    const usersCollectionRef = collection(db, 'users');
    const lowerCaseIdentifier = identifier.toLowerCase();
    const usernameQuery = query(usersCollectionRef, where('username', '==', lowerCaseIdentifier)); // Query for username
    const emailQuery = query(usersCollectionRef, where('email', '==', lowerCaseIdentifier)); // Query for email
  
    try {
      const usernameSnapshot = await getDocs(usernameQuery);
      const emailSnapshot = await getDocs(emailQuery);

      if (!usernameSnapshot.empty || !emailSnapshot.empty) {
        const userDoc = !usernameSnapshot.empty ? usernameSnapshot.docs[0].data() : emailSnapshot.docs[0].data(); // Check both username and email
        if (userDoc.password === password) {
          setLoginMessage('Authenticating...');
          Cookies.set('username', userDoc.username); // Set username
          const userRole = userDoc.role.substring(5);
          Cookies.set('role', userRole); 
          Cookies.set('email', userDoc.email);
          setTimeout(() => {
            window.location.href = '/MainPage';
          }, 100);
        } else {
          setLoginMessage('Invalid credentials. Please try again.');
          setOpenSnackbar(true);
        }
      } else {
        setLoginMessage('Invalid credentials or user not registered. Please try again.');
        setOpenSnackbar(true);
      }
    } catch (error) {
      console.error('Error during login:', error);
      setLoginMessage('An error occurred during login. Please try again later.');
      setOpenSnackbar(true);
    }
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  return (
  <div className='login-page-bg'>
  <div class="header-container-login">
  <div className="img-container">
      {/* Use the imported image with styles */}
      <img src={myImage} alt="Description" className="img" />
    </div>
    <h1 className='justiceTitleLogin'>Justice Portal</h1>
    {/* <h1 className='sloganLogin'>Bridging the Gap between Law and Fairness</h1> */}
    <h1 className='sloganLogin'>Bridging the Gap between</h1>
      <h1 className='sloganLogin1'>Law and Fairness</h1>
    </div>
    <div class="outer-container">
    <div className='login-container'>
      <h1 className='login-heading'>Login</h1>
      <form onSubmit={handleLogin} className="login-form">
        <TextField
          label="Email or Username" // Change label to reflect email or username
          variant="outlined"
          required
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
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
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        message={loginMessage}
      />
      
    </div>
    </div>
    <div class="page-footer">
      <h7 className="msg">"Success is not final, failure is not fatal: It is the courage to continue that counts." - Winston Churchill</h7>
    </div>
    </div>
  );
};

export default Login;
