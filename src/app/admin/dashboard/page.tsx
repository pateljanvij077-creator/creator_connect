'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { db } from '@/lib/db';
import { Creator, Business, Booking } from '@/lib/constants';
import { 
  Users, 
  Building2, 
  UserCheck, 
  FileText, 
  DollarSign, 
  Percent, 
  ShieldCheck, 
  Settings, 
  TrendingUp,
  AlertTriangle,
  ArrowUpRight
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import Link from 'next/link';

export default function AdminDashboard() {
  const { user } = useAuth();
  
  const [creators, setCreators] = useState<Creator[]>([]);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  // Stats
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalBusinesses: 0,
    totalCreators: 0,
    totalBookings: 0,
    totalRevenue: 0, // Total booking amount volume
    commissionEarned: 0, // Total platform share
    verifiedCreators: 0,
    verifiedBusinesses: 0,
    pendingApprovals: 0
  });

  useEffect(() => {
    const loadAdminStats = async () => {
      setLoading(true);
      try {
        const creatorList = await db.getCreators();
        const businessList = await db.getBusinesses();
        const bookingList = await db.getBookings();

        setCreators(creatorList);
        setBusinesses(businessList);
        setBookings(bookingList);

        // Calculations
        let totalRevenueVol = 0;
        let platformCommissions = 0;
        let verifiedCre = 0;
        let verifiedBus = 0;
        let pending = 0;

        bookingList.forEach((b) => {
          if (b.status === 'completed') {
            totalRevenueVol += b.budget;
            platformCommissions += b.commissionAmount;
          }
        });

        creatorList.forEach(c => {
          if (c.isVerified) verifiedCre++;
          if (c.status === 'pending') pending++;
        });

        businessList.forEach(b => {
          if (b.isVerified) verifiedBus++;
          if (b.status === 'pending') pending++;
        });

        setStats({
          totalUsers: creatorList.length + businessList.length,
          totalBusinesses: businessList.length,
          totalCreators: creatorList.length,
          totalBookings: bookingList.length,
          totalRevenue: totalRevenueVol,
          commissionEarned: platformCommissions,
          verifiedCreators: verifiedCre,
          verifiedBusinesses: verifiedBus,
          pendingApprovals: pending
        });

      } catch (e) {
        console.error('Failed to load admin stats:', e);
      } finally {
        setLoading(false);
      }
    };

    loadAdminStats();
  }, []);

  if (loading) {
    return (
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-10 flex-grow">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[1, 2, 3, 4].map(n => (
            <div key={n} className="h-28 rounded-2xl shimmer-loading border border-border"></div>
          ))}
        </div>
        <div className="h-96 rounded-2xl shimmer-loading border border-border"></div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-10 flex-grow">
      
      {/* Header welcome banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-extrabold text-foreground font-sans">
            Admin Operations Panel
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Oversee user registrations, verify credentials, configure defaults, and monitor bookings.
          </p>
        </div>

        <div className="flex gap-2">
          <Link 
            href="/admin/users"
            className="flex items-center gap-1.5 rounded-xl border border-border bg-card px-4 py-2.5 text-xs font-bold text-foreground hover:bg-secondary/50 transition-colors shadow-sm"
          >
            <Users className="h-4 w-4" /> Manage Profiles
          </Link>
          <Link 
            href="/admin/settings"
            className="flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-xs font-bold text-primary-foreground hover:opacity-90 shadow-sm"
          >
            <Settings className="h-4 w-4" /> System Settings
          </Link>
        </div>
      </div>

      {/* Pending Approval warning banner if > 0 */}
      {stats.pendingApprovals > 0 && (
        <div className="mb-6 rounded-xl bg-yellow-500/10 border border-yellow-500/20 p-4 text-xs font-bold text-yellow-600 dark:text-yellow-500 flex items-center justify-between gap-2 animate-pulse">
          <span className="flex items-center gap-2">
            <AlertTriangle className="h-4.5 w-4.5" /> There are {stats.pendingApprovals} user profiles awaiting approval verification!
          </span>
          <Link href="/admin/users" className="hover:underline font-extrabold">Verify Now →</Link>
        </div>
      )}

      {/* Grid Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* Users */}
        <div className="glass-panel rounded-2xl border border-border p-5 flex flex-col justify-between shadow-sm">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Total Users</span>
            <span className="p-1.5 rounded-xl bg-primary/10 text-primary"><Users className="h-4 w-4" /></span>
          </div>
          <div className="mt-4">
            <h3 className="text-xl font-extrabold text-foreground">{stats.totalUsers}</h3>
            <span className="text-[9px] text-muted-foreground block mt-0.5">
              {stats.totalCreators} Creators / {stats.totalBusinesses} Businesses
            </span>
          </div>
        </div>

        {/* Bookings */}
        <div className="glass-panel rounded-2xl border border-border p-5 flex flex-col justify-between shadow-sm">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Platform Bookings</span>
            <span className="p-1.5 rounded-xl bg-indigo-500/10 text-indigo-500"><FileText className="h-4 w-4" /></span>
          </div>
          <div className="mt-4">
            <h3 className="text-xl font-extrabold text-foreground">{stats.totalBookings}</h3>
            <span className="text-[9px] text-muted-foreground block mt-0.5">Total collaboration campaigns</span>
          </div>
        </div>

        {/* Transaction Volume */}
        <div className="glass-panel rounded-2xl border border-border p-5 flex flex-col justify-between shadow-sm">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Total Volume</span>
            <span className="p-1.5 rounded-xl bg-emerald-500/10 text-emerald-500"><DollarSign className="h-4 w-4" /></span>
          </div>
          <div className="mt-4">
            <h3 className="text-xl font-extrabold text-foreground">{formatCurrency(stats.totalRevenue)}</h3>
            <span className="text-[9px] text-emerald-500 font-bold block mt-0.5">Completed budget volume</span>
          </div>
        </div>

        {/* Commission Earned */}
        <div className="glass-panel rounded-2xl border border-border p-5 flex flex-col justify-between shadow-sm bg-gradient-to-br from-indigo-500/15 to-transparent">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Platform Revenue</span>
            <span className="p-1.5 rounded-xl bg-purple-500/10 text-purple-500"><Percent className="h-4 w-4" /></span>
          </div>
          <div className="mt-4">
            <h3 className="text-xl font-extrabold text-foreground">{formatCurrency(stats.commissionEarned)}</h3>
            <span className="text-[9px] text-purple-500 font-bold block mt-0.5">Commissions earned share</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Commission Overrides info panel */}
        <div className="lg:col-span-1 glass-panel rounded-2xl border border-border p-5 flex flex-col shadow-sm">
          <div className="flex justify-between items-center border-b border-border/80 pb-3 mb-4">
            <h3 className="text-sm font-bold text-foreground">
              Verify Operations Metrics
            </h3>
          </div>
          
          <div className="flex flex-col gap-4 text-xs font-semibold">
            {/* Creator verification ratio */}
            <div>
              <div className="flex justify-between text-muted-foreground mb-1">
                <span>Verified Creators Ratio</span>
                <span className="text-foreground">{stats.verifiedCreators} / {stats.totalCreators}</span>
              </div>
              <div className="w-full bg-secondary h-2.5 rounded-full overflow-hidden border border-border/40">
                <div 
                  className="gradient-primary h-full rounded-full" 
                  style={{ width: `${(stats.verifiedCreators / (stats.totalCreators || 1)) * 100}%` }}
                ></div>
              </div>
            </div>

            {/* Business verification ratio */}
            <div>
              <div className="flex justify-between text-muted-foreground mb-1">
                <span>Verified Businesses Ratio</span>
                <span className="text-foreground">{stats.verifiedBusinesses} / {stats.totalBusinesses}</span>
              </div>
              <div className="w-full bg-secondary h-2.5 rounded-full overflow-hidden border border-border/40">
                <div 
                  className="gradient-primary h-full rounded-full" 
                  style={{ width: `${(stats.verifiedBusinesses / (stats.totalBusinesses || 1)) * 100}%` }}
                ></div>
              </div>
            </div>
            
            <div className="border-t border-border/50 pt-4 flex flex-col gap-2.5 mt-2">
              <Link 
                href="/admin/bookings" 
                className="flex items-center justify-between p-3 rounded-xl bg-secondary/35 border border-border/50 hover:bg-secondary/70 transition-colors text-foreground"
              >
                <span>Platform Commission Controls</span>
                <Percent className="h-4 w-4 text-primary" />
              </Link>
            </div>
          </div>
        </div>

        {/* Dynamic transaction list */}
        <div className="lg:col-span-2 glass-panel rounded-2xl border border-border p-5 flex flex-col shadow-sm">
          <div className="flex justify-between items-center border-b border-border/80 pb-3 mb-4">
            <h3 className="text-sm font-bold text-foreground">
              Recent System Transactions
            </h3>
            <Link 
              href="/admin/bookings" 
              className="text-[10px] font-bold text-primary hover:underline uppercase flex items-center gap-0.5"
            >
              All Transactions <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>

          {bookings.length === 0 ? (
            <div className="flex-grow flex items-center justify-center py-8 text-xs text-muted-foreground">
              No transactions logged in system.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-border text-muted-foreground font-bold uppercase tracking-wider text-[9px]">
                    <th className="py-2.5">Booking ID</th>
                    <th className="py-2.5">Business</th>
                    <th className="py-2.5">Creator</th>
                    <th className="py-2.5">Total Payment</th>
                    <th className="py-2.5">Comm. Fee</th>
                    <th className="py-2.5 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {bookings.slice(0, 6).map((booking) => (
                    <tr key={booking.id} className="hover:bg-secondary/20 transition-colors">
                      <td className="py-3 font-semibold text-foreground">{booking.id}</td>
                      <td className="py-3 text-muted-foreground">{booking.businessName}</td>
                      <td className="py-3 text-muted-foreground">{booking.creatorName}</td>
                      <td className="py-3 font-bold text-foreground">
                        {formatCurrency(booking.businessPayment)}
                      </td>
                      <td className="py-3 text-rose-500 font-semibold">
                        {formatCurrency(booking.commissionAmount)}
                      </td>
                      <td className="py-3 text-right">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                          booking.status === 'completed' 
                            ? 'bg-emerald-500/10 text-emerald-500' 
                            : booking.status === 'pending'
                            ? 'bg-yellow-500/10 text-yellow-500'
                            : 'bg-indigo-500/10 text-indigo-500'
                        }`}>
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

    </div>
  );
}
