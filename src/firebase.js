import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// Credenciales oficiales corregidas del proyecto Firebase
const firebaseConfig = {
  apiKey: "AIzaSyB0uYWLlxYT6Ai6batEyacvZE5uD68vgug",
  authDomain: "alaba-22734.firebaseapp.com",
  projectId: "alaba-22734",
  storageBucket: "alaba-22734.firebasestorage.app",
  messagingSenderId: "791761039571",
  appId: "1:791761039571:web:dd9221bb62d9dfda79a426",
  measurementId: "G-1GFH1BTB3F"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);
export default app;