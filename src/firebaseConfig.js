import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDwztCRbh_6Dz4bU8f6V_lgnZNLE9P9zT4",
    authDomain: "digitalownership-b2afe.firebaseapp.com",
    projectId: "digitalownership-b2afe",
    storageBucket: "digitalownership-b2afe.firebasestorage.app",
    messagingSenderId: "409306177453",
    appId: "1:409306177453:web:b082a1c48cf4f30a4e0b24"
  };

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const firestore = getFirestore(app);
const storage = getStorage(app);

export { auth, firestore, storage };
