
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBXcUkNXWKjvdqYlbokRtrVXbcyp7nQi68",
  authDomain: "ecommerce-3bb39.firebaseapp.com",
  projectId: "ecommerce-3bb39",
  storageBucket: "ecommerce-3bb39.firebasestorage.app",
  messagingSenderId: "268961320360",
  appId: "1:268961320360:web:cd541f2776bdab2535619d"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
