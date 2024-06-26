import React, { useState, useEffect } from 'react';
import { db, storage } from './firebase'; // Import the Firestore database instance and Firebase storage instance
import { collection, getDocs, addDoc, deleteDoc, getDoc, doc, query, where } from 'firebase/firestore';
import { ref, getDownloadURL } from 'firebase/storage'; // Import the necessary storage functions
import Cookies from 'js-cookie';
import '../css/Inbox.css';
import { Snackbar } from '@mui/material'; // Import the Snackbar component
import axios from 'axios';

function Inbox() {
  const [messages, setMessages] = useState([]);
  const [loggedInUsername, setLoggedInUsername] = useState('');
  const [selectedCaseId, setSelectedCaseId] = useState(null);
  const [selectedCaseDetails, setSelectedCaseDetails] = useState(null); // New state variable
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [hearingDetails, setHearingDetails] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false); // State for Snackbar visibility
  const [snackbarMessage, setSnackbarMessage] = useState(''); // State for Snackbar message
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [messageToDelete, setMessageToDelete] = useState(null);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const cookieUsername = Cookies.get('username');
        console.log("Retrieved username from cookies:", cookieUsername);
        
        if (cookieUsername) {
          setLoggedInUsername(cookieUsername);
      
          const messagesCollection = collection(db, 'messages');
          const requestsCollection = collection(db, 'requests');
      
          const messagesSnapshot = await getDocs(messagesCollection);
          const requestsSnapshot = await getDocs(query(requestsCollection, where('username', '==', cookieUsername)));
      
          const messagesData = [];
      
          // Fetch and process messages from the 'messages' collection
          for (const doc of messagesSnapshot.docs) {
            const messageData = doc.data();
            console.log("Messages data:", messagesData);

            // If the message is addressed to the current user, process it
            if (messageData.username === cookieUsername) {
              if (messageData.type === 'case') { // Check if the message is of type 'case'
                const caseDetailsData = messageData.caseDetails;
                const caseFiles = [];
                if (caseDetailsData.files && caseDetailsData.files.length > 0) {
                  for (const filePath of caseDetailsData.files) {
                    const fileRef = ref(storage, filePath);
                    try {
                      const downloadURL = await getDownloadURL(fileRef);
                      caseFiles.push({ filePath, downloadURL });
                    } catch (error) {
                      console.error("Error downloading file:", error);
                    }
                  }
                }
                // Push the message with case details to messagesData
                messagesData.push({ id: doc.id, ...messageData, caseDetails: { ...caseDetailsData, files: caseFiles } });
              } else { // Handle other message types
                messagesData.push({ id: doc.id, ...messageData });
              }
            }
          }
      
          // Fetch and process messages from the 'requests' collection
          requestsSnapshot.forEach((doc) => {
            const requestData = doc.data();
            messagesData.push({ id: doc.id, ...requestData, type: 'reqMsg' });
          });
      
          // Sort messages by timestamp
          messagesData.sort((a, b) => {
            const timestampA = parseTimestamp(a.timestamp);
            const timestampB = parseTimestamp(b.timestamp);
            return timestampB - timestampA;
          });
      
          setMessages(messagesData);
        } else {
          console.log("No username found in cookies.");
        }
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    };

    fetchMessages();
  }, []);

  const parseTimestamp = (timestamp) => {
    if (!timestamp) return new Date(0); // Default to epoch if no timestamp
    if (timestamp instanceof Date) {
      return timestamp;
    } else if (timestamp.toDate) {
      return timestamp.toDate();
    } else if (typeof timestamp === 'string') {
      return new Date(timestamp);
    }
    return new Date(0); // Default to epoch if no valid timestamp
  };

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
  
    const { username, caseTitle, email } = selectedCaseDetails;
    console.log("Recipient username:", username);
    console.log("Case title:", caseTitle);
    console.log("Email:", email);
  
    try {
      const newMessage = {
        sender: loggedInUsername,
        username: username,
        hearingDetails: hearingDetails,
        type: "hearingMsg",
        email: email,
        caseTitle: caseTitle,
        timestamp: new Date()
      };
      console.log("New message:", newMessage);
      
      const messagesCollectionRef = collection(db, 'messages');
      await addDoc(messagesCollectionRef, newMessage);
      console.log("Message sent to recipient.");

      const body = {
        name: username,
        intro: `The case title is: ${caseTitle},\nLawyer: ${loggedInUsername}.\nYour hearing details are: ${hearingDetails}.`,
        outro: "Thank you for choosing Justice Portal. We are dedicated to serving you and ensuring your legal needs are met with professionalism and care."
      };

      // After successful registration, send user's email to the server
      axios.post('https://justice-portal-server.vercel.app/api/submit/message', { userEmail: email, userName: username, mailBody: body, subject: "Case hearing information" })
        .then(response => {
          console.log('Response:', response.data); // Log the response data
          // Handle response
        })
        .catch(error => {
          console.error('Error during registration:', error);
          // Handle error
        });

      setSnackbarMessage('Message sent to recipient!');
      setSnackbarOpen(true);

      setTimeout(() => {
        setSnackbarMessage("You may close the case anytime.");
        setSnackbarOpen(true);
      }, 4000); 
  
      handleCloseModal();
    } catch (error) {
      console.error("Error sending hearing details:", error);
    }
  };

  const handleOpenDeleteModal = (message) => {
    setMessageToDelete(message);
    setIsDeleteModalOpen(true);
  };

  const handleCloseDeleteModal = () => {
    setMessageToDelete(null);
    setIsDeleteModalOpen(false);
  };

  const handleConfirmDelete = async () => {
    if (!messageToDelete) return;

    const { id, type } = messageToDelete;

    try {
      const collectionName = type === 'reqMsg' ? 'requests' : 'messages';
      const messageRef = doc(db, collectionName, id);
      const messageSnapshot = await getDoc(messageRef);
      const messageData = messageSnapshot.data();

      await deleteDoc(messageRef);
      console.log("Message deleted from", collectionName);

      // Update the state to remove the deleted message
      setMessages((prevMessages) => prevMessages.filter(message => message.id !== id));
      
      setSnackbarMessage('Message deleted successfully!');
      setSnackbarOpen(true);

      // Log deletion in the 'log' collection
      const logEntry = {
        message: `Message with ID ${id} deleted from ${collectionName} collection.`,
        deletionTimestamp: new Date(),
        deletedBy: Cookies.get('username'), // Get lawyer name from cookie
        messageType: type,
        messageData: messageData // Include message data if needed
      };
      const logCollectionRef = collection(db, 'log');
      await addDoc(logCollectionRef, logEntry);

      handleCloseDeleteModal();
    } catch (error) {
      console.error("Error deleting message:", error);
    }
  };

  return (
    <div className="inbox-container">
      <div className="inbox-heading">
        <h2 style={{ color: '#fff' }}>INBOX</h2>
      </div>
      
    {messages.length === 0 ? (
      <p style={{color:'#fff', textAlign:'center',paddingTop:'200px'}}>No messages found.</p>
    ) : (
      messages.map((message) => (
        <div className={`message ${getMessageTypeColor(message.type)}`} key={message.id}>
          {message.type === "reqMsg" && (
            <>
              {message.type && (
                <p className="message-sender"><b>Type:👁️‍🗨️</b>{message.type}</p>
              )}
              {message.from && (
                <p className="message-sender"><b>From: 👤</b>{message.from}</p>
              )}
              {message.caseTitle && (
                <p className="message-details"><b>Case Title:</b> {message.caseTitle}</p>
              )}
              {message.message && (
                <p className="message-details"><b>Message:</b> {message.message}</p>
              )}
              {message.timestamp && (
                <p className="message-timestamp"><b>Received:</b> {message.timestamp ? parseTimestamp(message.timestamp).toLocaleString() : ''}</p>
              )}
            </>
          )}
          {message.type === "hearingMsg" && (
            <>
              {message.type && (
                <p className="message-sender"><b>Type:👁️‍🗨️</b>{message.type}</p>
              )}
              {message.sender && (
                <p className="message-sender"><b>From:👤</b>{message.sender}</p>
              )}
              {message.caseTitle && (
                <p className="message-sender"><b>Case:</b> {message.caseTitle}</p>
              )}
              {message.hearingDetails && (
                <p className="message-details"><b>Hearing Details:</b> {message.hearingDetails}</p>
              )}
              {message.timestamp && (
                <p className="message-timestamp"><b>Received:</b> {message.timestamp ? parseTimestamp(message.timestamp).toLocaleString() : ''}</p>
              )}
            </>
          )}
          {message.type === "caseTaken" && (
            <>
              {message.type && (
                <p className="message-sender"><b>Type:</b>👁️‍🗨️{message.type}</p>
              )}
              {message.caseDetails && (
                <div className="message-details">
                  <p><b>Title:</b> {message.caseDetails.caseTitle}</p>
                  <p><b>Assignee:</b>👤{message.caseDetails.caseAssignee}</p>
                  <p><b>Case Type:</b> {message.caseDetails.caseType}</p>
                  <p><b>Case Description:</b> {message.caseDetails.caseDescription}</p>
                  <p><b>Filing Date:</b> {message.caseDetails.filingDateTime}</p>
                  <p><b>Username:</b>👤{message.caseDetails.username}</p>
                  {message.caseDetails.files && (
                    <div className="file-links">
                      <p><b>Files:</b></p>
                      {message.caseDetails.files.map((file, index) => (
                        <p key={index}>
                          <a href={file.downloadURL} target="_blank" rel="noopener noreferrer">
                            File {index + 1}: {getFileName(file.filePath)}
                          </a>
                        </p>
                      ))}
                    </div>
                  )}
                  <button className='addhear-bn' onClick={() => handleAddHearing(message.caseDetails.id, message.caseDetails)}>Add Hearing Details</button>
                </div>
              )}
            </>
          )}
          <button className='inbox-bn' onClick={() => handleOpenDeleteModal(message)}>Delete</button>
        </div>
      ))
    )}

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
            <div className="modal-buttons">
              <button onClick={() => handleSendHearing(selectedCaseId, selectedCaseDetails)}>Send</button>
              <button onClick={handleCloseModal}>Back</button> {/* Back button */}
            </div>
          </div>
        </div>
      )}

      {isDeleteModalOpen && (
        <div className="modal">
          <div className="modal-content">
            <span className="close" onClick={handleCloseDeleteModal}>&times;</span>
            <h3>Confirm Deletion</h3>
            <p>Are you sure you want to delete this message?</p>
            <div className="modal-buttons">
              <button onClick={handleConfirmDelete}>Yes</button>
              <button onClick={handleCloseDeleteModal}>No</button>
            </div>
          </div>
        </div>
      )}

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000} // Adjust duration as needed
        onClose={() => setSnackbarOpen(false)}
        message={snackbarMessage}
      />
    </div>
  );

  function getFileName(filePath) {
    const parts = filePath.split('/');
    return parts[parts.length - 1];
  }

  function getMessageTypeColor(type) {
    switch (type) {
      case "reqMsg":
        return "req-message"; // Define your CSS class for reqMsg
      case "hearingMsg":
        return "hearing-message"; // Define your CSS class for hearingMsg
      case "caseTaken":
        return "case-taken-message"; // Define your CSS class for caseTaken
      default:
        return ""; // Default class if no type matches
    }
  }
}

export default Inbox;
