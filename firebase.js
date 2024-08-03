// firebase.js
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, deleteDoc, doc, getDocs, setDoc } from 'firebase/firestore';

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBNK_00URoXjlag0_iU2pJ5TULf2tElUuw",
    authDomain: "pantrypal-ddda7.firebaseapp.com",
    projectId: "pantrypal-ddda7",
    storageBucket: "pantrypal-ddda7.appspot.com",
    messagingSenderId: "361193815972",
    appId: "1:361193815972:web:e258883952d9a2fcfa0b31",
    measurementId: "G-3TFPLPHR14"
  };

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app); // Get Firestore instance

// Export Firestore functions and the database instance
export {firestore, collection, addDoc, deleteDoc, doc, getDocs, setDoc };
