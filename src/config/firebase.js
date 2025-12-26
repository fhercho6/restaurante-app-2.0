import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage'; // [ADDED]

// 1. TUS LLAVES (Seguras en .env)
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: 'sistemazzif.firebasestorage.app', // Correct bucket from screenshot
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// 2. CONFIGURACIÓN
export const isPersonalProject = true;
export const ROOT_COLLECTION = '';
export const defaultAppId = 'default-app-id';

// 3. INICIALIZACIÓN
let app, auth, db, storage;

try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
  storage = getStorage(app); // [ADDED]
} catch (e) {
  console.error("Error Firebase:", e);
}

export { app, auth, db, storage, firebaseConfig };