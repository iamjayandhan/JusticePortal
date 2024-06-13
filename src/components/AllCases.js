import React, { useState, useEffect } from 'react';
import { db, storage } from './firebase';
import { collection, addDoc, getDocs } from 'firebase/firestore';
import { ref, getDownloadURL } from 'firebase/storage';
import Cookies from 'js-cookie';
import '../css/AllCases.css';
import { Snackbar } from '@mui/material';

function AllCases() {
  const [cases, setCases] = useState([]);
  const [selectedCase, setSelectedCase] = useState(null);
  const [filteredCases, setFilteredCases] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [userRole, setUserRole] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  useEffect(() => {
    const fetchCases = async () => {
      try {
        const casesCollection = collection(db, 'cases');
        const querySnapshot = await getDocs(casesCollection);
        if (!querySnapshot.empty) {
          const casesData = [];
          for (const doc of querySnapshot.docs) {
            const caseData = doc.data();
            if (caseData.files) {
              const filesData = await Promise.all(
                caseData.files.map(async (fileInfo) => {
                  if (typeof fileInfo === 'string') {
                    const fileRef = ref(storage, fileInfo);
                    const downloadURL = await getDownloadURL(fileRef);
                    return { filePath: fileInfo, downloadURL };
                  } else if (fileInfo.filePath) {
                    const fileRef = ref(storage, fileInfo.filePath);
                    const downloadURL = await getDownloadURL(fileRef);
                    return { ...fileInfo, downloadURL };
                  } else {
                    console.error('File path is not a string:', fileInfo);
                    return null;
                  }
                }).filter(fileInfo => fileInfo !== null)
              );
              
              caseData.files = filesData;
            } else {
              caseData.files = [];
            }
            casesData.push({ id: doc.id, ...caseData });
          }
          
          setCases(casesData);
          setFilteredCases(casesData);
        } else {
          console.log('No cases found.');
        }
      } catch (error) {
        console.error('Error fetching cases:', error);
      }
    };

    const fetchUserRole = async (username) => {
      try {
        const usersCollection = collection(db, 'users');
        const querySnapshot = await getDocs(usersCollection);
        querySnapshot.forEach((doc) => {
          const userData = doc.data();
          if (userData.username === username) {
            setUserRole(userData.role);
          }
        });
      } catch (error) {
        console.error('Error fetching user role:', error);
      }
    };

    const username = Cookies.get('username');
    if (username) {
      fetchUserRole(username);
    } else {
      console.log('No username found in the cookie.');
    }

    fetchCases();
  }, []);

  useEffect(() => {
    const lowercasedFilter = searchQuery.toLowerCase();
    const filteredData = cases.filter((item) =>
      item.caseTitle.toLowerCase().includes(lowercasedFilter)
    );
    setFilteredCases(filteredData);
  }, [searchQuery, cases]);

  const handleViewCaseDetails = (caseItem) => {
    setSelectedCase(caseItem);
  };

  const handleTakeCase = async () => {
    try {
      console.log('Case taken by lawyer:', selectedCase.id);

      setSnackbarMessage('Case successfully taken!');
      setSnackbarOpen(true);

      setTimeout(() => {
        setSnackbarMessage("Please check your inbox for adding hearing details.");
        setSnackbarOpen(true);
      }, 4000);

      const username = Cookies.get('username');
      const messageRef = collection(db, 'messages');
      await addDoc(messageRef, {
        username,
        caseDetails: selectedCase,
        type: "caseTaken",
      });

      setSelectedCase(null);
    } catch (error) {
      console.error('Error taking the case:', error);
    }
  };

  return (
    <div>
      <h2 style={{color:'#fff'}}>ALL CASES</h2>
      <input
        type="text"
        placeholder="Search by case title..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="search-bar"
      />
      {filteredCases.length === 0 ? (
        <p className="no-cases-message" >🐻Bear a minute...we are preparing all documents.</p>
      ) : (
        filteredCases.map((caseItem) => (
          <div className="case-container" key={caseItem.id}>
            <h3 className="case-title">Title: {caseItem.caseTitle}</h3>
            <p className="case-description"><b>Description:</b> {caseItem.caseDescription}</p>
            {userRole === 'Lawyers/Attorneys' && (
              <button onClick={() => handleViewCaseDetails(caseItem)}>View Case Details</button>
            )}
          </div>
        ))
      )}
      {selectedCase && (
        <div className="modal-allcases">
          <div className="modal-content-allcases">
            <h2>Case Details</h2>
            <p><b>Case Title:</b> {selectedCase.caseTitle}</p>
            <p><b>Case Description:</b> {selectedCase.caseDescription}</p>
            <p><b>Client Name:</b>👤{selectedCase.caseAssignee}</p>
            <p><b>Case Type:</b> {selectedCase.caseType}</p>
            <p><b>Filing Date:</b> {selectedCase.filingDateTime}</p>
            
            {selectedCase.files.length > 0 && (
              <div>
                <h3>Files Attached:</h3>
                {selectedCase.files.map((file, index) => (
                  <p key={index}>
                    <a href={file.downloadURL} target="_blank" rel="noopener noreferrer" className="file-link">{file.filePath}</a>
                  </p>
                ))}
              </div>
            )}

            {userRole === 'Lawyers/Attorneys' && (
              <>
                <button onClick={handleTakeCase}>Take Case</button>
                <button onClick={() => setSelectedCase(null)}>Back</button>
              </>
            )}
          </div>
        </div>
      )}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        message={snackbarMessage}
      />
    </div>
  );
}

export default AllCases;
