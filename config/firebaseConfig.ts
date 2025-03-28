// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAxqGrzReNB0BOYhFW-it6AbMFshkxuMrY",
  authDomain: "iot-gps-app.firebaseapp.com",
  databaseURL: "https://iot-gps-app-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "iot-gps-app",
  storageBucket: "iot-gps-app.firebasestorage.app",
  messagingSenderId: "439964943303",
  appId: "1:439964943303:web:2e72a85c628a6333a14fe2",
  measurementId: "G-KRPFW927BR"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

export { database }