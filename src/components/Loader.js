import React, { useEffect, useState } from 'react';
import '../css/Loader.css'; // Make sure to create this CSS file
import logo from '../components/Assets/law.png'; // Adjust the path according to your project structure

const Loader = () => {
  const [loading, setLoading] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setFadeOut(true);
      setTimeout(() => {
        setLoading(false);
      }, 1000); // Duration of the fade-out transition
    }, 2000); // Show loader for 5 seconds

    return () => clearTimeout(timer);
  }, []);

  if (!loading) {
    return null;
  }

  return (
    <div className={`loader ${fadeOut ? 'fade-out' : ''}`}>
      <img src={logo} alt="App Logo" className="loader-logo" />
      <div className="spinner"></div>
    </div>
  );
};

export default Loader;
