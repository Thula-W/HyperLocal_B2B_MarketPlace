// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyA-bdPUKGGetNJsQZQPQ6DhjZjePzwhBtI",
  authDomain: "hyperlocal-b2b-marketplace.firebaseapp.com",
  projectId: "hyperlocal-b2b-marketplace",
  storageBucket: "hyperlocal-b2b-marketplace.firebasestorage.app",
  messagingSenderId: "712197159786",
  appId: "1:712197159786:web:8f7f694db53cbb4979c313",
  measurementId: "G-S1K425XX7F"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();