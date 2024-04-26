import React, { useState, useEffect } from 'react';
import { db, storage } from './firebase'; // Import the Firestore database instance and Firebase storage instance
import { collection, getDocs } from "firebase/firestore";
import { ref, getDownloadURL } from "firebase/storage";
import '../css/AllCases.css'; // Import the CSS file

function AllCases() {
  const [cases, setCases] = useState([]);

  useEffect(() => {
    const fetchCases = async () => {
      try {
        const casesCollection = collection(db, "cases");
        const querySnapshot = await getDocs(casesCollection);
        if (!querySnapshot.empty) {
          const casesData = [];
          for (const doc of querySnapshot.docs) {
            const caseData = doc.data();
            if (caseData.files) { // Add a null check for caseData.files
              const filesData = await Promise.all(caseData.files.map(async (filePath) => {
                const fileRef = ref(storage, filePath);
                const downloadURL = await getDownloadURL(fileRef);
                return { filePath, downloadURL };
              }));
              caseData.files = filesData;
            } else {
              caseData.files = []; // Set files to an empty array if undefined
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
  }, []);

  return (
    <div>
      <h2>All Cases</h2>
      {cases.map((caseItem) => (
        <div className="case-container" key={caseItem.id}>
          <h3 className="case-title">{caseItem.caseTitle}</h3>
          <p className="case-description">Description: {caseItem.caseDescription}</p>
          <div className="case-details">
            <p>Type: {caseItem.caseType}</p>
            <p>Assignee: {caseItem.caseAssignee}</p>
            <p>Filing Date: {new Date(caseItem.filingDateTime).toLocaleString()}</p>
          </div>
          <h4>Files:</h4>
          <ul className="files-list">
            {caseItem.files && caseItem.files.map((file) => ( // Add a conditional check for caseItem.files
              <li className="file-item" key={file.filePath}>
                <a className="file-link" href={file.downloadURL} target="_blank" rel="noopener noreferrer">{file.filePath}</a>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

export default AllCases;
