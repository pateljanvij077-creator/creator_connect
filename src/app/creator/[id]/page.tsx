'use client';

import React, { use, useState, useEffect } from 'react';
import { Creator, Review, Booking } from '@/lib/constants';
import { db } from '@/lib/db';
import { useAuth } from '@/lib/auth';
import BookingModal from '@/components/BookingModal';
import { 
  Star, 
  MapPin, 
  CheckCircle, 
  Mail, 
  Phone, 
  Globe, 
  MessageCircle,
  Briefcase, 
  Calendar, 
  ChevronRight,
  TrendingUp, 
  Users, 
  Play,
  ArrowLeft,
  Camera,
  Lock,
  Clock,
  CreditCard
} from 'lucide-react';
import { 
  InstagramIcon, 
  FacebookIcon, 
  YoutubeIcon, 
  LinkedinIcon 
} from '@/components/SocialIcons';
import { formatCurrency, formatFollowers } from '@/lib/utils';
import Link from 'next/link';

interface CreatorProfileProps {
  params: Promise<{ id: string }>;
}

export default function CreatorProfile({ params }: CreatorProfileProps) {
  const resolvedParams = use(params);
  const { id } = resolvedParams;
  const { user } = useAuth();

  const [creator, setCreator] = useState<Creator | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [payingContact, setPayingContact] = useState(false);

  // Load creator and reviews
  useEffect(() => {
    const loadProfileData = async () => {
      setLoading(true);
      try {
        const creatorData = await db.getCreator(id);
        setCreator(creatorData);
        
        const reviewsList = await db.getReviews(id);
        setReviews(reviewsList);
      } catch (e) {
        console.error('Failed to load creator profile:', e);
      } finally {
        setLoading(false);
      }
    };
    loadProfileData();
  }, [id]);

  const loadUserBookings = async () => {
    if (!user) return;
    try {
      const userBookings = await db.getBookings(user.uid, 'business');
      setBookings(userBookings.filter(b => b.creatorId === id));
    } catch (e) {
      console.error('Failed to load bookings:', e);
    }
  };

  useEffect(() => {
    loadUserBookings();
  }, [id, user]);

  if (loading) {
    return (
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-12 flex-grow">
        <div className="h-96 rounded-2xl shimmer-loading border border-border mb-6"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="h-60 rounded-2xl shimmer-loading border border-border md:col-span-2"></div>
          <div className="h-60 rounded-2xl shimmer-loading border border-border"></div>
        </div>
      </div>
    );
  }

  if (!creator) {
    return (
      <div className="flex-grow flex flex-col items-center justify-center text-center p-12">
        <h2 className="text-xl font-bold text-foreground mb-2">Creator not found</h2>
        <p className="text-xs text-muted-foreground mb-4">
          This profile might be suspended, pending approval, or does not exist.
        </p>
        <Link href="/creators" className="rounded-xl bg-primary px-4 py-2 text-xs font-bold text-primary-foreground">
          Back to Directory
        </Link>
      </div>
    );
  }

  // Get social handles from URLs for direct messages
  const getHandleOrPhone = (url: string = '') => {
    try {
      if (url.includes('wa.me') || url.startsWith('tel:')) {
        return url.replace('https://wa.me/', '').replace('tel:', '');
      }
      const parts = url.split('/');
      return parts[parts.length - 1] || url;
    } catch {
      return url;
    }
  };

  const isAdminUser = user?.role === 'admin';
  const isSelf = user?.uid === creator?.uid;
  const hasAcceptedBooking = bookings.some(b => b.status === 'accepted' || b.status === 'completed');
  const hasPendingBooking = bookings.some(b => b.status === 'pending');
  const showContacts = isAdminUser || isSelf || hasAcceptedBooking;

  const whatsappPhone = creator.socials.whatsapp || creator.socials.snapchat || '';
  const whatsappUrl = `https://wa.me/${whatsappPhone.replace(/[^0-9]/g, '')}?text=Hi%20${encodeURIComponent(creator.name)}%2C%20we%20saw%20your%20profile%20on%20CreatorConnect%20and%20would%20love%20to%20collaborate!`;

  return (
    <div className="flex-grow pb-16 gradient-bg">
      {/* 1. COVER HERO HEADER */}
      <div className="relative h-64 sm:h-80 w-full bg-muted border-b border-border">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img 
          src={creator.coverImage} 
          alt={`${creator.name} Cover`} 
          className="h-full w-full object-cover opacity-80 dark:opacity-50"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent"></div>
        
        {/* Back navigation */}
        <div className="absolute top-6 left-6 z-10">
          <Link 
            href="/creators" 
            className="flex items-center gap-1.5 rounded-full glass-panel px-4 py-2 text-xs font-bold text-foreground hover:bg-secondary/80 transition-colors shadow-sm"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Directory
          </Link>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 -mt-20 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* LEFT COLUMN: ABOUT / METRICS / PORTFOLIO */}
          <div className="lg:col-span-2 flex flex-col gap-8">
            {/* Base Profile Summary */}
            <div className="glass-panel rounded-2xl border border-border p-6 sm:p-8 shadow-sm">
              <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-5 mb-6">
                {/* Profile Photo */}
                <div className="h-28 w-28 overflow-hidden rounded-full border-4 border-card bg-muted shadow-md flex-shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={creator.photo} alt={creator.name} className="h-full w-full object-cover" />
                </div>

                <div className="flex-grow flex flex-col gap-1.5">
                  <div className="flex flex-col sm:flex-row items-center gap-2">
                    <h1 className="text-2xl font-extrabold text-foreground font-sans">
                      {creator.name}
                    </h1>
                    {creator.isVerified && (
                      <span className="inline-flex items-center gap-1 bg-primary/10 px-2 py-0.5 rounded-full text-[10px] font-bold text-primary">
                        <CheckCircle className="h-3 w-3 fill-primary text-white" /> Verified
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-center sm:justify-start gap-1 text-xs text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                    <span>{creator.location.city}, {creator.location.state}</span>
                  </div>

                  <p className="text-xs text-muted-foreground mt-2 leading-relaxed max-w-xl">
                    {creator.bio || 'Professional content creator ready for local business collaborations.'}
                  </p>
                </div>
              </div>

              {/* Analytics row */}
              <div className="grid grid-cols-3 gap-4 border-t border-border/70 pt-6 text-center">
                <div className="bg-secondary/20 p-3 rounded-xl border border-border/30">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">
                    Followers
                  </span>
                  <p className="text-lg font-extrabold text-primary flex items-center justify-center gap-1 font-sans">
                    <Users className="h-4.5 w-4.5" /> {formatFollowers(creator.followers)}
                  </p>
                </div>
                <div className="bg-secondary/20 p-3 rounded-xl border border-border/30">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">
                    Avg Reels Views
                  </span>
                  <p className="text-lg font-extrabold text-foreground flex items-center justify-center gap-1 font-sans">
                    <Play className="h-4.5 w-4.5" /> {formatFollowers(creator.averageViews)}
                  </p>
                </div>
                <div className="bg-secondary/20 p-3 rounded-xl border border-border/30">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">
                    Engagement
                  </span>
                  <p className="text-lg font-extrabold text-foreground flex items-center justify-center gap-1 font-sans">
                    <TrendingUp className="h-4.5 w-4.5" /> {creator.engagementRate}%
                  </p>
                </div>
              </div>

              {/* Category tags & Languages */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6 pt-6 border-t border-border/40 text-xs">
                <div>
                  <h4 className="font-bold text-muted-foreground uppercase tracking-wider mb-2 text-[10px]">Categories</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {creator.categories.map((cat) => (
                      <span key={cat} className="px-2.5 py-0.5 rounded-full bg-secondary text-foreground font-semibold">
                        {cat}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="font-bold text-muted-foreground uppercase tracking-wider mb-2 text-[10px]">Languages</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {creator.languages.map((l) => (
                      <span key={l} className="px-2.5 py-0.5 rounded-full bg-secondary text-foreground font-semibold">
                        {l}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Portfolio Gallery */}
            {creator.portfolio && creator.portfolio.length > 0 && (
              <div className="glass-panel rounded-2xl border border-border p-6 shadow-sm">
                <h3 className="text-base font-bold text-foreground mb-4 flex items-center gap-1.5">
                  <Camera className="h-4.5 w-4.5 text-primary" /> Portfolio Gallery
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {creator.portfolio.map((imgUrl, index) => (
                    <div key={index} className="aspect-4/3 overflow-hidden rounded-xl bg-muted border border-border group relative">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img 
                        src={imgUrl} 
                        alt={`${creator.name} Portfolio item ${index + 1}`} 
                        className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Audience Geography */}
            {creator.audienceCities && creator.audienceCities.length > 0 && (
              <div className="glass-panel rounded-2xl border border-border p-6 shadow-sm">
                <h3 className="text-base font-bold text-foreground mb-4 flex items-center gap-1.5">
                  <MapPin className="h-4.5 w-4.5 text-primary" /> Audience Demographics (Cities)
                </h3>
                <div className="flex flex-col gap-3">
                  {creator.audienceCities.map((item, idx) => (
                    <div key={idx}>
                      <div className="flex justify-between text-xs font-semibold text-foreground mb-1">
                        <span>{item.name}</span>
                        <span>{item.percentage}%</span>
                      </div>
                      <div className="w-full bg-secondary h-2.5 rounded-full overflow-hidden border border-border/40">
                        <div 
                          className="gradient-primary h-full rounded-full" 
                          style={{ width: `${item.percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Reviews Section */}
            <div className="glass-panel rounded-2xl border border-border p-6 shadow-sm">
              <h3 className="text-base font-bold text-foreground mb-4 flex items-center gap-2 border-b border-border pb-3">
                <Star className="h-4.5 w-4.5 text-yellow-500 fill-yellow-500" /> 
                <span>Reviews & Ratings ({reviews.length})</span>
                <span className="ml-auto text-xs font-bold bg-yellow-500/10 text-yellow-500 px-2 py-0.5 rounded-lg flex items-center gap-1">
                  {creator.rating} ★
                </span>
              </h3>
              
              {reviews.length === 0 ? (
                <div className="text-center py-6 text-xs text-muted-foreground">
                  No reviews posted yet for this creator.
                </div>
              ) : (
                <div className="flex flex-col gap-4 divide-y divide-border/60">
                  {reviews.map((r) => (
                    <div key={r.id} className="pt-4 first:pt-0">
                      <div className="flex justify-between items-center mb-1.5">
                        <span className="text-xs font-bold text-foreground">
                          {r.reviewerRole === 'business' ? 'Business Collaboration' : 'Creator Review'}
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          {new Date(r.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      
                      <div className="flex gap-0.5 mb-2">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star 
                            key={s} 
                            className={`h-3.5 w-3.5 ${
                              s <= r.rating ? 'fill-yellow-500 text-yellow-500' : 'text-muted-foreground/30'
                            }`}
                          />
                        ))}
                      </div>

                      <p className="text-xs text-muted-foreground italic leading-relaxed">
                        &quot;{r.comment}&quot;
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN: DIRECT CONTACTS & PACKAGES */}
          <div className="flex flex-col gap-8">
            {/* Direct Contacts Panel */}
            <div className="glass-panel rounded-2xl border border-border p-6 shadow-sm flex flex-col gap-4 sticky top-24">
              <h3 className="font-bold text-foreground text-sm border-b border-border/80 pb-2 flex items-center gap-1.5">
                <MessageCircle className="h-4.5 w-4.5 text-primary" /> Contact Collaborator
              </h3>

              {showContacts ? (
                <>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    We support direct connections. Contact this creator directly using your preferred platform.
                  </p>
                  <div className="flex flex-col gap-2">
                {/* WhatsApp */}
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-11 items-center justify-between rounded-xl bg-emerald-500 px-4 text-xs font-bold text-white shadow-sm hover:bg-emerald-600 transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <MessageCircle className="h-4.5 w-4.5" /> Message on WhatsApp
                  </span>
                  <span className="text-[10px] opacity-75">{getHandleOrPhone(whatsappPhone)}</span>
                </a>

                {/* Instagram Direct */}
                {creator.socials.instagram && (
                  <a
                    href={creator.socials.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-11 items-center justify-between rounded-xl bg-gradient-to-r from-purple-500 via-pink-500 to-yellow-500 px-4 text-xs font-bold text-white shadow-sm hover:opacity-90 transition-opacity"
                  >
                    <span className="flex items-center gap-2">
                      <InstagramIcon className="h-4.5 w-4.5" /> Instagram Direct
                    </span>
                    <span className="text-[10px] opacity-75">@{getHandleOrPhone(creator.socials.instagram)}</span>
                  </a>
                )}

                {/* Email Direct */}
                {(creator.socials.email || creator.uid) && (
                  <a
                    href={`mailto:${creator.socials.email || 'aarav@creator.com'}`}
                    className="flex h-11 items-center justify-between rounded-xl border border-border bg-card px-4 text-xs font-bold text-foreground hover:bg-secondary/50 transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      <Mail className="h-4.5 w-4.5 text-muted-foreground" /> Send Email Inquiry
                    </span>
                    <span className="text-[10px] text-muted-foreground truncate max-w-[120px]">
                      {creator.socials.email || 'Contact'}
                    </span>
                  </a>
                )}

                {/* Website Link */}
                {creator.socials.website && (
                  <a
                    href={creator.socials.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-11 items-center justify-between rounded-xl border border-border bg-card px-4 text-xs font-bold text-foreground hover:bg-secondary/50 transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      <Globe className="h-4.5 w-4.5 text-muted-foreground" /> View Website
                    </span>
                    <span className="text-[10px] text-muted-foreground truncate max-w-[120px]">
                      {getHandleOrPhone(creator.socials.website)}
                    </span>
                  </a>
                )}

                {/* Phone */}
                {creator.socials.snapchat && (
                  <a
                    href={`tel:${creator.socials.snapchat}`}
                    className="flex h-11 items-center justify-between rounded-xl border border-border bg-card px-4 text-xs font-bold text-foreground hover:bg-secondary/50 transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      <Phone className="h-4.5 w-4.5 text-muted-foreground" /> Call Collaborator
                    </span>
                    <span className="text-[10px] text-muted-foreground">{creator.socials.snapchat}</span>
                  </a>
                )}
              </div>
                </>
              ) : hasPendingBooking ? (
                <div className="flex flex-col items-center justify-center py-6 text-center bg-secondary/30 rounded-xl border border-border">
                  <Clock className="h-8 w-8 text-amber-500 mb-2" />
                  <h4 className="font-bold text-foreground text-sm mb-1">Request Pending</h4>
                  <p className="text-xs text-muted-foreground max-w-[200px]">
                    Your booking request has been sent. Contact information will be revealed once the creator accepts.
                  </p>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-6 text-center bg-secondary/30 rounded-xl border border-border">
                  <Lock className="h-8 w-8 text-muted-foreground mb-2" />
                  <h4 className="font-bold text-foreground text-sm mb-1">Contacts Locked</h4>
                  <p className="text-xs text-muted-foreground max-w-[200px] mb-4">
                    Send a campaign booking request first. Once accepted, direct contacts will be revealed.
                  </p>
                  <button
                    onClick={() => {
                      if (!user) {
                        alert('Please sign in as a Business Owner to place a booking request.');
                        return;
                      }
                      if (user.role !== 'business') {
                        alert('Only Business Owner accounts can place campaign booking requests.');
                        return;
                      }
                      setBookingOpen(true);
                    }}
                    className="w-full h-10 rounded-xl gradient-primary text-xs font-bold text-white hover:opacity-90 transition-opacity"
                  >
                    Send Booking Request
                  </button>
                </div>
              )}
            </div>

            {/* Campaign Pricing Packages */}
            <div className="flex flex-col gap-4">
              <h3 className="font-bold text-foreground text-sm flex items-center gap-1.5">
                <Briefcase className="h-4.5 w-4.5 text-primary" /> Collaborations Packages
              </h3>
              
              {creator.pricingPackages.map((p, idx) => (
                <div 
                  key={idx}
                  className="rounded-2xl border border-border bg-card p-5 flex flex-col gap-4 shadow-sm hover:border-primary/50 transition-colors"
                >
                  <div>
                    <h4 className="font-bold text-foreground text-sm mb-1">{p.name}</h4>
                    <p className="text-xs text-muted-foreground leading-relaxed mb-3">
                      {p.description}
                    </p>
                    <span className="text-lg font-extrabold text-primary">
                      {formatCurrency(p.price)}
                    </span>
                  </div>

                  <button
                    onClick={() => {
                      if (!user) {
                        alert('Please sign in as a Business Owner to place a booking request.');
                        return;
                      }
                      if (user.role !== 'business') {
                        alert('Only Business Owner accounts can place campaign booking requests.');
                        return;
                      }
                      setBookingOpen(true);
                    }}
                    className="w-full h-10 rounded-xl gradient-primary text-xs font-bold text-white hover:opacity-90 transition-opacity"
                  >
                    Book Creator
                  </button>
                </div>
              ))}
            </div>

          </div>

        </div>
      </div>

      {/* Booking Form Overlay */}
      {bookingOpen && (
        <BookingModal 
          creator={creator} 
          isOpen={bookingOpen} 
          onClose={() => setBookingOpen(false)}
          onSuccess={() => {
            setBookingOpen(false);
            loadUserBookings();
          }}
        />
      )}
    </div>
  );
}
