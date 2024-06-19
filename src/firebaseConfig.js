// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAcZjxtVxKuaNoeClWKeh8Luk8g2NMjhZ8",
  authDomain: "jsprep-ed0c8.firebaseapp.com",
  projectId: "jsprep-ed0c8",
  storageBucket: "jsprep-ed0c8.appspot.com",
  messagingSenderId: "468010744164",
  appId: "1:468010744164:web:bd33dbd91caf136818a271",
  measurementId: "G-X8SDKV7FCZ"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);