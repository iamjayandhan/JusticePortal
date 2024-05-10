import React, { useState, useEffect } from 'react';
import { db, storage } from './firebase';
import { collection, addDoc, getDocs } from 'firebase/firestore';
import { ref, getDownloadURL } from 'firebase/storage';
import Cookies from 'js-cookie';
import '../css/AllCases.css';

function AllCases() {
  const [cases, setCases] = useState([]);
  const [selectedCase, setSelectedCase] = useState(null);
  const [userRole, setUserRole] = useState('');

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
                  if (typeof fileInfo === 'string') { // Add a type check
                    const fileRef = ref(storage, fileInfo);
                    const downloadURL = await getDownloadURL(fileRef);
                    return { filePath: fileInfo, downloadURL };
                  } else if (fileInfo.filePath) { // Check if filePath exists in object
                    const fileRef = ref(storage, fileInfo.filePath);
                    const downloadURL = await getDownloadURL(fileRef);
                    return { ...fileInfo, downloadURL };
                  } else {
                    console.error('File path is not a string:', fileInfo);
                    // Handle the error or skip this file
                    return null;
                  }
                }).filter(fileInfo => fileInfo !== null) // Filter out null values
              );
              
              caseData.files = filesData;
            } else {
              caseData.files = [];
            }
            casesData.push({ id: doc.id, ...caseData });
          }
          
          setCases(casesData);
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

  const handleViewCaseDetails = (caseItem) => {
    setSelectedCase(caseItem);
  };

  const handleTakeCase = async () => {
    try {
      // Implement the logic to take the case
      console.log('Case taken by lawyer:', selectedCase.id);

      // Store case details in the inbox
      const username = Cookies.get('username');
      const messageRef = collection(db, 'messages');
      await addDoc(messageRef, {
        username,
        caseDetails: selectedCase,
      });

      setSelectedCase(null); // Reset selectedCase after taking the case
    } catch (error) {
      console.error('Error taking the case:', error);
    }
  };

  return (
    <div>
      <h2>All Cases</h2>
      {cases.map((caseItem) => (
        <div className="case-container" key={caseItem.id}>
          <h3 className="case-title">{caseItem.caseTitle}</h3>
          <p className="case-description">Description: {caseItem.caseDescription}</p>
          {userRole === 'Lawyers/Attorneys' && (
            <button onClick={() => handleViewCaseDetails(caseItem)}>View Case Details</button>
          )}
        </div>
      ))}
      {/* Modal for case details */}
{selectedCase && (
  <div className="modal-allcases">
    <div className="modal-content-allcases">
      <h2>Case Details</h2>
      <p>Case Title: {selectedCase.caseTitle}</p>
      <p>Case Description: {selectedCase.caseDescription}</p>
      <p>Client Name: {selectedCase.caseAssignee}</p>
      <p>Case Type: {selectedCase.caseType}</p>
      <p>Filling Date: {selectedCase.filingDateTime}</p>
      
      {/* Display files attached to the case */}
      {selectedCase.files.length > 0 && (
        <div>
          <h3>Files Attached:</h3>
          <ul className='ul-allcases'>
            {selectedCase.files.map((file, index) => (
              <li key={index}>
                <a href={file.downloadURL} target="_blank" rel="noopener noreferrer" className="file-link">{file.filePath}</a>
              </li>
            ))}
          </ul>
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

    </div>
  );
}

export default AllCases;
