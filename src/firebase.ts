import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithRedirect, getRedirectResult, signOut, onAuthStateChanged } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
const firebaseConfig = {
  apiKey: "AIzaSyDe-IOCpwh1-tgoWyBo91-K-lRmDh6F1ps",
  authDomain: "managerprolab-b5724.firebaseapp.com",
  projectId: "managerprolab-b5724",
  storageBucket: "managerprolab-b5724.firebasestorage.app",
  messagingSenderId: "943078975240",
  appId: "1:943078975240:web:105f389ea3fbd89d6eaebd",
  measurementId: "G-QGPQYP6FZV"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

export { signInWithPopup, signInWithRedirect, getRedirectResult, signOut, onAuthStateChanged };
