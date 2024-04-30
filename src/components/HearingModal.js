// HearingModal.js

import React, { useState } from 'react';

function HearingModal({ isOpen, onClose, onSend }) {
  const [hearingDetails, setHearingDetails] = useState('');

  const handleSend = () => {
    // Send hearing details to the respective username
    onSend(hearingDetails);
    // Reset input field
    setHearingDetails('');
    // Close the modal
    onClose();
  };

  return (
    <div className={`modal ${isOpen ? 'open' : ''}`}>
      <div className="modal-content">
        <span className="close" onClick={onClose}>&times;</span>
        <h2>Add Hearing Details</h2>
        <textarea value={hearingDetails} onChange={(e) => setHearingDetails(e.target.value)} />
        <button onClick={handleSend}>Send</button>
      </div>
    </div>
  );
}

export default HearingModal;
