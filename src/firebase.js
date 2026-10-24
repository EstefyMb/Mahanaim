import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Las credenciales exactas de tu proyecto en Firebase
const firebaseConfig = {
  apiKey: "AizaSyB0uYWLlxYT6Ai6batEyacvZE5uD68vgug",
  authDomain: "alaba-22734.firebaseapp.com",
  projectId: "alaba-22734",
  storageBucket: "alaba-22734.firebasestorage.app",
  messagingSenderId: "791761039571",
  appId: "1:791761039571:web:dd9221bb62d9dfda79a426",
  measurementId: "G-1GFH1BTB3F"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Exportar la base de datos Firestore
export const db = getFirestore(app);