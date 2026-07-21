import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getFirestore, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  collection, 
  getDocs, 
  query, 
  where, 
  deleteDoc,
  addDoc
} from 'firebase/firestore';
import { 
  Creator, 
  Business, 
  Booking, 
  Review, 
  AdminSettings, 
  CommissionOverride,
  DEFAULT_ADMIN_SETTINGS,
  SEED_CREATORS,
  SEED_BUSINESSES,
  SEED_BOOKINGS,
  SEED_REVIEWS,
  SEED_COMMISSIONS
} from './constants';

// Firebase configuration loaded from environment variables
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Check if we should use Firebase or local simulation
const isFirebaseEnabled = 
  !!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID && 
  process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID !== 'placeholder';

let app;
let firestoreDb: any = null;

if (isFirebaseEnabled) {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    firestoreDb = getFirestore(app);
  } catch (error) {
    console.error('Firebase initialization failed, falling back to LocalStorage simulation:', error);
  }
}

// ----------------------------------------------------
// LOCAL STORAGE SIMULATION PROVIDER
// ----------------------------------------------------

const getLocalStorageData = (key: string, defaultData: any) => {
  if (typeof window === 'undefined') return defaultData;
  const item = localStorage.getItem(key);
  if (!item) {
    localStorage.setItem(key, JSON.stringify(defaultData));
    return defaultData;
  }
  try {
    return JSON.parse(item);
  } catch {
    return defaultData;
  }
};

const setLocalStorageData = (key: string, data: any) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(key, JSON.stringify(data));
  }
};

// Seed LocalStorage with initial data if empty
const initializeLocalStorageDb = () => {
  if (typeof window === 'undefined') return;

  const versionKey = 'cc_db_v2_clean';
  if (!localStorage.getItem(versionKey)) {
    localStorage.removeItem('cc_creators');
    localStorage.removeItem('cc_businesses');
    localStorage.removeItem('cc_bookings');
    localStorage.removeItem('cc_reviews');
    localStorage.removeItem('cc_commissions');
    localStorage.removeItem('cc_users');
    localStorage.removeItem('cc_notifications');
    localStorage.removeItem('cc_auth_session');
    localStorage.setItem(versionKey, 'true');
  }

  getLocalStorageData('cc_creators', SEED_CREATORS);
  getLocalStorageData('cc_businesses', SEED_BUSINESSES);
  getLocalStorageData('cc_bookings', SEED_BOOKINGS);
  getLocalStorageData('cc_reviews', SEED_REVIEWS);
  getLocalStorageData('cc_commissions', SEED_COMMISSIONS);
  getLocalStorageData('cc_admin_settings', DEFAULT_ADMIN_SETTINGS);
  getLocalStorageData('cc_notifications', []);
  getLocalStorageData('cc_users', [
    { uid: 'admin_default', email: 'admin@creatorconnect.in', role: 'admin' }
  ]);
};

initializeLocalStorageDb();

// ----------------------------------------------------
// DATABASE UNIFIED INTERFACE EXPORTS
// ----------------------------------------------------

export const db = {
  // GENERAL USERS
  async getUserRole(uid: string): Promise<string | null> {
    if (firestoreDb) {
      const docRef = doc(firestoreDb, 'users', uid);
      const docSnap = await getDoc(docRef);
      return docSnap.exists() ? docSnap.data().role : null;
    } else {
      const users = getLocalStorageData('cc_users', []);
      const user = users.find((u: any) => u.uid === uid);
      return user ? user.role : null;
    }
  },

  async createUser(uid: string, email: string, role: 'business' | 'creator' | 'admin'): Promise<void> {
    const data = { uid, email, role, createdAt: new Date().toISOString() };
    if (firestoreDb) {
      await setDoc(doc(firestoreDb, 'users', uid), data);
    } else {
      const users = getLocalStorageData('cc_users', []);
      if (!users.some((u: any) => u.uid === uid)) {
        users.push(data);
        setLocalStorageData('cc_users', users);
      }
    }
  },

  // CREATORS
  async getCreators(): Promise<Creator[]> {
    if (firestoreDb) {
      const q = query(collection(firestoreDb, 'creators'));
      const querySnapshot = await getDocs(q);
      const list: Creator[] = [];
      querySnapshot.forEach((docSnap) => {
        const data = docSnap.data();
        list.push({ ...data, uid: data.uid || docSnap.id } as Creator);
      });
      return list;
    } else {
      return getLocalStorageData('cc_creators', SEED_CREATORS);
    }
  },

  async getCreator(uid: string): Promise<Creator | null> {
    if (firestoreDb) {
      const docRef = doc(firestoreDb, 'creators', uid);
      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) return null;
      const data = docSnap.data();
      return { ...data, uid: data.uid || docSnap.id } as Creator;
    } else {
      const list = getLocalStorageData('cc_creators', SEED_CREATORS);
      const item = list.find((c: Creator) => c.uid === uid);
      return item || null;
    }
  },

  async saveCreator(uid: string, data: Partial<Creator>): Promise<void> {
    if (firestoreDb) {
      await setDoc(doc(firestoreDb, 'creators', uid), data, { merge: true });
    } else {
      const list = getLocalStorageData('cc_creators', SEED_CREATORS);
      const index = list.findIndex((c: Creator) => c.uid === uid);
      const existing = index > -1 ? list[index] : {};
      const updated = {
        uid,
        name: data.name || existing.name || 'New Creator',
        photo: data.photo || existing.photo || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=300&h=300',
        coverImage: data.coverImage || existing.coverImage || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=1200&h=400',
        bio: data.bio || existing.bio || '',
        languages: data.languages || existing.languages || ['English'],
        experienceYears: data.experienceYears !== undefined ? data.experienceYears : (existing.experienceYears || 0),
        categories: data.categories || existing.categories || [],
        location: data.location || existing.location || { city: '', state: '' },
        followers: data.followers !== undefined ? data.followers : (existing.followers || 0),
        averageViews: data.averageViews !== undefined ? data.averageViews : (existing.averageViews || 0),
        engagementRate: data.engagementRate !== undefined ? data.engagementRate : (existing.engagementRate || 0),
        audienceCities: data.audienceCities || existing.audienceCities || [],
        pricingPackages: data.pricingPackages || existing.pricingPackages || [],
        portfolio: data.portfolio || existing.portfolio || [],
        status: data.status || existing.status || 'pending',
        isVerified: data.isVerified !== undefined ? data.isVerified : (existing.isVerified || false),
        rating: data.rating !== undefined ? data.rating : (existing.rating || 5.0),
        completedCollabs: data.completedCollabs !== undefined ? data.completedCollabs : (existing.completedCollabs || 0),
        socials: { ...existing.socials, ...data.socials },
        createdAt: existing.createdAt || new Date().toISOString()
      };

      if (index > -1) {
        list[index] = updated;
      } else {
        list.push(updated);
      }
      setLocalStorageData('cc_creators', list);
    }
  },

  // BUSINESSES
  async getBusinesses(): Promise<Business[]> {
    if (firestoreDb) {
      const q = query(collection(firestoreDb, 'businesses'));
      const querySnapshot = await getDocs(q);
      const list: Business[] = [];
      querySnapshot.forEach((docSnap) => {
        const data = docSnap.data();
        list.push({ ...data, uid: data.uid || docSnap.id } as Business);
      });
      return list;
    } else {
      return getLocalStorageData('cc_businesses', SEED_BUSINESSES);
    }
  },

  async getBusiness(uid: string): Promise<Business | null> {
    if (firestoreDb) {
      const docRef = doc(firestoreDb, 'businesses', uid);
      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) return null;
      const data = docSnap.data();
      return { ...data, uid: data.uid || docSnap.id } as Business;
    } else {
      const list = getLocalStorageData('cc_businesses', SEED_BUSINESSES);
      const item = list.find((b: Business) => b.uid === uid);
      return item || null;
    }
  },

  async saveBusiness(uid: string, data: Partial<Business>): Promise<void> {
    if (firestoreDb) {
      await setDoc(doc(firestoreDb, 'businesses', uid), data, { merge: true });
    } else {
      const list = getLocalStorageData('cc_businesses', SEED_BUSINESSES);
      const index = list.findIndex((b: Business) => b.uid === uid);
      const existing = index > -1 ? list[index] : {};
      const updated = {
        uid,
        name: data.name || existing.name || 'New Business',
        logo: data.logo || existing.logo || 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=200&h=200',
        coverImage: data.coverImage || existing.coverImage || 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=1200&h=400',
        category: data.category || existing.category || '',
        description: data.description || existing.description || '',
        address: data.address || existing.address || '',
        city: data.city || existing.city || '',
        state: data.state || existing.state || '',
        phone: data.phone || existing.phone || '',
        email: data.email || existing.email || '',
        socials: { ...existing.socials, ...data.socials },
        workingHours: data.workingHours || existing.workingHours || '',
        budgetRange: data.budgetRange || existing.budgetRange || { min: 0, max: 100000 },
        status: data.status || existing.status || 'pending',
        isVerified: data.isVerified !== undefined ? data.isVerified : (existing.isVerified || false),
        createdAt: existing.createdAt || new Date().toISOString()
      };

      if (index > -1) {
        list[index] = updated;
      } else {
        list.push(updated);
      }
      setLocalStorageData('cc_businesses', list);
    }
  },

  // BOOKINGS
  async getBookings(userId?: string, role?: 'business' | 'creator' | 'admin'): Promise<Booking[]> {
    if (firestoreDb) {
      let q;
      if (userId && role === 'business') {
        q = query(collection(firestoreDb, 'bookings'), where('businessId', '==', userId));
      } else if (userId && role === 'creator') {
        q = query(collection(firestoreDb, 'bookings'), where('creatorId', '==', userId));
      } else {
        q = query(collection(firestoreDb, 'bookings'));
      }

      const querySnapshot = await getDocs(q);
      const list: Booking[] = [];
      querySnapshot.forEach((docSnap) => {
        const data = docSnap.data();
        list.push({ ...data, id: data.id || docSnap.id } as Booking);
      });
      return list;
    } else {
      const list = getLocalStorageData('cc_bookings', SEED_BOOKINGS);
      if (userId && role === 'business') {
        return list.filter((b: Booking) => b.businessId === userId);
      } else if (userId && role === 'creator') {
        return list.filter((b: Booking) => b.creatorId === userId);
      }
      return list;
    }
  },

  async getBooking(id: string): Promise<Booking | null> {
    if (firestoreDb) {
      const docRef = doc(firestoreDb, 'bookings', id);
      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) return null;
      const data = docSnap.data();
      return { ...data, id: data.id || docSnap.id } as Booking;
    } else {
      const list = getLocalStorageData('cc_bookings', SEED_BOOKINGS);
      const item = list.find((b: Booking) => b.id === id);
      return item || null;
    }
  },

  async createBooking(bookingData: Omit<Booking, 'id' | 'createdAt'>): Promise<Booking> {
    const id = 'booking_' + Math.random().toString(36).substr(2, 9);
    const booking = {
      ...bookingData,
      id,
      createdAt: new Date().toISOString()
    } as Booking;

    if (firestoreDb) {
      await setDoc(doc(firestoreDb, 'bookings', id), booking);
    } else {
      const list = getLocalStorageData('cc_bookings', SEED_BOOKINGS);
      list.push(booking);
      setLocalStorageData('cc_bookings', list);
    }

    return booking;
  },

  async updateBooking(id: string, data: Partial<Booking>): Promise<void> {
    if (firestoreDb) {
      await updateDoc(doc(firestoreDb, 'bookings', id), data);
    } else {
      const list = getLocalStorageData('cc_bookings', SEED_BOOKINGS);
      const index = list.findIndex((b: Booking) => b.id === id);
      if (index > -1) {
        list[index] = { ...list[index], ...data };
        setLocalStorageData('cc_bookings', list);
      }
    }
  },

  // REVIEWS
  async getReviews(revieweeId?: string): Promise<Review[]> {
    if (firestoreDb) {
      let q = collection(firestoreDb, 'reviews');
      if (revieweeId) {
        const firestoreQ = query(q, where('revieweeId', '==', revieweeId));
        const querySnapshot = await getDocs(firestoreQ);
        const list: Review[] = [];
        querySnapshot.forEach((doc) => {
          list.push(doc.data() as Review);
        });
        return list;
      } else {
        const querySnapshot = await getDocs(q);
        const list: Review[] = [];
        querySnapshot.forEach((doc) => {
          list.push(doc.data() as Review);
        });
        return list;
      }
    } else {
      const list = getLocalStorageData('cc_reviews', SEED_REVIEWS);
      if (revieweeId) {
        return list.filter((r: Review) => r.revieweeId === revieweeId);
      }
      return list;
    }
  },

  async createReview(reviewData: Omit<Review, 'id' | 'createdAt'>): Promise<Review> {
    const id = 'review_' + Math.random().toString(36).substr(2, 9);
    const review = {
      ...reviewData,
      id,
      createdAt: new Date().toISOString()
    } as Review;

    if (firestoreDb) {
      await setDoc(doc(firestoreDb, 'reviews', id), review);
    } else {
      const list = getLocalStorageData('cc_reviews', SEED_REVIEWS);
      list.push(review);
      setLocalStorageData('cc_reviews', list);

      // Re-calculate creator's review rating if they are being reviewed
      if (review.reviewerRole === 'business') {
        const creators = getLocalStorageData('cc_creators', SEED_CREATORS);
        const index = creators.findIndex((c: Creator) => c.uid === review.revieweeId);
        if (index > -1) {
          const creatorReviews = list.filter((r: Review) => r.revieweeId === review.revieweeId && r.reviewerRole === 'business');
          const sum = creatorReviews.reduce((acc: number, curr: Review) => acc + curr.rating, 0);
          creators[index].rating = parseFloat((sum / creatorReviews.length).toFixed(1));
          creators[index].completedCollabs += 1;
          setLocalStorageData('cc_creators', creators);
        }
      }
    }

    return review;
  },

  // ADMIN SETTINGS
  async getAdminSettings(): Promise<AdminSettings> {
    if (firestoreDb) {
      const docRef = doc(firestoreDb, 'admin_settings', 'default');
      const docSnap = await getDoc(docRef);
      return docSnap.exists() ? (docSnap.data() as AdminSettings) : DEFAULT_ADMIN_SETTINGS;
    } else {
      return getLocalStorageData('cc_admin_settings', DEFAULT_ADMIN_SETTINGS);
    }
  },

  async updateAdminSettings(data: Partial<AdminSettings>): Promise<void> {
    if (firestoreDb) {
      await setDoc(doc(firestoreDb, 'admin_settings', 'default'), data, { merge: true });
    } else {
      const current = getLocalStorageData('cc_admin_settings', DEFAULT_ADMIN_SETTINGS);
      setLocalStorageData('cc_admin_settings', { ...current, ...data });
    }
  },

  // COMMISSION OVERRIDES
  async getCommissionOverrides(): Promise<CommissionOverride[]> {
    if (firestoreDb) {
      const q = query(collection(firestoreDb, 'commissions'));
      const querySnapshot = await getDocs(q);
      const list: CommissionOverride[] = [];
      querySnapshot.forEach((doc) => {
        list.push(doc.data() as CommissionOverride);
      });
      return list;
    } else {
      return getLocalStorageData('cc_commissions', SEED_COMMISSIONS);
    }
  },

  async saveCommissionOverride(targetId: string, targetType: 'creator' | 'business' | 'booking', commissionPercent: number): Promise<void> {
    const id = `override_${targetType}_${targetId}`;
    const data: CommissionOverride = {
      id,
      targetId,
      targetType,
      commissionPercent,
      createdAt: new Date().toISOString()
    };

    if (firestoreDb) {
      await setDoc(doc(firestoreDb, 'commissions', id), data);
    } else {
      const list = getLocalStorageData('cc_commissions', SEED_COMMISSIONS);
      const index = list.findIndex((c: CommissionOverride) => c.targetId === targetId && c.targetType === targetType);
      if (index > -1) {
        list[index] = data;
      } else {
        list.push(data);
      }
      setLocalStorageData('cc_commissions', list);
    }
  },

  async deleteCommissionOverride(id: string): Promise<void> {
    if (firestoreDb) {
      await deleteDoc(doc(firestoreDb, 'commissions', id));
    } else {
      const list = getLocalStorageData('cc_commissions', SEED_COMMISSIONS);
      const updated = list.filter((c: CommissionOverride) => c.id !== id);
      setLocalStorageData('cc_commissions', updated);
    }
  },

  // NOTIFICATIONS
  async getNotifications(userId: string): Promise<any[]> {
    if (firestoreDb) {
      const q = query(collection(firestoreDb, 'notifications'), where('userId', '==', userId));
      const querySnapshot = await getDocs(q);
      const list: any[] = [];
      querySnapshot.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() });
      });
      return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else {
      const list = getLocalStorageData('cc_notifications', []);
      return list
        .filter((n: any) => n.userId === userId)
        .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
  },

  async createNotification(userId: string, title: string, message: string, type: string): Promise<void> {
    const id = 'notif_' + Math.random().toString(36).substr(2, 9);
    const data = {
      id,
      userId,
      title,
      message,
      type,
      isRead: false,
      createdAt: new Date().toISOString()
    };

    if (firestoreDb) {
      await setDoc(doc(firestoreDb, 'notifications', id), data);
    } else {
      const list = getLocalStorageData('cc_notifications', []);
      list.push(data);
      setLocalStorageData('cc_notifications', list);
    }
  },

  async markNotificationAsRead(id: string): Promise<void> {
    if (firestoreDb) {
      await updateDoc(doc(firestoreDb, 'notifications', id), { isRead: true });
    } else {
      const list = getLocalStorageData('cc_notifications', []);
      const index = list.findIndex((n: any) => n.id === id);
      if (index > -1) {
        list[index].isRead = true;
        setLocalStorageData('cc_notifications', list);
      }
    }
  }
};
