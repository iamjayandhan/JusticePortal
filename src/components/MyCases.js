import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, doc, deleteDoc } from 'firebase/firestore';
import { db } from './firebase';
import Cookies from 'js-cookie';
import { Link } from 'react-router-dom';

const MyCases = () => {
  const [cases, setCases] = useState([]);
  const username = Cookies.get('username');

  useEffect(() => {
    if (username) {
      const fetchUserCases = async () => {
        try {
          const casesCollectionRef = collection(db, 'cases');
          const userCasesQuery = query(casesCollectionRef, where('loggedin', '==', username));
          const querySnapshot = await getDocs(userCasesQuery);

          const userCases = [];
          querySnapshot.forEach((doc) => {
            userCases.push({ id: doc.id, ...doc.data() });
          });

          setCases(userCases);
        } catch (error) {
          console.error('Error fetching user cases:', error);
        }
      };

      fetchUserCases();
    }
  }, [username]);

  const handleDeleteCase = async (caseId) => {
    const confirmation = window.confirm('Are you sure you want to delete this case?');

    if (confirmation) {
      try {
        const caseDocRef = doc(db, 'cases', caseId);
        await deleteDoc(caseDocRef);

        setCases((cases) => cases.filter((singleCase) => singleCase.id !== caseId));
      } catch (error) {
        console.error('Error deleting case:', error);
      }
    }
  };

  return (
    <div>
      <h1>My Cases for {username}</h1>
      <ul>
        {cases.map((singleCase) => (
          <li key={singleCase.id}>
            <strong>{singleCase.title}</strong>
            <p>{singleCase.description}</p>
            <button onClick={() => handleDeleteCase(singleCase.id)}>Delete</button>
          </li>
        ))}
      </ul>
      <Link to="/MainPage">
        <button>Back</button>
      </Link>
    </div>
  );
};

export default MyCases;
