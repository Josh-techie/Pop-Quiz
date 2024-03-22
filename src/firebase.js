// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDjqoaal56HPf6OHLICHEW7bUzRsHL79Dc",
  authDomain: "pop-quiz-59c13.firebaseapp.com",
  projectId: "pop-quiz-59c13",
  storageBucket: "pop-quiz-59c13.appspot.com",
  messagingSenderId: "197126569707",
  appId: "1:197126569707:web:5d0c38f1b7402684eec8ae",
  measurementId: "G-RMB663F6GX",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

export { auth };