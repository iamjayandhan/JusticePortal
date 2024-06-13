import React, { useState } from 'react';
import { useForm, ValidationError } from '@formspree/react';
import '../css/ContactForm.css';

function ContactForm() {
  const [showModal, setShowModal] = useState(false);
  const [state, handleSubmit] = useForm("xayzekok");

  const handleFormSubmit = async (event) => {
    event.preventDefault(); // Prevent default form submission

    await handleSubmit(event); // Call handleSubmit and await its result
    // If form submission is successful, show modal
    setShowModal(true); // Show modal

  };

  const closeModal = () => {
    setShowModal(false); // Close modal
    // Route to main page after closing the modal
    window.location.href = '/mainpage';
  };

  return (
    <>
      <h2 style={{ color: '#fff' }}>CONTACT</h2>

      <div className="form-container">
        <form onSubmit={handleFormSubmit}>
          <label htmlFor="email">
            Email Address
          </label>
          <input
            id="email"
            type="email" 
            name="email"
            required
          />
          <ValidationError 
            prefix="Email" 
            field="email"
            errors={state.errors}
            className="error-message"
          />
          <label htmlFor="message">Message</label>
          <textarea
            id="message"
            name="message"
            required  
          />
          <ValidationError 
            prefix="Message" 
            field="message"
            errors={state.errors}
            className="error-message"
          />
          <button type="submit" disabled={state.submitting}>
            Submit
          </button>
        </form>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal">
          <div className="modal-content">
            <span className="close" onClick={closeModal}>&times;</span>
            <h3>Thank You!</h3>
            <p>Your message has been submitted successfully.</p>
            <button onClick={closeModal}>Close</button>
          </div>
        </div>
      )}
          <div class="page-footer" style={{ backgroundColor: '#000000' }}>
        <h7 className="msg">"Get in touch with us for any inquiries or assistance."</h7>
      </div>
    </>
  );
}

export default ContactForm;
