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
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [caseToDelete, setCaseToDelete] = useState(null);

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
      const filePath = typeof file.filePath === 'string' ? file.filePath : '';
      const fileRef = ref(storage, filePath);
      await deleteObject(fileRef);

      const updatedFiles = cases.find((item) => item.id === caseId).files.filter((f) => f.filePath !== filePath);
      await updateDoc(doc(db, 'cases', caseId), { files: updatedFiles });

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
      const filesArray = Array.from(newFiles);

      const uploadedFiles = await Promise.all(filesArray.map(async (file) => {
        const storageRef = ref(storage, `cases/${file.name}`);
        await uploadBytes(storageRef, file);
        return { filePath: storageRef.fullPath, downloadURL: await getDownloadURL(storageRef) };
      }));

      const updatedFiles = [...cases.find((item) => item.id === caseId).files, ...uploadedFiles];
      await updateDoc(doc(db, 'cases', caseId), { files: updatedFiles });

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

  const handleDeleteCase = async (caseId) => {
    try {
      await deleteDoc(doc(db, 'cases', caseId));
      setCases((prevCases) => prevCases.filter((item) => item.id !== caseId));
      setIsDeleteModalOpen(false); // Close the delete confirmation modal
      console.log('Case deleted successfully.');
    } catch (error) {
      console.error('Error deleting case:', error);
    }
  };

  const toggleEditingMode = (caseId) => {
    const caseToEdit = cases.find((item) => item.id === caseId);
    setEditingCaseId(caseId === editingCaseId ? null : caseId);
    if (caseId !== editingCaseId) {
      setEditedCase({
        caseTitle: caseToEdit.caseTitle,
        caseDescription: caseToEdit.caseDescription,
        caseType: caseToEdit.caseType,
        caseAssignee: caseToEdit.caseAssignee,
      });
    }
  };

  const handleUpdateCase = async (caseId) => {
    try {
      const updatedCaseData = {
        id: caseId,
        caseTitle: editedCase.caseTitle || cases.find(item => item.id === caseId).caseTitle,
        caseDescription: editedCase.caseDescription || cases.find(item => item.id === caseId).caseDescription,
        caseType: editedCase.caseType || cases.find(item => item.id === caseId).caseType,
        caseAssignee: editedCase.caseAssignee || cases.find(item => item.id === caseId).caseAssignee,
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

  const handleOpenDeleteModal = (caseItem) => {
    setCaseToDelete(caseItem);
    setIsDeleteModalOpen(true);
  };

  const handleCloseDeleteModal = () => {
    setCaseToDelete(null);
    setIsDeleteModalOpen(false);
  };

  return (
    <div>
      <h2 style={{color:'#fff'}}>MY CASES</h2>
      {cases.length === 0 ? (
        <p style={{ color: '#fff', textAlign: 'center', paddingTop: '250px' }}>No cases found.</p>
      ) : (
        cases.map((caseItem) => (
          <div className="case-container" key={caseItem.id}>
            {editingCaseId === caseItem.id ? (
              <div className="edit-case-form">
                <h3 className='edit-case-title'>Edit Case Details:</h3>
                <div className="input-field">
                  <label htmlFor="edit-case-title"><b>Case Title:</b></label>
                  <input
                    id="edit-case-title"
                    type="text"
                    value={editedCase.caseTitle}
                    onChange={(e) => setEditedCase({ ...editedCase, caseTitle: e.target.value })}
                  />
                </div>
                <div className="input-field">
                  <label htmlFor="edit-case-description"><b>Description:</b></label>
                  <textarea
                    id="edit-case-description"
                    value={editedCase.caseDescription}
                    onChange={(e) => setEditedCase({ ...editedCase, caseDescription: e.target.value })}
                  />
                </div>
                <div className="input-field">
                  <label htmlFor="edit-case-type"><b>Type:</b>👁️‍🗨️</label>
                  <input
                    id="edit-case-type"
                    type="text"
                    value={editedCase.caseType}
                    onChange={(e) => setEditedCase({ ...editedCase, caseType: e.target.value })}
                  />
                </div>
                <div className="input-field">
                  <label htmlFor="edit-case-assignee"><b>Assignee:</b>👤</label>
                  <input
                    id="edit-case-assignee"
                    type="text"
                    value={editedCase.caseAssignee}
                    onChange={(e) => setEditedCase({ ...editedCase, caseAssignee: e.target.value })}
                  />
                </div>
                <div className="existing-files">
                  <h4 className='files-title'>Existing Files:</h4>
                  <div className='files-list'>
                   
                  {caseItem.files.map((file, index) => (
                      <div className='file-item' key={index}>
                        <a className='file-link' href={file.downloadURL} target="_blank" rel="noopener noreferrer" style={{ color: 'black' }}>
                          {file.filePath}
                        </a>
                        <button onClick={() => handleDeleteFile(caseItem.id, file)} style={{ marginLeft: '5px' }}>Delete</button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="input-field">
                  <label htmlFor="edit-case-files"><b>Upload New File(s):</b></label>
                  <input id="edit-case-files" type="file" multiple onChange={(e) => handleFileChange(caseItem.id, e.target.files)} />
                </div>
                <button onClick={() => handleUpdateCase(caseItem.id)}>Update</button>
                <button className='cancel-btn' onClick={() => {
                  setEditingCaseId(null); // Exit editing mode
                  setEditedCase({
                    caseTitle: '',
                    caseDescription: '',
                    caseType: '',
                    caseAssignee: '',
                  });
                }}>Cancel</button>
              </div>
            ) : (
              <>
                <h3 className="case-title">Title: {caseItem.caseTitle}</h3>
                <p className="case-description"><b>Description:</b> {caseItem.caseDescription}</p>
                <div className="case-details">
                  <p><b>Type:</b> {caseItem.caseType}</p>
                  <p><b>Assignee:</b>👤{caseItem.caseAssignee}</p>
                  <p><b>Filing Date:</b> {new Date(caseItem.filingDateTime).toLocaleString()}</p>
                  <div>
                    <h4 className='files-title'>Files:</h4>
                    <div className="files-list">
                      {caseItem.files && caseItem.files.map((file, index) => (
                        <a className="file-link" href={file.downloadURL} target="_blank" rel="noopener noreferrer" key={index}>
                          {file.filePath}
                        </a>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="case-actions">
                  <button onClick={() => handleOpenDeleteModal(caseItem)}>Delete</button>
                  <button onClick={() => toggleEditingMode(caseItem.id)}>Edit</button>
                </div>
              </>
            )}
          </div>
        ))
      )}
      <div className="wanted-level">
        <span>Wanted Level:</span>
        {Array.from({ length: wantedLevel }, (_, index) => (
          <img key={index} src={starImage} alt="star" />
        ))}
      </div>

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="delete-modal">
          <div className="delete-modal-content">
            <h3>Confirm Deletion</h3>
            <p>Are you sure you want to delete the case "{caseToDelete.caseTitle}"?</p>
            <div>
              <button onClick={() => handleDeleteCase(caseToDelete.id)}>Yes, Delete</button>
              <button onClick={handleCloseDeleteModal}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MyCases;
