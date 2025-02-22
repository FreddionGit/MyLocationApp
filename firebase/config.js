import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";



const firebaseConfig = {
  apiKey: "AIzaSyAEVWmc820z0BbFWorj7UQXVEz3ePQeolg",
  authDomain: "mylocationapp-83df5.firebaseapp.com",
  projectId: "mylocationapp-83df5",
  storageBucket: "mylocationapp-83df5.firebasestorage.app",
  messagingSenderId: "812512527953",
  appId: "1:812512527953:web:9f45449f7ca391fd2c9a70",
};

// Firebase initialisieren
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth };
