'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { db } from '@/lib/db';
import { Booking, Business } from '@/lib/constants';
import { 
  DollarSign, 
  Calendar, 
  Clock, 
  CheckCircle, 
  XCircle, 
  TrendingUp, 
  ArrowUpRight, 
  FileText,
  Heart,
  MessageCircle,
  Inbox,
  User
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import Link from 'next/link';

export default function CreatorDashboard() {
  const { user, profile } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Dashboard stats
  const [stats, setStats] = useState({
    totalEarnings: 0,
    pendingRequests: 0,
    activeCampaigns: 0,
    completedJobs: 0,
    rating: 5.0
  });

  const loadCreatorStats = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const allBookings = await db.getBookings();
      const creatorBookings = allBookings.filter(b => b.creatorId === user.uid);
      setBookings(creatorBookings);

      let earnings = 0;
      let pending = 0;
      let active = 0;
      let completed = 0;

      creatorBookings.forEach((b) => {
        if (b.status === 'completed') {
          earnings += b.creatorEarnings; // Net creator earnings
          completed++;
        } else if (b.status === 'pending') {
          pending++;
        } else if (b.status === 'accepted') {
          active++;
        }
      });

      setStats({
        totalEarnings: earnings,
        pendingRequests: pending,
        activeCampaigns: active,
        completedJobs: completed,
        rating: profile && 'rating' in profile ? (profile as any).rating : 5.0
      });
    } catch (e) {
      console.error('Failed to load creator metrics:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCreatorStats();
  }, [user, profile]);

  const handleAction = async (bookingId: string, action: 'accepted' | 'rejected' | 'completed') => {
    try {
      const booking = bookings.find(b => b.id === bookingId);
      if (!booking) return;

      const updateData: Partial<Booking> = { status: action };
      if (action === 'completed') {
        updateData.paymentStatus = 'paid';
      }

      await db.updateBooking(bookingId, updateData);

      // Create Notification for the Business Owner
      const notificationTitle = action === 'accepted' ? 'Campaign Accepted!' : action === 'rejected' ? 'Campaign Declined' : 'Campaign Completed!';
      const notificationMsg = action === 'accepted'
        ? `${profile?.name || 'A creator'} has accepted your campaign "${booking.campaignTitle}". Check direct links to connect on WhatsApp / Instagram.`
        : action === 'rejected'
        ? `${profile?.name || 'A creator'} has declined your campaign "${booking.campaignTitle}". Payout will be refunded.`
        : `${profile?.name || 'A creator'} has marked the campaign "${booking.campaignTitle}" as completed. Please confirm to close the campaign.`;

      await db.createNotification(booking.businessId, notificationTitle, notificationMsg, `booking_${action}`);

      // Refresh stats
      await loadCreatorStats();
    } catch (e) {
      console.error(`Failed to execute booking action ${action}:`, e);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-10 flex-grow">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          {[1, 2, 3, 4, 5].map(n => (
            <div key={n} className="h-28 rounded-2xl shimmer-loading border border-border"></div>
          ))}
        </div>
        <div className="h-96 rounded-2xl shimmer-loading border border-border"></div>
      </div>
    );
  }

  const pendingRequestsList = bookings.filter(b => b.status === 'pending');

  return (
    <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-10 flex-grow">
      
      {/* Header welcome banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-extrabold text-foreground font-sans">
            Hello, {profile?.name || 'Content Creator'}
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Manage your incoming campaign bookings, earnings, and social links.
          </p>
        </div>

        <div className="flex gap-2">
          <Link 
            href="/creator/links"
            className="flex items-center gap-1.5 rounded-xl border border-border bg-card px-4 py-2.5 text-xs font-bold text-foreground hover:bg-secondary/50 transition-colors shadow-sm"
          >
            <Heart className="h-4 w-4 text-rose-500" /> Marketing Links
          </Link>
          <Link 
            href="/creator/profile"
            className="flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-xs font-bold text-primary-foreground hover:opacity-90 shadow-sm"
          >
            <User className="h-4 w-4" /> Edit Profile
          </Link>
        </div>
      </div>

      {/* Grid Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        {/* Earnings */}
        <div className="glass-panel rounded-2xl border border-border p-5 col-span-2 sm:col-span-1 flex flex-col justify-between shadow-sm bg-gradient-to-br from-indigo-500/10 to-transparent">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Earnings (Net)</span>
            <span className="p-1.5 rounded-xl bg-emerald-500/10 text-emerald-500"><DollarSign className="h-4 w-4" /></span>
          </div>
          <div className="mt-4">
            <h3 className="text-xl font-extrabold text-foreground">{formatCurrency(stats.totalEarnings)}</h3>
            <span className="text-[9px] text-emerald-500 font-bold block mt-0.5">After platform commission</span>
          </div>
        </div>

        {/* Pending Requests */}
        <div className="glass-panel rounded-2xl border border-border p-5 flex flex-col justify-between shadow-sm">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Requests</span>
            <span className="p-1.5 rounded-xl bg-yellow-500/10 text-yellow-500"><Inbox className="h-4 w-4" /></span>
          </div>
          <div className="mt-4">
            <h3 className="text-xl font-extrabold text-foreground">{stats.pendingRequests}</h3>
            <span className="text-[9px] text-muted-foreground block mt-0.5">Awaiting decision</span>
          </div>
        </div>

        {/* Active Collabs */}
        <div className="glass-panel rounded-2xl border border-border p-5 flex flex-col justify-between shadow-sm">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Active</span>
            <span className="p-1.5 rounded-xl bg-indigo-500/10 text-indigo-500"><Clock className="h-4 w-4" /></span>
          </div>
          <div className="mt-4">
            <h3 className="text-xl font-extrabold text-foreground">{stats.activeCampaigns}</h3>
            <span className="text-[9px] text-muted-foreground block mt-0.5">Work in progress</span>
          </div>
        </div>

        {/* Completed Jobs */}
        <div className="glass-panel rounded-2xl border border-border p-5 flex flex-col justify-between shadow-sm">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Completed</span>
            <span className="p-1.5 rounded-xl bg-emerald-500/10 text-emerald-500"><CheckCircle className="h-4 w-4" /></span>
          </div>
          <div className="mt-4">
            <h3 className="text-xl font-extrabold text-foreground">{stats.completedJobs}</h3>
            <span className="text-[9px] text-muted-foreground block mt-0.5">Total reviews</span>
          </div>
        </div>

        {/* Average Rating */}
        <div className="glass-panel rounded-2xl border border-border p-5 flex flex-col justify-between shadow-sm">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Rating</span>
            <span className="p-1.5 rounded-xl bg-yellow-500/10 text-yellow-500">★</span>
          </div>
          <div className="mt-4">
            <h3 className="text-xl font-extrabold text-foreground">{stats.rating} / 5</h3>
            <span className="text-[9px] text-muted-foreground block mt-0.5">Community rating</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Earnings graph */}
        <div className="lg:col-span-1 glass-panel rounded-2xl border border-border p-5 flex flex-col shadow-sm">
          <h3 className="text-sm font-bold text-foreground mb-4">
            Monthly Payouts
          </h3>
          
          <div className="relative w-full h-48 bg-secondary/10 rounded-xl border border-border/40 flex items-end p-4">
            <svg className="w-full h-[70%]" viewBox="0 0 100 100" preserveAspectRatio="none">
              <defs>
                <linearGradient id="earningsGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#a855f7" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#a855f7" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              <path 
                d="M 0 90 Q 30 70 60 40 T 100 10 L 100 100 L 0 100 Z" 
                fill="url(#earningsGrad)" 
              />
              <path 
                d="M 0 90 Q 30 70 60 40 T 100 10" 
                fill="none" 
                stroke="#a855f7" 
                strokeWidth="2.5" 
              />
            </svg>
            <div className="absolute top-4 left-4 text-xs font-bold text-emerald-500">
              Avg: +₹12,500/Mo
            </div>
          </div>

          <div className="flex justify-between text-[10px] text-muted-foreground font-bold mt-3 px-2">
            <span>MAY</span>
            <span>JUN</span>
            <span>JUL</span>
          </div>
        </div>

        {/* Incoming requests details */}
        <div className="lg:col-span-2 glass-panel rounded-2xl border border-border p-5 flex flex-col shadow-sm">
          <div className="flex justify-between items-center border-b border-border/80 pb-3 mb-4">
            <h3 className="text-sm font-bold text-foreground">
              Incoming Campaign Requests ({pendingRequestsList.length})
            </h3>
            <Link 
              href="/creator/bookings" 
              className="text-[10px] font-bold text-primary hover:underline uppercase flex items-center gap-0.5"
            >
              All Bookings <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>

          {pendingRequestsList.length === 0 ? (
            <div className="flex-grow flex flex-col items-center justify-center py-12 text-center text-xs text-muted-foreground">
              <Clock className="h-8 w-8 text-muted-foreground/60 mb-2" />
              <span>No pending booking requests. Ensure packages are up to date!</span>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {pendingRequestsList.map((booking) => (
                <div 
                  key={booking.id} 
                  className="rounded-xl border border-border bg-background p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:border-primary/50 transition-colors"
                >
                  <div className="flex flex-col gap-1 text-xs">
                    <h4 className="font-bold text-foreground">{booking.campaignTitle}</h4>
                    <p className="text-muted-foreground text-[11px] leading-relaxed">
                      By <strong className="text-foreground">{booking.businessName}</strong> • Date: {booking.campaignDate}
                    </p>
                    <p className="text-muted-foreground italic text-[11px] mt-0.5 truncate max-w-sm">
                      &quot;{booking.campaignDescription}&quot;
                    </p>
                    <span className="text-xs font-extrabold text-primary mt-1">
                      Earnings: {formatCurrency(booking.creatorEarnings)}
                    </span>
                  </div>

                  <div className="flex gap-2 w-full sm:w-auto">
                    <button
                      onClick={() => handleAction(booking.id, 'rejected')}
                      className="flex-1 sm:flex-none h-8 rounded-lg border border-rose-500/30 text-rose-500 bg-rose-500/10 hover:bg-rose-500/20 text-[10px] font-bold px-3 transition-colors uppercase"
                    >
                      Decline
                    </button>
                    <button
                      onClick={() => handleAction(booking.id, 'accepted')}
                      className="flex-1 sm:flex-none h-8 rounded-lg bg-primary text-white hover:opacity-90 text-[10px] font-bold px-3 transition-colors uppercase"
                    >
                      Accept
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

    </div>
  );
}

