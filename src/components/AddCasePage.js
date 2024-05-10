import React, { useState } from 'react';
import { db, storage } from './firebase'; // Import the Firestore database instance and Firebase storage instance
import { collection, addDoc } from "firebase/firestore";
import { ref, uploadBytes } from "firebase/storage";
import '../css/AddCasePage.css';
import Cookies from 'js-cookie';

function AddCasePage() {
  const [caseTitle, setCaseTitle] = useState('');
  const [caseDescription, setCaseDescription] = useState('');
  const [caseType, setCaseType] = useState('');
  const [caseAssignee, setCaseAssignee] = useState('');
  const [filingDate, setFilingDate] = useState('');
  const [files, setFiles] = useState([]);
  const username = Cookies.get('username'); 

  const handleFileChange = (e) => {
    const fileList = e.target.files;
    setFiles([...files, ...fileList]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Upload files to Firebase Storage
      const uploadedFiles = await Promise.all(files.map(async file => {
        const storageRef = ref(storage, `cases/${file.name}`);
        await uploadBytes(storageRef, file);
        return storageRef;
      }));

      // Store text details in Firestore along with file references
      const currentDate = new Date();
        const options = { timeZone: 'Asia/Kolkata' }; // IST time zone identifier
        const localTimeString = currentDate.toLocaleString('en-US', options);
        console.log(localTimeString);

      await addDoc(collection(db, "cases"), {
        caseTitle,
        caseDescription,
        caseType,
        caseAssignee,
        filingDateTime: localTimeString,
        files: uploadedFiles.map(fileRef => fileRef.fullPath), // Store file references
        username: username,
      });

      // Reset form fields
      resetForm();

      alert("Case added successfully!");
    } catch (error) {
      console.error("Error adding case: ", error);
      alert("An error occurred while adding the case. Please try again.");
    }
  };


  const resetForm = () => {
    setCaseTitle('');
    setCaseDescription('');
    setCaseType('');
    setCaseAssignee('');
    setFilingDate('');
    setFiles([]);
  };

  return (
    <div className="add-case-page">
      <h2>ADD CASE</h2>
      <form onSubmit={handleSubmit}>
        <label>
          Case Title:
          <input type="text" value={caseTitle} onChange={(e) => setCaseTitle(e.target.value)} required />
        </label>
        <label>
          Case Description:
          <textarea value={caseDescription} onChange={(e) => setCaseDescription(e.target.value)} required />
        </label>
        <label>
          Case Type:
          <input type="text" value={caseType} onChange={(e) => setCaseType(e.target.value)} required />
        </label>
        <label>
          Client Name:
          <input type="text" value={caseAssignee} onChange={(e) => setCaseAssignee(e.target.value)} required />
        </label>
        <label>
          Upload File(s):
          <input type="file" multiple onChange={handleFileChange} required />
        </label>
        <div className="buttons">
          <button type="submit">Add Case</button>
          <button type="button" onClick={resetForm}>Reset</button>
        </div>
      </form>
    </div>
  );
  
}

export default AddCasePage;
