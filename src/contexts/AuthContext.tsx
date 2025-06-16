import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db, googleProvider } from '../firebase/firebase';

interface User {
  id: string;
  email: string;
  name: string;
  company: string;
  plan: 'free' | 'premium';
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  register: (email: string, password: string, name: string, company: string) => Promise<void>;
  updateProfile: (updates: Partial<Pick<User, 'name' | 'company'>>) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Function to get user data from Firestore
  const getUserData = async (firebaseUser: FirebaseUser): Promise<User | null> => {
    try {
      const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        return {
          id: firebaseUser.uid,
          email: firebaseUser.email || '',
          name: userData.name || '',
          company: userData.company || '',
          plan: userData.plan || 'free'
        };
      }
      return null;
    } catch (error) {
      console.error('Error fetching user data:', error);
      return null;
    }
  };

  // Function to create user data in Firestore
  const createUserData = async (firebaseUser: FirebaseUser, name: string, company: string) => {
    try {
      const userData = {
        name,
        company,
        plan: 'free' as const,
        createdAt: new Date().toISOString()
      };
      await setDoc(doc(db, 'users', firebaseUser.uid), userData);
      return {
        id: firebaseUser.uid,
        email: firebaseUser.email || '',
        name,
        company,
        plan: 'free' as const
      };
    } catch (error) {
      console.error('Error creating user data:', error);
      throw error;
    }
  };

  // Function to create user data from Google Auth
  const createUserDataFromGoogle = async (firebaseUser: FirebaseUser) => {
    try {      // Extract name from Google profile
      const displayName = firebaseUser.displayName || '';
      
      const userData = {
        name: displayName,
        company: '', // User can fill this in later
        plan: 'free' as const,
        createdAt: new Date().toISOString(),
        signInMethod: 'google'
      };
      
      await setDoc(doc(db, 'users', firebaseUser.uid), userData);
      return {
        id: firebaseUser.uid,
        email: firebaseUser.email || '',
        name: displayName,
        company: '',
        plan: 'free' as const
      };
    } catch (error) {
      console.error('Error creating user data from Google:', error);
      throw error;
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userData = await getUserData(firebaseUser);
        setUser(userData);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // User state will be updated by onAuthStateChanged
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const register = async (email: string, password: string, name: string, company: string): Promise<void> => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const userData = await createUserData(userCredential.user, name, company);
      setUser(userData);
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await signOut(auth);
      // User state will be updated by onAuthStateChanged
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  const loginWithGoogle = async (): Promise<void> => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const firebaseUser = result.user;
      
      // Check if user data already exists
      let userData = await getUserData(firebaseUser);
      
      // If no user data exists, create it from Google profile
      if (!userData) {
        userData = await createUserDataFromGoogle(firebaseUser);
      }
      
      setUser(userData);
    } catch (error) {
      console.error('Google sign-in error:', error);
      throw error;
    }
  };

  const updateProfile = async (updates: Partial<Pick<User, 'name' | 'company'>>): Promise<void> => {
    if (!user) {
      throw new Error('No user is currently signed in');
    }

    try {
      const userRef = doc(db, 'users', user.id);
      await updateDoc(userRef, {
        ...updates,
        updatedAt: new Date().toISOString()
      });

      // Update local user state
      setUser(prev => prev ? { ...prev, ...updates } : null);
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  };

  const value = {
    user,
    login,
    register,
    logout,
    loginWithGoogle,
    updateProfile,
    isAuthenticated: !!user,
    loading
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};