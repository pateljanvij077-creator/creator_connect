export interface SocialLinks {
  instagram?: string;
  facebook?: string;
  youtube?: string;
  tiktok?: string;
  threads?: string;
  linkedin?: string;
  snapchat?: string;
  pinterest?: string;
  twitter?: string;
  dribbble?: string;
  behance?: string;
  linktree?: string;
  whatsapp?: string;
  email?: string;
  website?: string;
}

export interface Creator {
  uid: string;
  name: string;
  photo: string;
  coverImage: string;
  bio: string;
  languages: string[];
  experienceYears: number;
  categories: string[];
  location: {
    city: string;
    state: string;
  };
  followers: number;
  averageViews: number;
  engagementRate: number;
  audienceCities: { name: string; percentage: number }[];
  pricingPackages: {
    name: string;
    description: string;
    price: number;
  }[];
  portfolio: string[]; // image URLs
  status: 'pending' | 'approved' | 'suspended';
  isVerified: boolean;
  rating: number;
  completedCollabs: number;
  socials: SocialLinks;
  createdAt: string;
}

export interface Business {
  uid: string;
  name: string;
  logo: string;
  coverImage: string;
  category: string;
  description: string;
  address: string;
  city: string;
  state: string;
  phone: string;
  email: string;
  socials: {
    instagram?: string;
    facebook?: string;
    youtube?: string;
    website?: string;
  };
  workingHours: string;
  budgetRange: {
    min: number;
    max: number;
  };
  status: 'pending' | 'approved' | 'suspended';
  isVerified: boolean;
  createdAt: string;
}

export interface Booking {
  id: string;
  businessId: string;
  businessName: string;
  creatorId: string;
  creatorName: string;
  campaignTitle: string;
  campaignDescription: string;
  campaignDate: string;
  location: string;
  expectedDeliverables: string;
  budget: number;
  commissionPercent: number;
  commissionAmount: number;
  creatorEarnings: number;
  businessPayment: number;
  status: 'pending' | 'accepted' | 'rejected' | 'completed';
  paymentStatus: 'pending' | 'paid' | 'refunded';
  refundStatus: 'none' | 'pending' | 'refunded';
  createdAt: string;
}

export interface Review {
  id: string;
  bookingId: string;
  reviewerId: string;
  reviewerRole: 'business' | 'creator';
  revieweeId: string;
  rating: number;
  comment: string;
  photos?: string[];
  createdAt: string;
}

export interface WalletTransaction {
  id: string;
  userId: string;
  type: 'deposit' | 'refund' | 'deduction' | 'hold' | 'payout';
  amount: number;
  description: string;
  status: 'completed' | 'pending' | 'failed';
  createdAt: string;
}

export interface AdminSettings {
  platformName: string;
  platformLogo: string;
  maintenanceMode: boolean;
  defaultCommissionPercent: number;
  currency: string;
  gstPercent: number;
  supportEmail: string;
  supportPhone: string;
  privacyPolicy: string;
  termsOfService: string;
  refundPolicy: string;
  seoTitle: string;
  seoDescription: string;
  // Wallet & Payment Policy Settings
  minWalletDeposit: number;
  unconfirmedDeductionFee: number;
  baseBookingPlatformFee: number;
  razorpayKeyId: string;
  razorpaySecret: string;
  stripePublicKey: string;
  stripeSecretKey: string;
  paymentMode: 'test' | 'live';
  bookingPolicyTerms: string;
}

export interface CommissionOverride {
  id: string;
  targetId: string; // creatorId, businessId, or bookingId
  targetType: 'creator' | 'business' | 'booking';
  commissionPercent: number;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  iconName: string; // Lucide icon identifier
}

export const CATEGORIES: Category[] = [
  { id: '1', name: 'Food & Dining', slug: 'food-dining', iconName: 'Utensils' },
  { id: '2', name: 'Fashion & Lifestyle', slug: 'fashion-lifestyle', iconName: 'Shirt' },
  { id: '3', name: 'Beauty & Cosmetics', slug: 'beauty-cosmetics', iconName: 'Sparkles' },
  { id: '4', name: 'Tech & Gadgets', slug: 'tech-gadgets', iconName: 'Laptop' },
  { id: '5', name: 'Travel & Adventure', slug: 'travel-adventure', iconName: 'Compass' },
  { id: '6', name: 'Fitness & Wellness', slug: 'fitness-wellness', iconName: 'Dumbbell' },
  { id: '7', name: 'Real Estate & Design', slug: 'real-estate-design', iconName: 'Home' },
  { id: '8', name: 'Education & Career', slug: 'education-career', iconName: 'GraduationCap' },
];

export const DEFAULT_ADMIN_SETTINGS: AdminSettings = {
  platformName: 'CreatorConnect',
  platformLogo: '🔗',
  maintenanceMode: false,
  defaultCommissionPercent: 10,
  currency: '₹',
  gstPercent: 18,
  supportEmail: 'support@creatorconnect.in',
  supportPhone: '+91 98765 43210',
  privacyPolicy: 'Your privacy is protected under our policies...',
  termsOfService: 'Platform terms require professional collaboration...',
  refundPolicy: 'Refunds are issued if campaigns are cancelled 48h prior...',
  seoTitle: 'CreatorConnect - Connect Businesses and Local Creators',
  seoDescription: 'The ultimate marketplace connecting local retail, dining, and lifestyle businesses with top creators for social campaigns.',
  minWalletDeposit: 1000,
  unconfirmedDeductionFee: 100,
  baseBookingPlatformFee: 500,
  razorpayKeyId: 'rzp_test_9876543210',
  razorpaySecret: 'rzp_sec_test_secret_key',
  stripePublicKey: 'pk_test_51Nx9876543210',
  stripeSecretKey: 'sk_test_51Nx9876543210',
  paymentMode: 'test',
  bookingPolicyTerms: '1. A minimum ₹1,000 wallet deposit is mandatory to send a booking request.\n2. If the booking deal is confirmed & completed on CreatorConnect, the security deposit is refunded back to your wallet.\n3. If the booking deal is not confirmed, cancelled, or off-platform contact is attempted, a ₹100 deduction fee is applied.\n4. Direct money withdrawal is temporarily locked per platform policy (Withdrawal Feature Coming Soon).'
};

export const SEED_CREATORS: Creator[] = [];
export const SEED_BUSINESSES: Business[] = [];
export const SEED_BOOKINGS: Booking[] = [];
export const SEED_REVIEWS: Review[] = [];
export const SEED_COMMISSIONS: CommissionOverride[] = [];
