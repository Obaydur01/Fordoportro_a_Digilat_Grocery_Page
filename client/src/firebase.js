import { initializeApp } from 'firebase/app';
import { getAnalytics, isSupported } from 'firebase/analytics';
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged
} from 'firebase/auth';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDXGdv9HnS613Y8J6I5mOaY_y2OUBw3VkA",
  authDomain: "fordopotro3-0.firebaseapp.com",
  projectId: "fordopotro3-0",
  storageBucket: "fordopotro3-0.firebasestorage.app",
  messagingSenderId: "474303004229",
  appId: "1:474303004229:web:cd0ef0f34fafc61a2ead2c",
  measurementId: "G-EM5QPXVJ0V"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// Initialize Analytics if supported in browser environment
let analytics = null;
if (typeof window !== 'undefined') {
  isSupported().then(supported => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  }).catch(() => {});
}

export {
  app,
  auth,
  analytics,
  googleProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  signInWithPopup,
  onAuthStateChanged
};
