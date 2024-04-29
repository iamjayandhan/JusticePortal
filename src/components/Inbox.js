import React, { useState, useEffect } from 'react';
import { db, storage } from './firebase'; // Import the Firestore database instance and Firebase storage instance
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { ref, getDownloadURL } from 'firebase/storage'; // Import the necessary storage functions
import Cookies from 'js-cookie';
import '../css/Inbox.css';

function Inbox() {
  const [messages, setMessages] = useState([]);
  const [loggedInUsername, setLoggedInUsername] = useState('');

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
              if (messageData.username === cookieUsername || messageData.caseAssignee === cookieUsername) {
                const caseId = messageData.caseDetails.id;
                const caseDocRef = doc(db, 'cases', caseId); // Reference to the case document
                const caseDocSnapshot = await getDoc(caseDocRef);
                const caseDetails = caseDocSnapshot.data(); // Retrieve case details from the document snapshot
                const caseFiles = [];
                if (caseDetails.files && caseDetails.files.length > 0) {
                  // Fetch download URL for each file
                  for (const filePath of caseDetails.files) {
                    const fileRef = ref(storage, filePath);
                    const downloadURL = await getDownloadURL(fileRef);
                    caseFiles.push({ filePath, downloadURL });
                  }
                }
                caseDetails.files = caseFiles; // Assign files to caseDetails object
                messagesData.push({ id: docSnapshot.id, ...messageData, caseDetails });
              }
            }
            setMessages(messagesData);
          } else {
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

  return (
    <div className="inbox-container">
      <h2>Inbox</h2>
      {messages.map((message) => (
        <div className="message" key={message.id}>
          <div className="message-header">
            <p className="message-sender">From: {message.username}</p>
            <p className="message-timestamp">Received: {message.timestamp ? new Date(message.timestamp.toDate()).toLocaleString() : 'Unknown'}</p>
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
            </div>
          )}
        </div>
      ))}
    </div>
  );

   // Function to extract file name from file path
   function getFileName(filePath) {
    // Split the file path by '/'
    const parts = filePath.split('/');
    // Get the last part (the file name)
    return parts[parts.length - 1];
  }
}

export default Inbox;
