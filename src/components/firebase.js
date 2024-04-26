// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {getFirestore} from '@firebase/firestore';
import { getStorage } from 'firebase/storage';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAJ_7x-JBoHEKzApLzd-bt_ttE29v09dG8",
  authDomain: "casehearingmgmt.firebaseapp.com",
  projectId: "casehearingmgmt",
  storageBucket: "casehearingmgmt.appspot.com",
  messagingSenderId: "260414035730",
  appId: "1:260414035730:web:a81331f40b07151ed4c5cb",
  measurementId: "G-V7SX1J90QF"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

//connect to db firebase
export  { db, storage };

