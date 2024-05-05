import React, { useState, useEffect } from 'react';
import { db } from './firebase'; // Import the Firestore database instance
import { collection, getDocs, where, query ,addDoc} from 'firebase/firestore';
import Cookies from 'js-cookie';
import '../css/ClientRequests.css';

function ClientRequests() {
  const [selectedCase, setSelectedCase] = useState('');
  const [selectedCaseTitle, setSelectedCaseTitle] = useState('');
  const [requestMessage, setRequestMessage] = useState('');
  const [lawyersList, setLawyersList] = useState([]);
  const [selectedLawyer, setSelectedLawyer] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false); // Initialize as false
  const [loggedInUsername, setLoggedInUsername] = useState('');
  const [clientCases, setClientCases] = useState([]); // State to store client's cases

  useEffect(() => {
    const fetchLawyers = async () => {
      try {
        const lawyersCollection = collection(db, 'users');
        const querySnapshot = await getDocs(lawyersCollection);
        if (!querySnapshot.empty) {
          const lawyersData = [];
          querySnapshot.forEach((doc) => {
            const userData = doc.data();
            if (userData.role === 'Lawyers/Attorneys') {
              lawyersData.push(userData.username);
            }
          });
          setLawyersList(lawyersData);
        } else {
          console.log('No lawyers found.');
        }
      } catch (error) {
        console.error('Error fetching lawyers:', error);
      }
    };

    const username = Cookies.get('username');
    if (username) {
      setIsLoggedIn(true); // If username exists in cookies, set isLoggedIn to true
      setLoggedInUsername(username);
      fetchClientCases(username); // Fetch client's cases when username is available
    }

    fetchLawyers();
  }, []);

  const fetchClientCases = async (username) => {
    try {
      const casesCollection = collection(db, 'cases');
      const q = query(casesCollection, where('username', '==', username));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const casesData = [];
        querySnapshot.forEach((doc) => {
          const caseData = doc.data();
          casesData.push({ id: doc.id, ...caseData });
        });
        setClientCases(casesData); // Set client's cases in state
      } else {
        console.log('No cases found for the client.');
      }
    } catch (error) {
      console.error('Error fetching client cases:', error);
    }
  };

  const handleSendRequest = async () => {
    try {
      const request = {
        caseId: selectedCase,
        caseTitle: selectedCaseTitle,
        message: requestMessage,
        username: selectedLawyer,
        from: loggedInUsername,
        timestamp: new Date()
      };
      const requestsCollection = collection(db, 'requests');
      await addDoc(requestsCollection, request);
      console.log('Request sent successfully:', request);
      // Optionally, you can reset the form fields after sending the request
      setSelectedCase('');
      setRequestMessage('');
      setSelectedLawyer('');
    } catch (error) {
      console.error('Error sending request:', error);
    }
  };

  return (
    <div className="client-requests-container">
      <h2>Make Request to Lawyer</h2>
      {isLoggedIn ? (
        <div className="request-form">
          <div className="input-field">
  <label htmlFor="case-dropdown">Choose Case:</label>
  <select id="case-dropdown" value={selectedCase} onChange={(e) => {
    setSelectedCase(e.target.value);
    const selectedTitle = clientCases.find(caseItem => caseItem.id === e.target.value)?.caseTitle;
    setSelectedCaseTitle(selectedTitle || ''); // Update selectedCaseTitle based on selectedCase
  }}>
    <option value="">Select a Case</option>
    {clientCases.map((caseItem) => (
      <option key={caseItem.id} value={caseItem.id}>{caseItem.caseTitle}</option>
    ))}
  </select>
</div>

          <div className="input-field">
          <label htmlFor="request-message">Request Message:</label>
          <textarea
            id="request-message"
            value={requestMessage}
            onChange={(e) => setRequestMessage(e.target.value)}
            style={{ width: '93%' }} // Adjust the width inline
          />
        </div>
          <div className="input-field">
            <label htmlFor="lawyers-list">Select Lawyer:</label>
            <select id="lawyers-list" value={selectedLawyer} onChange={(e) => setSelectedLawyer(e.target.value)}>
              <option value="">Select a Lawyer</option>
              {lawyersList.map((lawyer, index) => (
                <option key={index} value={lawyer}>{lawyer}</option>
              ))}
            </select>
          </div>
          <div className="buttons">
            <button className={(!selectedCase || !requestMessage || !selectedLawyer) ? "disabled" : ""} disabled={!selectedCase || !requestMessage || !selectedLawyer} onClick={handleSendRequest}>
              {(!selectedCase || !requestMessage || !selectedLawyer) ? "Please fill out all fields" : "Send"}
            </button>
            <button onClick={() => window.location.reload()}>Cancel</button>
          </div>
        </div>
      ) : (
        <p>Please log in to make a request.</p>
      )}
    </div>
  );
  
  
  
}

export default ClientRequests;
