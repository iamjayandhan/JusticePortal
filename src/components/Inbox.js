import React, { useState, useEffect } from 'react';
import { db, storage } from './firebase'; // Import the Firestore database instance and Firebase storage instance
import { collection, getDocs, doc, setDoc, getDoc, addDoc, query, where } from 'firebase/firestore';
import { ref, getDownloadURL } from 'firebase/storage'; // Import the necessary storage functions
import Cookies from 'js-cookie';
import '../css/Inbox.css';

function Inbox() {
  const [messages, setMessages] = useState([]);
  const [loggedInUsername, setLoggedInUsername] = useState('');
  const [selectedCaseId, setSelectedCaseId] = useState(null);
  const [selectedCaseDetails, setSelectedCaseDetails] = useState(null); // New state variable
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [hearingDetails, setHearingDetails] = useState('');

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const cookieUsername = Cookies.get('username');
        console.log("Retrieved username from cookies:", cookieUsername);
        if (cookieUsername) {
          setLoggedInUsername(cookieUsername);
          const messagesCollection = collection(db, 'messages');
const querySnapshot = await getDocs(messagesCollection);
if (!querySnapshot.empty) {
  const messagesData = [];
  for (const docSnapshot of querySnapshot.docs) {
    const messageData = docSnapshot.data();
    console.log("Message data:", messageData);
    if (messageData.username === cookieUsername) {
      const caseDetails = messageData.caseDetails || {};
      const caseId = caseDetails.id || null;
      if (caseId) {
        const caseDocRef = doc(db, 'cases', caseId);
        const caseDocSnapshot = await getDoc(caseDocRef);
        const caseDetailsData = caseDocSnapshot.data();
        const caseFiles = [];
        if (caseDetailsData.files && caseDetailsData.files.length > 0) {
          for (const filePath of caseDetailsData.files) {
            const fileRef = ref(storage, filePath);
            const downloadURL = await getDownloadURL(fileRef); // Potential source of error
            caseFiles.push({ filePath, downloadURL });
          }
        }
        caseDetailsData.files = caseFiles;
        messagesData.push({ id: docSnapshot.id, ...messageData, caseDetails: caseDetailsData });
      } else {
        messagesData.push({ id: docSnapshot.id, ...messageData });
      }
    }
  }
  setMessages(messagesData);
}
 else {
            console.log("No messages found.");
          }
        } else {
          console.log("No username found in cookies.");
        }
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    };
    
    

    fetchMessages();
  }, []);

  const handleAddHearing = (caseId, caseDetails) => {
    setSelectedCaseId(caseId);
    setSelectedCaseDetails(caseDetails); // Store selected case details
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedCaseId(null);
    setHearingDetails('');
  };

  const handleSendHearing = async () => {
    console.log("hearingDetails:", hearingDetails);
    console.log("selectedCaseDetails:", selectedCaseDetails);
  
    if (!hearingDetails || !selectedCaseDetails) {
      console.log("Missing required data. Cannot send hearing details.");
      return;
    }
  
    const { username, caseTitle } = selectedCaseDetails;
    console.log("Recipient username:", username);
    console.log("Case title:", caseTitle);
  
    try {
      const caseDocRef = collection(db, 'cases');
      const querySnapshot = await getDocs(query(caseDocRef, where('caseTitle', '==', caseTitle), where('username', '==', username)));
      if (!querySnapshot.empty) {
        const caseDoc = querySnapshot.docs[0];
        await setDoc(caseDoc.ref, { hearingDetails }, { merge: true });
        console.log("Hearing details saved to case document.");
  
        const newMessage = {
          sender: loggedInUsername,
          username: username,
          hearingDetails: hearingDetails,
          timestamp: new Date()
        };
        console.log("New message:", newMessage);
  
        const messagesCollectionRef = collection(db, 'messages');
        await addDoc(messagesCollectionRef, newMessage);
        console.log("Message sent to recipient.");
  
        handleCloseModal();
      } else {
        console.log("No case found with title:", caseTitle, "and username:", username);
      }
    } catch (error) {
      console.error("Error sending hearing details:", error);
    }
  };
  
  
  

  return (
    <div className="inbox-container">
      <h2>Inbox</h2>
      {messages.map((message) => (
        <div className="message" key={message.id}>
        <div className="message-header">
          <div className="message-info">
            <p className="message-sender">From: {message.sender}</p>
            <p className="message-hearing">Hearing Details: {message.hearingDetails}</p>
            <p className="message-timestamp">Received: {message.timestamp ? new Date(message.timestamp.toDate()).toLocaleString() : 'Unknown'}</p>
          </div>
        </div>
          {message.caseDetails && (
            <div className="message-details">
              <p>Case Title: {message.caseDetails.caseTitle}</p>
              <p>Case Assignee: {message.caseDetails.caseAssignee}</p>
              <p>Case Type: {message.caseDetails.caseType}</p>
              <p>Case Description: {message.caseDetails.caseDescription}</p>
              <p>Filing Date: {message.caseDetails.filingDateTime}</p>
              <p>Username: {message.caseDetails.username}</p>
              {message.caseDetails.files && (
                <div className="file-links">
                  <p>Files:</p>
                  <ul>
                    {message.caseDetails.files.map((file, index) => (
                      <li key={index}>
                        <a href={file.downloadURL} target="_blank" rel="noopener noreferrer">
                          File {index + 1}: {getFileName(file.filePath)}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <button onClick={() => handleAddHearing(message.caseDetails.id, message.caseDetails)}>Add Hearing Details</button>
            </div>
          )}
        </div>
      ))}
      {isModalOpen && (
        <div className="modal">
          <div className="modal-content">
            <span className="close" onClick={handleCloseModal}>&times;</span>
            <h3>Add Hearing Details</h3>
            <textarea
              value={hearingDetails}
              onChange={(e) => setHearingDetails(e.target.value)}
              placeholder="Enter hearing details..."
            ></textarea>
            <button onClick={() => handleSendHearing(selectedCaseId, selectedCaseDetails)}>Send</button>
          </div>
        </div>
      )}
    </div>
  );

  function getFileName(filePath) {
    const parts = filePath.split('/');
    return parts[parts.length - 1];
  }
}

export default Inbox;
