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
  companyDetails?: {
    name: string;
    email: string;
    telephone: string;
    address: string;
    description?: string;
    logoUrl?: string;
    businessType: string;
    registrationNumber?: string;
    operatingSince?: string;
    website?: string;
  };
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  register: (email: string, password: string, name: string, company: string) => Promise<void>;
  updateProfile: (updates: Partial<Pick<User, 'name' | 'company'>>) => Promise<void>;
  createOrUpdateCompany: (companyData: {
    name: string;
    email: string;
    telephone: string;
    address: string;
    description?: string;
    businessType: string;
    registrationNumber?: string;
    operatingSince?: string;
    website?: string;
  }) => Promise<void>;
  updateUserPlan: (plan: 'free' | 'premium') => Promise<void>;
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
  const [loading, setLoading] = useState(true);  // Function to get user data from Firestore
  const getUserData = async (firebaseUser: FirebaseUser): Promise<User | null> => {
    try {
      const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        
        // Fetch company details if user has a company
        let companyDetails = undefined;
        if (userData.company && userData.company.trim()) {
          const { getCompanyByName } = await import('../services/firestore');
          const company = await getCompanyByName(userData.company);
          if (company) {
            companyDetails = {
              name: company.name,
              email: company.email,
              telephone: company.telephone,
              address: company.address,
              description: company.description,
              logoUrl: company.logoUrl,
              businessType: company.businessType,
              registrationNumber: company.registrationNumber,
              operatingSince: company.operatingSince,
              website: company.website,
            };
          }
        }
        
        return {
          id: firebaseUser.uid,
          email: firebaseUser.email || '',
          name: userData.name || '',
          company: userData.company || '',
          plan: userData.plan || 'free',
          companyDetails
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
  };  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      console.log('Auth state changed:', firebaseUser?.uid || 'signed out');
      
      if (firebaseUser) {
        console.log('Fetching user data for auth state change');
        let userData = await getUserData(firebaseUser);
        console.log('User data from Firestore:', userData);
        
        // If no user data exists, create it (fallback for existing users)
        if (!userData) {
          console.log('No user data found, creating fallback user document');
          const name = firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User';
          userData = await createUserData(firebaseUser, name, '');
        }
        
        setUser(userData);
      } else {
        console.log('User signed out');
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []); // Remove user dependency to avoid infinite loops
  const login = async (email: string, password: string): Promise<void> => {
    try {
      console.log('Attempting login for email:', email);
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      console.log('Firebase auth successful for user:', firebaseUser.uid);
      
      // Try to get existing user data
      let userData = await getUserData(firebaseUser);
      console.log('Existing user data:', userData);
      
      // If no user data exists in Firestore, create it
      if (!userData) {
        console.log('No user data found, creating new user document');
        // Extract name from email (fallback) or use displayName
        const name = firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User';
        userData = await createUserData(firebaseUser, name, ''); // Empty company for now
      }
      
      console.log('Setting user data:', userData);
      setUser(userData);
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
  };  const updateProfile = async (updates: Partial<Pick<User, 'name' | 'company'>>): Promise<void> => {
    if (!user) {
      throw new Error('No user is currently signed in');
    }

    try {
      const userRef = doc(db, 'users', user.id);
      await updateDoc(userRef, {
        ...updates,
        updatedAt: new Date().toISOString()
      });

      // If company is being updated, refresh the full user data including company details
      if (updates.company && auth.currentUser) {
        const refreshedUserData = await getUserData(auth.currentUser);
        if (refreshedUserData) {
          setUser(refreshedUserData);
        }
      } else {
        // Update local user state for non-company updates
        setUser(prev => prev ? { ...prev, ...updates } : null);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  };
  const createOrUpdateCompany = async (companyData: {
    name: string;
    email: string;
    telephone: string;
    address: string;
    description?: string;
    businessType: string;
    registrationNumber?: string;
    operatingSince?: string;
    website?: string;
  }): Promise<void> => {
    if (!user) {
      throw new Error('No user is currently signed in');
    }

    try {
      const { addCompany, getCompanyByName } = await import('../services/firestore');
      
      // Check if company already exists by name
      const existingCompany = await getCompanyByName(companyData.name);
      
      if (!existingCompany) {
        // Create company in companies collection
        await addCompany({
          ...companyData,
          // Add any additional fields needed
        });
      }

      // Update user profile with company name
      await updateProfile({ company: companyData.name });
      
      // Refresh user data to include company details
      if (auth.currentUser) {
        const refreshedUserData = await getUserData(auth.currentUser);
        if (refreshedUserData) {
          setUser(refreshedUserData);
        }
      }
    } catch (error) {
      console.error('Error creating/updating company:', error);      throw error;
    }
  };

  const updateUserPlan = async (plan: 'free' | 'premium'): Promise<void> => {
    if (!user) {
      throw new Error('No user is currently signed in');
    }

    try {
      const { updateUserPlan: updatePlanInFirestore } = await import('../services/firestore');
      await updatePlanInFirestore(user.id, plan);

      // Update local user state
      setUser(prev => prev ? { ...prev, plan } : null);
    } catch (error) {
      console.error('Error updating user plan:', error);
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
    createOrUpdateCompany,
    updateUserPlan,
    isAuthenticated: !!user,
    loading
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useUserPlan = () => {
  const { user } = useAuth();
  return user?.plan || 'free';
};