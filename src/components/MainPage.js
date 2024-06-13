import React, { useState, useEffect } from 'react';
import '../css/MainPage.css';
import court1 from './Assets/bans2.png';
import court2 from './Assets/bans1.png';
import court3 from './Assets/bans8.png';
import Cookies from 'js-cookie';
import image1 from './Assets/supreme.png';
import image2 from './Assets/Lawyer-bro.png';
import focusImg from './Assets/Judge-bro.png'

function MainPage() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [username, setUsername] = useState('');
  const slides = [court1, court2, court3];

  useEffect(() => {
    const user = Cookies.get('username'); // Assuming the cookie name is 'username'
    if (user) {
      setUsername(user);
    }
  }, []);

  // Function to handle next slide
  const nextSlide = () => {
    setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  };

  useEffect(() => {
    // Automatically move to the next slide every 4 seconds
    const interval = setInterval(nextSlide, 4000);

    // Clear the interval on component unmount to prevent memory leaks
    return () => clearInterval(interval);
  }, [currentSlide]); // Include currentSlide in the dependency array to update the interval when the slide changes

  const handlePrev = () => {
    setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className='mainpage-container'>
      {/* <header className='mainpage-header'> */}
        {/* <div className='carousel' style={{ transform: `translateX(-${currentSlide * 100}%)` }}>
          {slides.map((slide, index) => (
            <div className='carousel-slide' key={index}>
              <img src={slide} alt={`Justice Portal Banner ${index + 1}`} />
            </div>
          ))}
        </div>
        <button className='carousel-button prev' onClick={handlePrev}>‹</button>
        <button className='carousel-button next' onClick={handleNext}>›</button> */}
       
      {/* </header> */}
      <div className='focus-img'>
              <img src={focusImg} alt='' className='mission-image-img' />
            </div>
      
      <div className="first-container">
        <h1 className='greet'>Hello {username}!</h1>
        <h1 className='main-title'>The Realm of Justice</h1>
        <div>
          <p className='main-description'>
            <strong>Enter the Realm of Justice</strong>, where legal efficiency meets technological innovation. <br />Our platform revolutionizes case management processes by providing a centralized hub for seamless scheduling, real-time tracking, and comprehensive monitoring of various types of cases across diverse legal domains.
          </p>
          <p className='main-description'>
            Join us in our <strong>mission to enhance the efficiency and effectiveness of judicial proceedings</strong> while upholding the principles of fairness and access to justice for all. Together, let's shape the future of legal practice.
          </p>
        </div>
      </div>

      <div className="second-container">
        <section className='features-section'>
        <div className='focus-img'>
              <img src={image1} alt='' className='mission-image-img' />
            </div>
          <h2 className='section-title'>OUR KEY FEATURES</h2>
          <div className='features-list'>
            <div className='feature-item'>Automated Case Management</div>
            <div className='feature-item'>Advanced Analytics Dashboard</div>
            <div className='feature-item'>Integrated Document Management</div>
            <div className='feature-item'>Secure Communication Channels</div>
            <div className='feature-item'>Customizable User Permissions</div>
          </div>
        </section>
      </div>

      <div className="last-container">
        <section className='mission-section'>
        <div className='focus-img'>
              <img src={image2} alt='' className='mission-image-img' />
            </div>
          <h2 className='section-title'>OUR MISSION</h2>
          <p className='mission-description'>
            Our mission is to enhance the efficiency and effectiveness of judicial proceedings while upholding the principles of fairness and access to justice for all.
          </p>
        </section>
      </div>

      <div className='footer' style={{backgroundColor:'#000000',padding:0}}>
        <div className='footer-content'>
          <p>What? look around, found something?</p>
        </div>
      </div>
    </div>
  );
}

export default MainPage;
