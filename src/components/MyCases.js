import React, { useState, useEffect } from 'react';
import { db, storage } from './firebase'; // Import the Firestore database instance and Firebase storage instance
import { collection, query, where, getDocs, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { ref, getDownloadURL } from "firebase/storage";
import '../css/AllCases.css'; // Import the CSS file
import Cookies from 'js-cookie';

function MyCases() {
  const [cases, setCases] = useState([]);
  const [editingCaseId, setEditingCaseId] = useState(null); // State to track the case being edited
  const username = Cookies.get('username'); // Assuming you have the logged-in username stored in a cookie

  // Define state variables and functions for editing case details
  const [caseTitle, setCaseTitle] = useState('');
  const [caseDescription, setCaseDescription] = useState('');

  useEffect(() => {
    const fetchCases = async () => {
      try {
        const casesCollection = collection(db, "cases");
        const userCasesQuery = query(casesCollection, where('username', '==', username)); // Filter cases by username
        const querySnapshot = await getDocs(userCasesQuery);
        if (!querySnapshot.empty) {
          const casesData = [];
          for (const doc of querySnapshot.docs) {
            const caseData = doc.data();
            if (caseData.files) {
              const filesData = await Promise.all(caseData.files.map(async (filePath) => {
                const fileRef = ref(storage, filePath);
                const downloadURL = await getDownloadURL(fileRef);
                return { filePath, downloadURL };
              }));
              caseData.files = filesData;
            } else {
              caseData.files = [];
            }
            casesData.push({ id: doc.id, ...caseData });
          }
          setCases(casesData);
        } else {
          console.log("No cases found.");
        }
      } catch (error) {
        console.error("Error fetching cases:", error);
      }
    };
      
    fetchCases();
  }, [username]); // Add username to the dependency array to fetch cases when the username changes

  // Function to delete a case
  const handleDeleteCase = async (caseId) => {
    try {
      await deleteDoc(doc(db, 'cases', caseId));
      setCases((prevCases) => prevCases.filter((item) => item.id !== caseId));
      console.log('Case deleted successfully.');
    } catch (error) {
      console.error('Error deleting case:', error);
    }
  };

  // Function to handle toggling the editing mode
  const toggleEditingMode = (caseId) => {
    setEditingCaseId(caseId === editingCaseId ? null : caseId);
  };

  // Function to update case details
  const handleUpdateCase = async (updatedCaseData) => {
    try {
      await updateDoc(doc(db, 'cases', updatedCaseData.id), updatedCaseData);
      // Update the cases state with the updated case details
      setCases((prevCases) => prevCases.map((item) => (item.id === updatedCaseData.id ? updatedCaseData : item)));
      console.log('Case updated successfully.');
      // Reset editing mode
      setEditingCaseId(null);
    } catch (error) {
      console.error('Error updating case:', error);
    }
  };

  return (
    <div>
      <h2>My Cases</h2>
      {cases.map((caseItem) => (
        <div className="case-container" key={caseItem.id}>
          {/* Check if the current case is in editing mode */}
          {editingCaseId === caseItem.id ? (
            // If in editing mode, display input fields for updating case details
            <div className="edit-case-form">
              <h3>Edit Case</h3>
              {/* Add input fields for editing case details */}
              <input type="text" value={caseTitle} onChange={(e) => setCaseTitle(e.target.value)} />
              <input type="text" value={caseDescription} onChange={(e) => setCaseDescription(e.target.value)} />
              {/* Add other input fields as needed */}
              <button onClick={() => handleUpdateCase({ id: caseItem.id, caseTitle, caseDescription })}>Update</button>
            </div>
          ) : (
            // If not in editing mode, display case details
            <>
              <h3 className="case-title">{caseItem.caseTitle}</h3>
              <p className="case-description">Description: {caseItem.caseDescription}</p>
              <div className="case-details">
                <p>Type: {caseItem.caseType}</p>
                <p>Assignee: {caseItem.caseAssignee}</p>
                <p>Filing Date: {new Date(caseItem.filingDateTime).toLocaleString()}</p>
              </div>
              <h4>Files:</h4>
              <ul className="files-list">
                {caseItem.files && caseItem.files.map((file) => (
                  <li className="file-item" key={file.filePath}>
                    <a className="file-link" href={file.downloadURL} target="_blank" rel="noopener noreferrer">{file.filePath}</a>
                  </li>
                ))}
              </ul>
              <div className="case-actions">
                <button onClick={() => handleDeleteCase(caseItem.id)}>Delete</button>
                {/* Add edit button with onClick event to toggle editing mode */}
                <button onClick={() => toggleEditingMode(caseItem.id)}>Edit</button>
              </div>
            </>
          )}
        </div>
      ))}
    </div>
  );
}

export default MyCases;
