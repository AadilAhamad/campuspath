import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

interface FirebaseStatus {
  isConfigured: boolean;
  statusText: string;
  projectId?: string;
}

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || ''
};

const hasValidConfig = Boolean(
  firebaseConfig.apiKey && 
  firebaseConfig.projectId && 
  firebaseConfig.apiKey !== 'YOUR_API_KEY'
);

let app: any = null;
let authInstance: Auth | null = null;
let dbInstance: Firestore | null = null;

if (hasValidConfig) {
  try {
    app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
    authInstance = getAuth(app);
    dbInstance = getFirestore(app);
  } catch (err) {
    console.warn('Firebase initialization error, defaulting to local secure mode:', err);
  }
}

export const auth: Auth | null = authInstance;
export const db: Firestore | null = dbInstance;

export const getFirebaseStatus = (): FirebaseStatus => {
  if (hasValidConfig && authInstance && dbInstance) {
    return {
      isConfigured: true,
      statusText: `Connected to Cloud Project (${firebaseConfig.projectId})`,
      projectId: firebaseConfig.projectId
    };
  }
  return {
    isConfigured: false,
    statusText: 'Local Encrypted Vault Mode (Firebase credentials unconfigured)'
  };
};

/**
 * Maps institutional identifiers to Firebase Authentication compatible emails
 */
export const mapIdentifierToEmail = (identifier: string, role: 'student' | 'teacher'): string => {
  const cleanId = identifier.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
  if (role === 'student') {
    return `${cleanId}@student.necn.ac.in`;
  }
  return `${cleanId}@faculty.necn.ac.in`;
};
