'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { db } from '@/lib/db';
import { Booking, Creator } from '@/lib/constants';
import CreatorCard from '@/components/CreatorCard';
import { 
  DollarSign, 
  Calendar, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Eye, 
  TrendingUp, 
  ArrowUpRight, 
  Briefcase,
  Compass,
  Edit
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import Link from 'next/link';

export default function BusinessDashboard() {
  const { user, profile } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [recommendedCreators, setRecommendedCreators] = useState<Creator[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Dashboard card calculations
  const [stats, setStats] = useState({
    totalSpent: 0,
    totalBookings: 0,
    pendingBookings: 0,
    completedCampaigns: 0,
    cancelledCampaigns: 0,
    profileViews: 120 // Static mock metric
  });

  useEffect(() => {
    if (!user) return;
    
    const loadBusinessStats = async () => {
      setLoading(true);
      try {
        const allBookings = await db.getBookings();
        const businessBookings = allBookings.filter(b => b.businessId === user.uid);
        setBookings(businessBookings);

        let spent = 0;
        let pending = 0;
        let completed = 0;
        let cancelled = 0;

        businessBookings.forEach((b) => {
          if (b.status === 'completed') {
            spent += b.businessPayment; // Total money out
            completed++;
          } else if (b.status === 'pending') {
            pending++;
          } else if (b.status === 'rejected') {
            cancelled++;
          } else if (b.status === 'accepted') {
            // Active
          }
        });

        setStats({
          totalSpent: spent,
          totalBookings: businessBookings.length,
          pendingBookings: pending,
          completedCampaigns: completed,
          cancelledCampaigns: cancelled,
          profileViews: 120 + businessBookings.length * 3
        });

        // Load recommended creators
        try {
          const allCreators = await db.getCreators();
          const approved = allCreators.filter(c => c.status !== 'suspended');
          
          if (profile && 'city' in profile && (profile as any).city) {
            const targetCity = (profile as any).city.toUpperCase().trim();
            const local = approved.filter(c => c.location.city.toUpperCase() === targetCity);
            if (local.length > 0) {
              setRecommendedCreators(local.slice(0, 3));
            } else {
              const sorted = [...approved].sort((a, b) => b.rating - a.rating);
              setRecommendedCreators(sorted.slice(0, 3));
            }
          } else {
            const sorted = [...approved].sort((a, b) => b.rating - a.rating);
            setRecommendedCreators(sorted.slice(0, 3));
          }
        } catch (err) {
          console.error('Failed to load recommended creators:', err);
        }

      } catch (e) {
        console.error('Failed to load dashboard metrics:', e);
      } finally {
        setLoading(false);
      }
    };

    loadBusinessStats();
  }, [user, profile]);

  if (loading) {
    return (
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-10 flex-grow">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          {[1, 2, 3, 4].map(n => (
            <div key={n} className="h-28 rounded-2xl shimmer-loading border border-border"></div>
          ))}
        </div>
        <div className="h-96 rounded-2xl shimmer-loading border border-border"></div>
      </div>
    );
  }

  // Get status class for table items
  const getStatusBadgeClass = (status: string) => {
    const base = "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase";
    switch (status) {
      case 'completed': return `${base} bg-emerald-500/10 text-emerald-500`;
      case 'accepted': return `${base} bg-indigo-500/10 text-indigo-500`;
      case 'rejected': return `${base} bg-rose-500/10 text-rose-500`;
      default: return `${base} bg-yellow-500/10 text-yellow-500`; // pending
    }
  };

  return (
    <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-10 flex-grow">
      
      {/* Header welcome banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-extrabold text-foreground font-sans">
            Hello, {profile?.name || 'Business Owner'}
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Monitor spendings, campaigns, and direct creator bookings.
          </p>
        </div>

        <div className="flex gap-2">
          <Link 
            href="/creators"
            className="flex items-center gap-1.5 rounded-xl border border-border bg-card px-4 py-2.5 text-xs font-bold text-foreground hover:bg-secondary/50 transition-colors shadow-sm"
          >
            <Compass className="h-4 w-4" /> Find Creators
          </Link>
          <Link 
            href="/business/profile"
            className="flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-xs font-bold text-primary-foreground hover:opacity-90 shadow-sm"
          >
            <Edit className="h-4 w-4" /> Edit Profile
          </Link>
        </div>
      </div>

      {/* Grid Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4 mb-8">
        {/* Total Spent */}
        <div className="glass-panel rounded-2xl border border-border p-5 col-span-2 flex flex-col justify-between shadow-sm">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Total Spent</span>
            <span className="p-1.5 rounded-xl bg-emerald-500/10 text-emerald-500"><DollarSign className="h-4 w-4" /></span>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-extrabold text-foreground">{formatCurrency(stats.totalSpent)}</h3>
            <span className="text-[10px] text-emerald-500 font-bold flex items-center gap-0.5 mt-0.5">
              <TrendingUp className="h-3 w-3" /> +12.4% this month
            </span>
          </div>
        </div>

        {/* Bookings */}
        <div className="glass-panel rounded-2xl border border-border p-5 flex flex-col justify-between shadow-sm">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Bookings</span>
            <span className="p-1.5 rounded-xl bg-primary/10 text-primary"><Calendar className="h-4 w-4" /></span>
          </div>
          <div className="mt-4">
            <h3 className="text-xl font-extrabold text-foreground">{stats.totalBookings}</h3>
            <span className="text-[9px] text-muted-foreground block mt-0.5">Logged campaigns</span>
          </div>
        </div>

        {/* Pending Requests */}
        <div className="glass-panel rounded-2xl border border-border p-5 flex flex-col justify-between shadow-sm">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Pending</span>
            <span className="p-1.5 rounded-xl bg-yellow-500/10 text-yellow-500"><Clock className="h-4 w-4" /></span>
          </div>
          <div className="mt-4">
            <h3 className="text-xl font-extrabold text-foreground">{stats.pendingBookings}</h3>
            <span className="text-[9px] text-muted-foreground block mt-0.5">Awaiting accept</span>
          </div>
        </div>

        {/* Completed */}
        <div className="glass-panel rounded-2xl border border-border p-5 flex flex-col justify-between shadow-sm">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Completed</span>
            <span className="p-1.5 rounded-xl bg-emerald-500/10 text-emerald-500"><CheckCircle className="h-4 w-4" /></span>
          </div>
          <div className="mt-4">
            <h3 className="text-xl font-extrabold text-foreground">{stats.completedCampaigns}</h3>
            <span className="text-[9px] text-muted-foreground block mt-0.5">Finished posts</span>
          </div>
        </div>

        {/* Views */}
        <div className="glass-panel rounded-2xl border border-border p-5 flex flex-col justify-between shadow-sm">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Views</span>
            <span className="p-1.5 rounded-xl bg-purple-500/10 text-purple-500"><Eye className="h-4 w-4" /></span>
          </div>
          <div className="mt-4">
            <h3 className="text-xl font-extrabold text-foreground">{stats.profileViews}</h3>
            <span className="text-[9px] text-muted-foreground block mt-0.5">Estimated reach</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Weekly Spending Graph (Premium Custom SVG representation) */}
        <div className="lg:col-span-1 glass-panel rounded-2xl border border-border p-5 flex flex-col shadow-sm">
          <h3 className="text-sm font-bold text-foreground mb-4">
            Campaign Weekly Spending
          </h3>
          
          <div className="relative w-full h-48 bg-secondary/10 rounded-xl border border-border/40 flex items-end p-4">
            {/* SVG Wave/Bar graphic */}
            <svg className="w-full h-[80%]" viewBox="0 0 100 100" preserveAspectRatio="none">
              <defs>
                <linearGradient id="spentGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366f1" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#6366f1" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              {/* Path area */}
              <path 
                d="M 0 80 Q 25 30 50 60 T 100 20 L 100 100 L 0 100 Z" 
                fill="url(#spentGrad)" 
              />
              {/* Stroke line */}
              <path 
                d="M 0 80 Q 25 30 50 60 T 100 20" 
                fill="none" 
                stroke="#6366f1" 
                strokeWidth="2" 
              />
              {/* Data points */}
              <circle cx="25" cy="45" r="2.5" fill="#a855f7" />
              <circle cx="50" cy="60" r="2.5" fill="#a855f7" />
              <circle cx="75" cy="35" r="2.5" fill="#a855f7" />
              <circle cx="100" cy="20" r="2.5" fill="#a855f7" />
            </svg>
            
            {/* Absolute overlay indicators */}
            <div className="absolute top-4 left-4 text-xs font-bold text-muted-foreground">
              Peak: ₹15,000+
            </div>
          </div>

          <div className="flex justify-between text-[10px] text-muted-foreground font-bold mt-3 px-2">
            <span>WK 1</span>
            <span>WK 2</span>
            <span>WK 3</span>
            <span>WK 4</span>
          </div>
        </div>

        {/* Recent Activity / Active Bookings list */}
        <div className="lg:col-span-2 glass-panel rounded-2xl border border-border p-5 flex flex-col shadow-sm">
          <div className="flex justify-between items-center border-b border-border/80 pb-3 mb-4">
            <h3 className="text-sm font-bold text-foreground">
              Recent Collaborations
            </h3>
            <Link 
              href="/business/bookings" 
              className="text-[10px] font-bold text-primary hover:underline uppercase flex items-center gap-0.5"
            >
              Manage Bookings <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>

          {bookings.length === 0 ? (
            <div className="flex-grow flex flex-col items-center justify-center py-10 text-center">
              <Briefcase className="h-8 w-8 text-muted-foreground/60 mb-2" />
              <p className="text-xs text-muted-foreground">No collaborations initiated yet.</p>
              <Link 
                href="/creators" 
                className="mt-3 text-xs font-bold text-primary hover:underline"
              >
                Hire your first creator now
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-border text-muted-foreground font-bold">
                    <th className="py-2.5">Creator</th>
                    <th className="py-2.5">Campaign Name</th>
                    <th className="py-2.5">Date</th>
                    <th className="py-2.5">Cost</th>
                    <th className="py-2.5 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {bookings.slice(0, 5).map((booking) => (
                    <tr key={booking.id} className="hover:bg-secondary/20 transition-colors">
                      <td className="py-3 font-semibold text-foreground">{booking.creatorName}</td>
                      <td className="py-3 text-muted-foreground truncate max-w-[150px]">{booking.campaignTitle}</td>
                      <td className="py-3 text-muted-foreground">{booking.campaignDate}</td>
                      <td className="py-3 font-bold text-foreground">
                        {formatCurrency(booking.businessPayment)}
                      </td>
                      <td className="py-3 text-right">
                        <span className={getStatusBadgeClass(booking.status)}>
                          {booking.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>

      {/* Recommended Creators Section */}
      <div className="mt-12 pt-8 border-t border-border/80">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-base font-extrabold text-foreground font-sans">
              {profile && 'city' in profile && (profile as any).city
                ? `Recommended Creators in ${(profile as any).city}`
                : 'Recommended Creators'}
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Hire vetted local creators directly for your next campaign.
            </p>
          </div>
          <Link 
            href="/creators" 
            className="text-[10px] font-bold text-primary hover:underline uppercase flex items-center gap-0.5"
          >
            Explore Directory <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {recommendedCreators.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border p-8 text-center text-xs text-muted-foreground">
            No creators registered on the platform yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {recommendedCreators.map((creator) => (
              <CreatorCard key={creator.uid} creator={creator} localCity={profile && 'city' in profile ? (profile as any).city : undefined} />
            ))}
          </div>
        )}
      </div>

    </div>
  );
}

