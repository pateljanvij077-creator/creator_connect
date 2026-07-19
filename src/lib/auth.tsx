'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  User as FirebaseUser,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { db } from './db';
import { Creator, Business } from './constants';

interface AuthContextType {
  user: { uid: string; email: string; role: 'business' | 'creator' | 'admin' } | null;
  profile: Creator | Business | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: (roleForNewUser?: 'business' | 'creator') => Promise<void>;
  signup: (
    email: string, 
    password: string, 
    role: 'business' | 'creator', 
    name: string,
    phone: string
  ) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  isCreator: boolean;
  isBusiness: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Firebase Config Check
const isFirebaseEnabled = 
  !!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID && 
  process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID !== 'placeholder';

let firebaseAuth: any = null;

if (isFirebaseEnabled) {
  try {
    const app = getApps().length === 0 ? initializeApp({
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    }) : getApp();
    firebaseAuth = getAuth(app);
  } catch (e) {
    console.error('Firebase Auth failed to init:', e);
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthContextType['user']>(null);
  const [profile, setProfile] = useState<AuthContextType['profile']>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Load profile based on user role
  const loadProfile = async (uid: string, role: 'business' | 'creator' | 'admin') => {
    try {
      if (role === 'creator') {
        const creatorProf = await db.getCreator(uid);
        setProfile(creatorProf);
      } else if (role === 'business') {
        const businessProf = await db.getBusiness(uid);
        setProfile(businessProf);
      } else {
        setProfile(null); // Admin profile
      }
    } catch (e) {
      console.error('Failed to load profile for user', uid, e);
    }
  };

  // Sync auth state
  useEffect(() => {
    if (firebaseAuth) {
      const unsubscribe = onAuthStateChanged(firebaseAuth, async (fbUser: FirebaseUser | null) => {
        if (fbUser) {
          const role = (await db.getUserRole(fbUser.uid)) as 'business' | 'creator' | 'admin';
          if (role) {
            setUser({ uid: fbUser.uid, email: fbUser.email || '', role });
            await loadProfile(fbUser.uid, role);
          } else {
            setUser(null);
            setProfile(null);
          }
        } else {
          setUser(null);
          setProfile(null);
        }
        setLoading(false);
      });
      return () => unsubscribe();
    } else {
      // LocalStorage simulated Auth session
      const storedSession = localStorage.getItem('cc_auth_session');
      if (storedSession) {
        try {
          const session = JSON.parse(storedSession);
          setUser(session);
          loadProfile(session.uid, session.role).then(() => setLoading(false));
        } catch {
          setUser(null);
          setLoading(false);
        }
      } else {
        setUser(null);
        setLoading(false);
      }
    }
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      if (firebaseAuth) {
        const userCredential = await signInWithEmailAndPassword(firebaseAuth, email, password);
        const role = (await db.getUserRole(userCredential.user.uid)) as 'business' | 'creator' | 'admin';
        if (role) {
          setUser({ uid: userCredential.user.uid, email: userCredential.user.email || '', role });
          await loadProfile(userCredential.user.uid, role);
        }
      } else {
        // Simulated Login
        const rawUsers = localStorage.getItem('cc_users') || '[]';
        const users = JSON.parse(rawUsers);
        
        let matchedUser = users.find((u: any) => u.email.toLowerCase() === email.toLowerCase());
        
        // Quick seeding for easy dev login
        if (!matchedUser) {
          if (email === 'admin@creatorconnect.in') {
            matchedUser = { uid: 'admin_default', email, role: 'admin' };
          }
        }

        if (!matchedUser) {
          throw new Error('User not found. Please sign up first.');
        }

        const session = { uid: matchedUser.uid, email: matchedUser.email, role: matchedUser.role };
        localStorage.setItem('cc_auth_session', JSON.stringify(session));
        setUser(session);
        await loadProfile(matchedUser.uid, matchedUser.role);
      }
    } catch (e: any) {
      setLoading(false);
      throw e;
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = async (roleForNewUser?: 'business' | 'creator') => {
    setLoading(true);
    try {
      if (firebaseAuth) {
        const provider = new GoogleAuthProvider();
        const userCredential = await signInWithPopup(firebaseAuth, provider);
        const uid = userCredential.user.uid;
        const email = userCredential.user.email || '';
        const name = userCredential.user.displayName || 'Google User';

        // Check if user role document exists
        let role = (await db.getUserRole(uid)) as 'business' | 'creator' | 'admin';
        
        if (email.toLowerCase() === 'shyamabp27@gmail.com') {
          role = 'admin';
          await db.createUser(uid, email, 'admin');
        }
        
        if (!role) {
          // New user sign up via Google
          if (!roleForNewUser) {
            throw new Error('No account found. Please register or select your account type (Business or Creator) first.');
          }
          role = roleForNewUser;
          await db.createUser(uid, email, role);
          
          // Initialize profile details
          if (role === 'creator') {
            const newCreator: Creator = {
              uid,
              name,
              photo: userCredential.user.photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=300&h=300',
              coverImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=1200&h=400',
              bio: '',
              languages: [],
              experienceYears: 0,
              categories: [],
              location: { city: '', state: '' },
              followers: 0,
              averageViews: 0,
              engagementRate: 0,
              audienceCities: [],
              pricingPackages: [
                { name: 'Standard Collab', description: 'Reel + story integration', price: 1000 }
              ],
              portfolio: [],
              status: 'pending', // Requires admin approval
              isVerified: false,
              rating: 5.0,
              completedCollabs: 0,
              socials: { email } as any,
              createdAt: new Date().toISOString()
            };
            await db.saveCreator(uid, newCreator);
          } else if (role === 'business') {
            const newBusiness: Business = {
              uid,
              name,
              phone: '',
              email,
              logo: userCredential.user.photoURL || 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=200&h=200',
              coverImage: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=1200&h=400',
              category: '',
              description: '',
              address: '',
              city: '',
              state: '',
              socials: { website: '' },
              workingHours: '',
              budgetRange: { min: 0, max: 5000 },
              status: 'pending', // Requires admin approval
              isVerified: false,
              createdAt: new Date().toISOString()
            };
            await db.saveBusiness(uid, newBusiness);
          }
        }

        const session = { uid, email, role };
        setUser(session);
        await loadProfile(uid, role);
      } else {
        // Simulated Google Login
        const rawUsers = localStorage.getItem('cc_users') || '[]';
        const users = JSON.parse(rawUsers);
        
        const role = roleForNewUser || 'creator';
        const email = role === 'creator' ? 'google_creator@example.com' : 'google_business@example.com';
        
        let matchedUser = users.find((u: any) => u.email.toLowerCase() === email.toLowerCase());
        
        if (!matchedUser) {
          const uid = 'google_user_' + Math.random().toString(36).substr(2, 9);
          matchedUser = { uid, email, role };
          
          // Save mock user
          users.push(matchedUser);
          localStorage.setItem('cc_users', JSON.stringify(users));
          
          await db.createUser(uid, email, role);
          if (role === 'creator') {
            const newCreator: Creator = {
              uid,
              name: 'Google Creator User',
              photo: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=300&h=300',
              coverImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=1200&h=400',
              bio: '',
              languages: [],
              experienceYears: 0,
              categories: [],
              location: { city: '', state: '' },
              followers: 0,
              averageViews: 0,
              engagementRate: 0,
              audienceCities: [],
              pricingPackages: [
                { name: 'Standard Collab', description: 'Reel + story integration', price: 1000 }
              ],
              portfolio: [],
              status: 'pending',
              isVerified: false,
              rating: 5.0,
              completedCollabs: 0,
              socials: { email } as any,
              createdAt: new Date().toISOString()
            };
            await db.saveCreator(uid, newCreator);
          } else {
            const newBusiness: Business = {
              uid,
              name: 'Google Business User',
              phone: '',
              email,
              logo: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=200&h=200',
              coverImage: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=1200&h=400',
              category: '',
              description: '',
              address: '',
              city: '',
              state: '',
              socials: { website: '' },
              workingHours: '',
              budgetRange: { min: 0, max: 5000 },
              status: 'pending',
              isVerified: false,
              createdAt: new Date().toISOString()
            };
            await db.saveBusiness(uid, newBusiness);
          }
        }
        
        const session = { uid: matchedUser.uid, email: matchedUser.email, role: matchedUser.role };
        localStorage.setItem('cc_auth_session', JSON.stringify(session));
        setUser(session);
        await loadProfile(matchedUser.uid, matchedUser.role);
      }
    } catch (e: any) {
      setLoading(false);
      throw e;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (
    email: string, 
    password: string, 
    role: 'business' | 'creator', 
    name: string,
    phone: string
  ) => {
    setLoading(true);
    try {
      let uid = '';
      if (firebaseAuth) {
        const userCredential = await createUserWithEmailAndPassword(firebaseAuth, email, password);
        uid = userCredential.user.uid;
      } else {
        uid = 'user_' + Math.random().toString(36).substr(2, 9);
        
        // Save mock user in local lists
        const rawUsers = localStorage.getItem('cc_users') || '[]';
        const users = JSON.parse(rawUsers);
        users.push({ uid, email, role });
        localStorage.setItem('cc_users', JSON.stringify(users));
      }

      // Create base user record
      await db.createUser(uid, email, role);

      // Create profile details
      if (role === 'creator') {
        const newCreator: Creator = {
          uid,
          name,
          photo: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=300&h=300',
          coverImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=1200&h=400',
          bio: '',
          languages: [],
          experienceYears: 0,
          categories: [],
          location: { city: '', state: '' },
          followers: 0,
          averageViews: 0,
          engagementRate: 0,
          audienceCities: [],
          pricingPackages: [
            { name: 'Standard Collab', description: 'Reel + story integration', price: 1000 }
          ],
          portfolio: [],
          status: 'pending', // Requires admin approval
          isVerified: false,
          rating: 5.0,
          completedCollabs: 0,
          socials: { email } as any,
          createdAt: new Date().toISOString()
        };
        await db.saveCreator(uid, newCreator);
      } else if (role === 'business') {
        const newBusiness: Business = {
          uid,
          name,
          phone,
          email,
          logo: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=200&h=200',
          coverImage: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=1200&h=400',
          category: '',
          description: '',
          address: '',
          city: '',
          state: '',
          socials: { website: '' },
          workingHours: '',
          budgetRange: { min: 0, max: 5000 },
          status: 'pending', // Requires admin approval
          isVerified: false,
          createdAt: new Date().toISOString()
        };
        await db.saveBusiness(uid, newBusiness);
      }

      // Set user session
      const session = { uid, email, role };
      if (!firebaseAuth) {
        localStorage.setItem('cc_auth_session', JSON.stringify(session));
      }
      
      setUser(session);
      await loadProfile(uid, role);
      
    } catch (e: any) {
      setLoading(false);
      throw e;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      if (firebaseAuth) {
        await signOut(firebaseAuth);
      } else {
        localStorage.removeItem('cc_auth_session');
      }
      setUser(null);
      setProfile(null);
      router.push('/');
    } catch (e) {
      console.error('Logout error:', e);
    } finally {
      setLoading(false);
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await loadProfile(user.uid, user.role);
    }
  };

  const isCreator = user?.role === 'creator';
  const isBusiness = user?.role === 'business';
  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider value={{
      user,
      profile,
      loading,
      login,
      loginWithGoogle,
      signup,
      logout,
      refreshProfile,
      isCreator,
      isBusiness,
      isAdmin
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
