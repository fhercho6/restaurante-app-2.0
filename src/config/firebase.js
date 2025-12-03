// src/config/firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// 1. TUS LLAVES DIRECTAS (Así no dependen de archivos externos)
const firebaseConfig = {
  apiKey: "AIzaSyD7ANLTfh0iynGFGENbmsDn1kaRc_f5mDc",
  authDomain: "sistemazzif.firebaseapp.com",
  projectId: "sistemazzif",
  storageBucket: "sistemazzif.firebasestorage.app",
  messagingSenderId: "949251389828",
  appId: "1:949251389828:web:b0d39bddc3b8bb3ffa05d1"
};

// 2. CONFIGURACIÓN
export const isPersonalProject = true; 
export const ROOT_COLLECTION = ''; 
export const defaultAppId = 'default-app-id';

// 3. INICIALIZACIÓN
let app, auth, db;

try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
} catch (e) {
  console.error("Error Firebase:", e);
}

export { app, auth, db, firebaseConfig };