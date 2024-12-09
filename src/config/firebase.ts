// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDFnlGreMrYrFiqo3q_-SVY-4_Qqx7YDzk",
  authDomain: "web-project-supplier.firebaseapp.com",
  projectId: "web-project-supplier",
  storageBucket: "web-project-supplier.firebasestorage.app",
  messagingSenderId: "526597372041",
  appId: "1:526597372041:web:0e3922e443bf27bfc8ae58",
  measurementId: "G-Y9PSZQY3GT"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);