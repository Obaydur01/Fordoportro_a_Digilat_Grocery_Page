import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  auth,
  googleProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  signInWithPopup,
  onAuthStateChanged
} from '../firebase';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('fp_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(true);

  // Sync auth state
  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        const userData = {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName || user.email?.split('@')[0] || 'Customer',
          photoURL: user.photoURL,
          isAdmin: user.email?.includes('admin') || user.email === 'admin@fordoportro.com'
        };
        setCurrentUser(userData);
        localStorage.setItem('fp_user', JSON.stringify(userData));
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // Email / Password Login
  const login = async (email, password) => {
    if (auth) {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      const user = cred.user;
      const userData = {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || user.email?.split('@')[0] || 'Customer',
        isAdmin: email.toLowerCase().includes('admin') || email === 'admin@fordoportro.com'
      };
      setCurrentUser(userData);
      localStorage.setItem('fp_user', JSON.stringify(userData));
      return userData;
    } else {
      // Fallback local mock login
      const userData = {
        uid: 'user-' + Date.now(),
        email,
        displayName: email.split('@')[0],
        isAdmin: email.toLowerCase().includes('admin')
      };
      setCurrentUser(userData);
      localStorage.setItem('fp_user', JSON.stringify(userData));
      return userData;
    }
  };

  // Registration
  const signup = async (email, password, name) => {
    if (auth) {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      const user = cred.user;
      const userData = {
        uid: user.uid,
        email: user.email,
        displayName: name || user.email?.split('@')[0] || 'Customer',
        isAdmin: false
      };
      setCurrentUser(userData);
      localStorage.setItem('fp_user', JSON.stringify(userData));
      return userData;
    } else {
      const userData = {
        uid: 'user-' + Date.now(),
        email,
        displayName: name || email.split('@')[0],
        isAdmin: false
      };
      setCurrentUser(userData);
      localStorage.setItem('fp_user', JSON.stringify(userData));
      return userData;
    }
  };

  // Google Login
  const loginWithGoogle = async () => {
    if (auth && googleProvider) {
      const cred = await signInWithPopup(auth, googleProvider);
      const user = cred.user;
      const userData = {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || 'Google User',
        photoURL: user.photoURL,
        isAdmin: user.email?.includes('admin')
      };
      setCurrentUser(userData);
      localStorage.setItem('fp_user', JSON.stringify(userData));
      return userData;
    }
  };

  // Quick 1-Click Demo Logins for instant evaluation
  const demoLoginAdmin = () => {
    const adminUser = {
      uid: 'admin-fordoportro-01',
      email: 'admin@fordoportro.com',
      displayName: 'প্রধান প্রশাসক (Admin)',
      isAdmin: true
    };
    setCurrentUser(adminUser);
    localStorage.setItem('fp_user', JSON.stringify(adminUser));
    return adminUser;
  };

  const demoLoginCustomer1 = () => {
    const customerUser = {
      uid: 'cust-rakibul-01',
      email: 'rakibul@gmail.com',
      displayName: 'রাকিবুল হাসান (Customer 1)',
      isAdmin: false
    };
    setCurrentUser(customerUser);
    localStorage.setItem('fp_user', JSON.stringify(customerUser));
    return customerUser;
  };

  const demoLoginCustomer2 = () => {
    const customerUser = {
      uid: 'cust-sadia-02',
      email: 'sadia@gmail.com',
      displayName: 'সাদিয়া ইসলাম (Customer 2)',
      isAdmin: false
    };
    setCurrentUser(customerUser);
    localStorage.setItem('fp_user', JSON.stringify(customerUser));
    return customerUser;
  };

  const demoLoginCustomer = demoLoginCustomer1;

  // Logout
  const logout = async () => {
    if (auth) {
      try {
        await signOut(auth);
      } catch (e) {}
    }
    setCurrentUser(null);
    localStorage.removeItem('fp_user');
  };

  const value = {
    currentUser,
    isAdmin: currentUser?.isAdmin || false,
    loading,
    login,
    signup,
    loginWithGoogle,
    demoLoginAdmin,
    demoLoginCustomer,
    demoLoginCustomer1,
    demoLoginCustomer2,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
