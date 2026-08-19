import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  auth, 
  googleProvider, 
  signInWithPopup, 
  signInAnonymously,
  signOut, 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  updateProfile,
  onAuthStateChanged, 
  User, 
  db, 
  handleFirestoreError, 
  OperationType 
} from '../lib/firebase';
import { doc, setDoc } from 'firebase/firestore';

export interface AuthErrorDetails {
  code: string;
  message: string;
  domain: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  authError: AuthErrorDetails | null;
  signInWithGoogle: () => Promise<boolean>;
  signInAsGuest: () => Promise<boolean>;
  signInWithEmail: (email: string, password: string) => Promise<boolean>;
  signUpWithEmail: (email: string, password: string, displayName?: string) => Promise<boolean>;
  resetPassword: (email: string) => Promise<boolean>;
  updateDisplayName: (displayName: string) => Promise<boolean>;
  logout: () => Promise<void>;
  clearAuthError: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  authError: null,
  signInWithGoogle: async () => false,
  signInAsGuest: async () => false,
  signInWithEmail: async () => false,
  signUpWithEmail: async () => false,
  resetPassword: async () => false,
  updateDisplayName: async () => false,
  logout: async () => {},
  clearAuthError: () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [authError, setAuthError] = useState<AuthErrorDetails | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      setLoading(false);

      if (currentUser) {
        // Ensure user profile document exists in Firestore
        const userRef = doc(db, 'users', currentUser.uid);
        try {
          await setDoc(
            userRef,
            {
              uid: currentUser.uid,
              email: currentUser.email || 'Anonymous Guest',
              displayName: currentUser.displayName || (currentUser.isAnonymous ? 'Guest Explorer' : currentUser.email?.split('@')[0] || 'User'),
              photoURL: currentUser.photoURL || null,
              isAnonymous: currentUser.isAnonymous,
              updatedAt: new Date().toISOString(),
            },
            { merge: true }
          );
        } catch (error) {
          handleFirestoreError(error, OperationType.WRITE, `users/${currentUser.uid}`);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  const formatErrorMessage = (error: any): string => {
    const code = error?.code || '';
    switch (code) {
      case 'auth/invalid-email':
        return 'The email address is invalid. Please check the spelling.';
      case 'auth/user-disabled':
        return 'This account has been disabled. Please contact support.';
      case 'auth/user-not-found':
        return 'No user account found with this email. Please sign up first.';
      case 'auth/wrong-password':
      case 'auth/invalid-credential':
        return 'Incorrect email or password. Please verify and try again.';
      case 'auth/email-already-in-use':
        return 'An account with this email already exists. Please sign in instead.';
      case 'auth/weak-password':
        return 'Password is too weak. Please use at least 6 characters.';
      case 'auth/popup-closed-by-user':
        return 'Google Sign-In popup was closed before finishing.';
      case 'auth/network-request-failed':
        return 'Network connection issue. Please check your internet connection.';
      case 'auth/too-many-requests':
        return 'Too many attempts. Access temporarily disabled. Try again later or reset password.';
      default:
        return error?.message || 'Authentication failed. Please try again.';
    }
  };

  const signInWithEmail = async (email: string, password: string): Promise<boolean> => {
    setAuthError(null);
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      return true;
    } catch (error: any) {
      console.error('Email Sign-In Error:', error);
      const code = error?.code || 'email_auth_error';
      setAuthError({
        code,
        message: formatErrorMessage(error),
        domain: typeof window !== 'undefined' ? window.location.hostname : '',
      });
      return false;
    }
  };

  const signUpWithEmail = async (email: string, password: string, displayName?: string): Promise<boolean> => {
    setAuthError(null);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password);
      if (displayName && userCredential.user) {
        await updateProfile(userCredential.user, { displayName });
      }
      return true;
    } catch (error: any) {
      console.error('Email Sign-Up Error:', error);
      const code = error?.code || 'signup_error';
      setAuthError({
        code,
        message: formatErrorMessage(error),
        domain: typeof window !== 'undefined' ? window.location.hostname : '',
      });
      return false;
    }
  };

  const resetPassword = async (email: string): Promise<boolean> => {
    setAuthError(null);
    try {
      await sendPasswordResetEmail(auth, email.trim());
      return true;
    } catch (error: any) {
      console.error('Password Reset Error:', error);
      const code = error?.code || 'reset_error';
      setAuthError({
        code,
        message: formatErrorMessage(error),
        domain: typeof window !== 'undefined' ? window.location.hostname : '',
      });
      return false;
    }
  };

  const updateDisplayName = async (displayName: string): Promise<boolean> => {
    if (!auth.currentUser) return false;
    try {
      await updateProfile(auth.currentUser, { displayName: displayName.trim() });
      setUser({ ...auth.currentUser });
      
      const userRef = doc(db, 'users', auth.currentUser.uid);
      await setDoc(
        userRef,
        { displayName: displayName.trim(), updatedAt: new Date().toISOString() },
        { merge: true }
      );
      return true;
    } catch (error) {
      console.error('Update Profile Error:', error);
      return false;
    }
  };

  const signInWithGoogle = async (): Promise<boolean> => {
    setAuthError(null);
    try {
      await signInWithPopup(auth, googleProvider);
      return true;
    } catch (error: any) {
      console.error('Google Sign-In Error:', error);
      const code = error?.code || 'unknown_auth_error';
      setAuthError({
        code,
        message: formatErrorMessage(error),
        domain: typeof window !== 'undefined' ? window.location.hostname : '',
      });
      return false;
    }
  };

  const signInAsGuest = async (): Promise<boolean> => {
    setAuthError(null);
    try {
      await signInAnonymously(auth);
      return true;
    } catch (error: any) {
      console.error('Guest Sign-In Error:', error);
      setAuthError({
        code: error?.code || 'guest_auth_error',
        message: formatErrorMessage(error),
        domain: typeof window !== 'undefined' ? window.location.hostname : '',
      });
      return false;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Sign Out Error:', error);
    }
  };

  const clearAuthError = () => {
    setAuthError(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        authError,
        signInWithGoogle,
        signInAsGuest,
        signInWithEmail,
        signUpWithEmail,
        resetPassword,
        updateDisplayName,
        logout,
        clearAuthError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
