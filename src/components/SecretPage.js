import React from 'react';
import { Link } from 'react-router-dom';
import '../css/SecretPage.css'; // Import CSS module

const SecretPage = () => {
  return (
    <div className="secretPageContainer">
      <div className="secretPageContent">
        <h1 className="secretPageTitle">Secret Page</h1>
        <p className="secretPageDescription">leavemealone? no one is here to save you!</p>
        <Link to="/MainPage" className="secretPageButton">
          Leave
        </Link>
        {/* Hidden text */}
        <p className="hiddenText">vandumurugan:vandu</p>
      </div>
    </div>
  );
};

export default SecretPage;
