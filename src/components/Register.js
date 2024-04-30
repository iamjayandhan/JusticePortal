import React, { useState } from 'react';
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore';
import { db } from './firebase';
import Cookies from 'js-cookie';
import { TextField, Button, Snackbar, FormControl, InputLabel, Select, MenuItem } from '@mui/material'; import eyeOpen from './Assets/eye_open.png'; // Import eye_open icon
import eyeClosed from './Assets/eye_closed.png'; // Import eye_closed icon
import '../css/Register.css'; // Import Register.css for styling

const Register = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('');
  const [registrationMessage, setRegistrationMessage] = useState('');
  const [openSnackbar, setOpenSnackbar] = useState(false); // State to control Snackbar visibility
  const [passwordVisible, setPasswordVisible] = useState(false); // State to toggle password visibility
  const [registrationSuccess, setRegistrationSuccess] = useState(false); // State to control success message visibility

  const handleRegistration = async (e) => {
    e.preventDefault();
  
    const usersCollectionRef = collection(db, 'users');
    const lowercaseUsername = username.toLowerCase();
    const q = query(usersCollectionRef, where('username', '==', lowercaseUsername));
  
    try {
      const querySnapshot = await getDocs(q);
  
      if (!querySnapshot.empty) {
        setRegistrationMessage('Username already exists. Please choose a different one.');
        setOpenSnackbar(true); // Open Snackbar for failure message
        return;
      }
  
      await addDoc(usersCollectionRef, {
        username: lowercaseUsername,
        email,
        role,
        password,
      });
  
      Cookies.set('username', lowercaseUsername);
      Cookies.set('role', role);
  
      setRegistrationSuccess(true); // Set success message visibility
      setRegistrationMessage('Registration successful! Redirecting...');
      setUsername('');
      setPassword('');
  
      setTimeout(() => {
        // Redirect to LoginPage after registration
        window.location.href = '/MainPage';
      }, 1000);
    } catch (error) {
      console.error('Error during registration:', error);
      setRegistrationMessage('An error occurred during registration. Please try again later.');
      setOpenSnackbar(true); // Open Snackbar for failure message
    }
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false); // Close Snackbar
  };

  return (
    <div className='container'>
      <h1>User Registration</h1>
      <form className="form" onSubmit={handleRegistration}>
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
        <TextField
          label="Email" // Add email input field
          type="email"
          variant="outlined"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="off"
          className="input-field2"
        />
        <br/>
        <div className="input-field3">
  <FormControl variant="outlined" required style={{ width: '300px' }}> {/* Adjust width here */}
    <InputLabel>Role</InputLabel>
    <Select
      value={role}
      onChange={(e) => setRole(e.target.value)}
      label="Role"
    >
      <MenuItem value="Case Owners/Clients">Case Owners/Clients</MenuItem>
      <MenuItem value="Lawyers/Attorneys">Lawyers/Attorneys</MenuItem>
      <MenuItem value="clerk/Endorser">Clerk/Endorser</MenuItem>
    </Select>
  </FormControl>
</div>

<div className="password-field" style={{ width: '300px', position: 'relative', marginBottom: '20px' }}>
  <TextField
    label="Password"
    type={passwordVisible ? 'text' : 'password'}
    variant="outlined"
    required
    value={password}
    onChange={(e) => setPassword(e.target.value)}
    style={{ width: '100%' }} // Set the width of the TextField to 100% to fill the container
  />
  <span
    className="toggle-password"
    style={{ position: 'absolute', top: '50%', right: '10px', transform: 'translateY(-50%)' }}
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
        <Button type="submit" variant="contained" color="primary">Register</Button>
      </form>
      <div>
        <p>Already have an account? <span onClick={() => window.location.href = '/login'} className="register-link">Login</span></p> {/* Directly change window location */}
      </div>
      <Snackbar
        open={openSnackbar}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        message={registrationMessage}
      />
      <Snackbar
        open={registrationSuccess}
        autoHideDuration={3000}
        onClose={() => setRegistrationSuccess(false)}
        message="Registration successful!"
      />
    </div>
  );
};

export default Register;
