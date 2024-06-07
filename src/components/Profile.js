import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from './firebase';
import Cookies from 'js-cookie';
import { TextField, Button, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions } from '@mui/material';
import '../css/Profile.css';
import eyeOpen from './Assets/eye_open.png'; // Import eye_open icon
import eyeClosed from './Assets/eye_closed.png'; // Import eye_closed icon

const Profile = () => {
  const [userData, setUserData] = useState(null);
  const [editableFields, setEditableFields] = useState({ email: false, password: false });
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false); // State to toggle password visibility
  const [logs, setLogs] = useState([]);
  const [showLogDialog, setShowLogDialog] = useState(false); // State to control log dialog visibility

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

  const handleViewLog = async () => {
    try {
      if (userData) {
        const logCollectionRef = collection(db, 'log');
        const q = query(logCollectionRef, where('deletedBy', '==', userData.username));
        const logQuerySnapshot = await getDocs(q);
        const logData = [];
        logQuerySnapshot.forEach((doc) => {
          logData.push({ id: doc.id, ...doc.data() });
        });
        setLogs(logData);
        setShowLogDialog(true);
      } else {
        console.log('User data not available.');
      }
    } catch (error) {
      console.error('Error fetching log data:', error);
    }
  };
  

  const handleCloseLogDialog = () => {
    setShowLogDialog(false);
  };


  const stringifyMessageData = (data, indent = 2) => {
    if (typeof data === 'object' && data !== null) {
      return Object.entries(data)
        .map(([key, value]) => {
          if (typeof value === 'object') {
            return `${' '.repeat(indent)}${key}: {\n${stringifyMessageData(value, indent + 2)}\n${' '.repeat(indent)}}`;
          } else {
            return `${' '.repeat(indent)}${key}: ${value}`;
          }
        })
        .join(',\n');
    } else {
      return data;
    }
  };
  
  const handleDownloadLog = () => {
    const formattedLogs = logs.map(log => {
      const logFields = Object.entries(log)
        .map(([key, value]) => {
          if (key === 'messageData') {
            return `${key}: {\n${stringifyMessageData(value)}\n}`;
          } else {
            return `${key}: ${value}`;
          }
        })
        .join(',\n');
      return `${log.timestamp ? log.timestamp.toDate().toLocaleString() : 'Unknown'} - {\n${logFields}\n}`;
    }).join('\n\n');
  
    const element = document.createElement('a');
    const file = new Blob([formattedLogs], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = 'log.txt';
    document.body.appendChild(element); // Required for this to work in Firefox
    element.click();
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
            <div className="field-container">
              <Button variant="contained" color="primary" className="button" onClick={handleViewLog}>View Log</Button>
            </div>
          </div>
        )}
      </div>
      <Dialog open={showLogDialog} onClose={handleCloseLogDialog}>
        <DialogTitle>Log Entries</DialogTitle>
        <DialogContent>
        <DialogContentText>
          {logs.length > 0 ? (
            logs.map((log, index) => (
              <div key={index}>
                {log.timestamp ? log.timestamp.toDate().toLocaleString() : 'Unknown'} - {log.message}
              </div>
            ))
          ) : (
            <div>No logs found for the current user.</div>
          )}
        </DialogContentText>
        </DialogContent>
            <DialogActions>
      {logs.length > 0 && (
        <Button onClick={handleDownloadLog}>Download Logs</Button>
      )}
      <Button onClick={handleCloseLogDialog}>Close</Button>
    </DialogActions>
      </Dialog>
      <div class="page-footer" style={{ backgroundColor: '#000000' }}>
      <h7 className="msg">"Manage your details here."</h7>
    </div>
    </>
  );
};

export default Profile;