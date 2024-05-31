import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from './firebase';
import Cookies from 'js-cookie';
import { TextField, Button } from '@mui/material';
import '../css/Profile.css';
import eyeOpen from './Assets/eye_open.png'; // Import eye_open icon
import eyeClosed from './Assets/eye_closed.png'; // Import eye_closed icon

const Profile = () => {
  const [userData, setUserData] = useState(null);
  const [editableFields, setEditableFields] = useState({ email: false, password: false });
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false); // State to toggle password visibility

  const username = Cookies.get('username');

  useEffect(() => {
    const fetchUserData = async () => {
      if (username) {
        const usersCollectionRef = collection(db, 'users');
        const q = query(usersCollectionRef, where('username', '==', username));

        try {
          const querySnapshot = await getDocs(q);
          if (!querySnapshot.empty) {
            querySnapshot.forEach((doc) => {
              setUserData({ id: doc.id, ...doc.data() });
            });
          } else {
            console.log('No user found with the provided username');
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      } else {
        console.log('No username found in cookies');
      }
    };

    fetchUserData();
  }, [username]);

  const handleEditField = (field) => {
    setEditableFields({ ...editableFields, [field]: true });
  };

  const handleSaveField = async (field) => {
    try {
      await updateDoc(doc(db, 'users', userData.id), { [field]: userData[field] });
      setUpdateSuccess(true);
      setEditableFields({ ...editableFields, [field]: false });
    } catch (error) {
      console.error('Error updating user profile:', error);
    }
  };

  const handleDiscardChanges = (field) => {
    setEditableFields({ ...editableFields, [field]: false });
    setUserData({ ...userData });
  };

  const handleInputChange = (e, field) => {
    const value = e.target.value;
    setUserData({ ...userData, [field]: value });
  };

  return (
    <>
    <h1 className="title">User Profile</h1>

    <div className="container">
      {userData && (
        <div>
          <div className="field-container">
            <h2 className='field-label'>Username: {userData.username}</h2>
          </div>
          <div className="field-container">
            <h2 className="field-label">Role: {userData.role}</h2>
          </div>
          <div className="field-container">
            {editableFields['email'] ? (
              <TextField
                label="Email"
                variant="outlined"
                className="field-input"
                fullWidth
                value={userData.email}
                onChange={(e) => handleInputChange(e, 'email')}
              />
            ) : (
              <h2 className="field-label">Email: {userData.email}</h2>
            )}
            {editableFields['email'] ? (
              <div className="field-actions">
                <Button variant="contained" color="primary" className="button" onClick={() => handleSaveField('email')}>Save</Button>
                <Button variant="contained" color="secondary" className="button" onClick={() => handleDiscardChanges('email')}>Discard</Button>
              </div>
            ) : (
              <Button variant="contained" className="button" onClick={() => handleEditField('email')}>Edit</Button>
            )}
          </div>
          <div className="field-container">
            {editableFields['password'] ? (
              <div className="password-field">
                <TextField
                  label="Password"
                  type={passwordVisible ? 'text' : 'password'}
                  variant="outlined"
                  className="field-input"
                  fullWidth
                  value={userData.password}
                  onChange={(e) => handleInputChange(e, 'password')}
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
            ) : (
              <h2 className="field-label">Password: ********</h2>
            )}
            {editableFields['password'] ? (
              <div className="field-actions">
                <Button variant="contained" color="primary" className="button" onClick={() => handleSaveField('password')}>Save</Button>
                <Button variant="contained" color="secondary" className="button" onClick={() => handleDiscardChanges('password')}>Discard</Button>
              </div>
            ) : (
              <Button variant="contained" className="button" onClick={() => handleEditField('password')}>Edit</Button>
            )}
          </div>
          {updateSuccess && (
            <p className="success-message">Profile updated successfully!</p>
          )}
        </div>
      )}
    </div>
    </>
  );
};

export default Profile;
