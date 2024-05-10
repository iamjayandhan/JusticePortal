import React, { useState, useEffect } from 'react';
import { db, storage } from './firebase'; // Import the Firestore database instance and Firebase storage instance
import { collection, query, where, getDocs, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { ref, getDownloadURL, deleteObject, uploadBytes } from "firebase/storage";
import '../css/MyCases.css'; // Import the CSS file
import Cookies from 'js-cookie';
import starImage from './star2.png'; // Import the star image

function MyCases() {
  const [cases, setCases] = useState([]);
  const [editingCaseId, setEditingCaseId] = useState(null); // State to track the case being edited
  const [username, setUsername] = useState(null); // State to store logged-in username
  const [wantedLevel, setWantedLevel] = useState(0); // State to store wanted level

  // Define state variables for editing case details
  const [editedCase, setEditedCase] = useState({
    caseTitle: '',
    caseDescription: '',
    caseType: '',
    caseAssignee: '',
  });

  useEffect(() => {
    const fetchCases = async () => {
      try {
        const cookieUsername = Cookies.get('username');
        setUsername(cookieUsername);
        const casesCollection = collection(db, "cases");
        const userCasesQuery = query(casesCollection, where('username', '==', cookieUsername));
        const querySnapshot = await getDocs(userCasesQuery);
    
        if (!querySnapshot.empty) {
          const casesData = [];
          for (const doc of querySnapshot.docs) {
            const caseData = doc.data();
            if (caseData.files) {
              const filesData = await Promise.all(caseData.files.map(async (fileInfo) => {
                try {
                  const filePath = typeof fileInfo === 'string' ? fileInfo : fileInfo.filePath;
                  const fileRef = ref(storage, filePath);
                  const downloadURL = await getDownloadURL(fileRef);
                  return { filePath, downloadURL };
                } catch (error) {
                  console.error("Error getting download URL:", error);
                  return null;
                }
              }));
              caseData.files = filesData.filter(file => file !== null); // Filter out null values
            } else {
              caseData.files = [];
            }
            casesData.push({ id: doc.id, ...caseData });
          }
          setCases(casesData);
          setWantedLevel(casesData.length);
        } else {
          console.log("No cases found.");
        }
      } catch (error) {
        console.error("Error fetching cases:", error);
      }
    };
    

    fetchCases();
  }, []);

  const handleDeleteFile = async (caseId, file) => {
    try {
      // Ensure filePath is a string
      const filePath = typeof file.filePath === 'string' ? file.filePath : '';
  
      // Delete file from Firebase Storage
      const fileRef = ref(storage, filePath);
      await deleteObject(fileRef);
      
      // Update Firestore to remove file reference
      const updatedFiles = cases.find((item) => item.id === caseId).files.filter((f) => f.filePath !== filePath);
      await updateDoc(doc(db, 'cases', caseId), { files: updatedFiles });
  
      // Update local state to reflect the changes
      setCases((prevCases) =>
        prevCases.map((item) =>
          item.id === caseId ? { ...item, files: updatedFiles } : item
        )
      );
      
      console.log('File deleted successfully.');
    } catch (error) {
      console.error('Error deleting file:', error);
    }
  };
  
  const handleFileChange = async (caseId, newFiles) => {
    try {
      // Convert newFiles to an array if it's not already one
      const filesArray = Array.from(newFiles);
  
      // Upload new files to Firebase Storage
      const uploadedFiles = await Promise.all(filesArray.map(async (file) => {
        const storageRef = ref(storage, `cases/${file.name}`);
        await uploadBytes(storageRef, file);
        return { filePath: storageRef.fullPath, downloadURL: await getDownloadURL(storageRef) };
      }));
      
      // Update Firestore to add new file references
      const updatedFiles = [...cases.find((item) => item.id === caseId).files, ...uploadedFiles];
      await updateDoc(doc(db, 'cases', caseId), { files: updatedFiles });
  
      // Update local state to reflect the changes
      setCases((prevCases) =>
        prevCases.map((item) =>
          item.id === caseId ? { ...item, files: updatedFiles } : item
        )
      );
  
      console.log('New file(s) uploaded successfully.');
    } catch (error) {
      console.error('Error uploading file(s):', error);
    }
  };
  

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

  // Function to toggle editing mode
  const toggleEditingMode = (caseId) => {
    setEditingCaseId(caseId === editingCaseId ? null : caseId);
    // Reset editedCase state when exiting editing mode
    if (caseId !== editingCaseId) {
      setEditedCase({
        caseTitle: '',
        caseDescription: '',
        caseType: '',
        caseAssignee: '',
      });
    }
  };

  // Function to handle case update
  const handleUpdateCase = async (caseId) => {
    try {
      const updatedCaseData = {
        id: caseId,
        caseTitle: editedCase.caseTitle,
        caseDescription: editedCase.caseDescription,
        caseType: editedCase.caseType,
        caseAssignee: editedCase.caseAssignee,
        username: username,
      };
      await updateDoc(doc(db, 'cases', caseId), updatedCaseData);
      setCases((prevCases) =>
        prevCases.map((item) =>
          item.id === caseId ? { ...item, ...updatedCaseData } : item
        )
      );
      console.log('Case updated successfully.');
      setEditingCaseId(null); // Exit editing mode
    } catch (error) {
      console.error('Error updating case:', error);
    }
  };

  return (
    <div>
      <h2>MY CASES</h2>
      {cases.map((caseItem) => (
        <div className="case-container" key={caseItem.id}>
          {/* Check if the current case is in editing mode */}
          {editingCaseId === caseItem.id ? (
            // If in editing mode, display input fields for updating case details
            <div className="edit-case-form">
              <h3>Edit Case</h3>
              {/* Add input fields for editing case details */}
              <div className="input-field">
                <label htmlFor="edit-case-title">Case Title:</label>
                <input id="edit-case-title" type="text" value={editedCase.caseTitle || caseItem.caseTitle} onChange={(e) => setEditedCase({ ...editedCase, caseTitle: e.target.value })} />
              </div>
              <div className="input-field">
                <label htmlFor="edit-case-description">Description:</label>
                <textarea id="edit-case-description" value={editedCase.caseDescription || caseItem.caseDescription} onChange={(e) => setEditedCase({ ...editedCase, caseDescription: e.target.value })} />
              </div>
              <div className="input-field">
                <label htmlFor="edit-case-type">Type:</label>
                <input id="edit-case-type" type="text" value={editedCase.caseType || caseItem.caseType} onChange={(e) => setEditedCase({ ...editedCase, caseType: e.target.value })} />
              </div>
              <div className="input-field">
                <label htmlFor="edit-case-assignee">Assignee:</label>
                <input id="edit-case-assignee" type="text" value={editedCase.caseAssignee || caseItem.caseAssignee} onChange={(e) => setEditedCase({ ...editedCase, caseAssignee: e.target.value })} />
              </div>
              <div className="existing-files">
                <h4>Existing Files:</h4>
                <ul>
                  {caseItem.files.map((file, index) => (
                    <li key={index}>
                      <a href={file.downloadURL} target="_blank" rel="noopener noreferrer" style={{ color: 'black' }}>
                        {file.filePath}
                      </a>
                      <button onClick={() => handleDeleteFile(caseItem.id, file)}>Delete</button>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="input-field">
                <label htmlFor="edit-case-files">Upload New File(s):</label>
                <input id="edit-case-files" type="file" multiple onChange={(e) => handleFileChange(caseItem.id, e.target.files)} />
              </div>

              {/* Add other input fields as needed */}
              <button onClick={() => handleUpdateCase(caseItem.id)}>Update</button>
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


<div className="wanted-level">
        <span>Wanted Level:</span>
        {Array.from({ length: wantedLevel }, (_, index) => (
          <img key={index} src={starImage} alt="star" />
        ))}
      </div>

    </div>
  );
}

export default MyCases;
