'use client';

import React, { useState, useEffect } from 'react';
import { db } from '@/lib/db';
import { Creator, Business } from '@/lib/constants';
import { 
  Users, 
  Building2, 
  Search, 
  CheckCircle, 
  XCircle, 
  Trash2, 
  Check, 
  AlertTriangle,
  RefreshCw,
  Eye,
  Award
} from 'lucide-react';
import { formatFollowers } from '@/lib/utils';
import Link from 'next/link';

export default function AdminUserManagement() {
  const [activeTab, setActiveTab] = useState<'creators' | 'businesses'>('creators');
  const [creators, setCreators] = useState<Creator[]>([]);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const creatorList = await db.getCreators();
      const businessList = await db.getBusinesses();
      setCreators(creatorList);
      setBusinesses(businessList);
    } catch (e) {
      console.error('Failed to load users database:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleUpdateStatus = async (uid: string, type: 'creator' | 'business', newStatus: 'approved' | 'suspended') => {
    try {
      if (type === 'creator') {
        await db.saveCreator(uid, { status: newStatus });
        // Send Notification
        await db.createNotification(
          uid,
          newStatus === 'approved' ? 'Profile Approved!' : 'Profile Suspended',
          newStatus === 'approved' 
            ? 'Congratulations! Your CreatorConnect profile has been approved. You are now visible to local businesses.'
            : 'Your profile has been temporarily suspended by administrative review. Contact support.',
          'admin_approval'
        );
      } else {
        await db.saveBusiness(uid, { status: newStatus });
        // Send Notification
        await db.createNotification(
          uid,
          newStatus === 'approved' ? 'Account Activated!' : 'Account Suspended',
          newStatus === 'approved' 
            ? 'Your Business Owner profile has been verified and approved. You can now place campaign bookings.'
            : 'Your account has been suspended by administrative review. Contact support.',
          'admin_approval'
        );
      }
      await loadUsers();
    } catch (e) {
      console.error('Failed to update status:', e);
    }
  };

  const handleToggleVerification = async (uid: string, type: 'creator' | 'business', currentVal: boolean) => {
    try {
      if (type === 'creator') {
        await db.saveCreator(uid, { isVerified: !currentVal });
      } else {
        await db.saveBusiness(uid, { isVerified: !currentVal });
      }
      await loadUsers();
    } catch (e) {
      console.error('Failed to toggle verification:', e);
    }
  };

  const handleDelete = async (uid: string, type: 'creator' | 'business') => {
    if (!confirm('Are you sure you want to permanently delete this user profile?')) return;
    try {
      if (type === 'creator') {
        const raw = localStorage.getItem('cc_creators') || '[]';
        const filtered = JSON.parse(raw).filter((c: any) => c.uid !== uid);
        localStorage.setItem('cc_creators', JSON.stringify(filtered));
      } else {
        const raw = localStorage.getItem('cc_businesses') || '[]';
        const filtered = JSON.parse(raw).filter((b: any) => b.uid !== uid);
        localStorage.setItem('cc_businesses', JSON.stringify(filtered));
      }
      await loadUsers();
    } catch (e) {
      console.error('Failed to delete profile:', e);
    }
  };

  // Filter lists based on search
  const filteredCreators = creators.filter((c) => {
    const q = searchQuery.toLowerCase().trim();
    return c.name.toLowerCase().includes(q) || c.location.city.toLowerCase().includes(q) || c.uid.includes(q);
  });

  const filteredBusinesses = businesses.filter((b) => {
    const q = searchQuery.toLowerCase().trim();
    return b.name.toLowerCase().includes(q) || b.city.toLowerCase().includes(q) || b.uid.includes(q);
  });

  return (
    <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-10 flex-grow">
      
      {/* Header welcome banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-extrabold text-foreground font-sans">
            User Profiles Registry
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Approve new profiles, suspend accounts, and distribute Verification Badges.
          </p>
        </div>

        <button 
          onClick={loadUsers}
          className="flex items-center gap-1.5 rounded-xl border border-border bg-card px-4 py-2 text-xs font-semibold text-foreground hover:bg-secondary/50 shadow-sm"
        >
          <RefreshCw className="h-3.5 w-3.5" /> Refresh List
        </button>
      </div>

      {/* Control row */}
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 mb-6">
        {/* Tabs */}
        <div className="flex bg-secondary/60 p-1 rounded-xl border border-border/80 self-start">
          <button
            onClick={() => { setActiveTab('creators'); setSearchQuery(''); }}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'creators'
                ? 'bg-card text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Users className="h-4 w-4" /> Content Creators ({filteredCreators.length})
          </button>
          <button
            onClick={() => { setActiveTab('businesses'); setSearchQuery(''); }}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'businesses'
                ? 'bg-card text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Building2 className="h-4 w-4" /> Local Businesses ({filteredBusinesses.length})
          </button>
        </div>

        {/* Search */}
        <div className="w-full sm:w-80 flex items-center gap-2 px-3 bg-card rounded-xl border border-border">
          <Search className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          <input
            type="text"
            placeholder={activeTab === 'creators' ? 'Search creator name or city...' : 'Search business name or city...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent border-0 py-2.5 text-xs text-foreground focus:outline-none placeholder-muted-foreground"
          />
        </div>
      </div>

      {/* Users table */}
      <div className="glass-panel rounded-2xl border border-border p-5 shadow-sm">
        {loading ? (
          <div className="flex flex-col gap-3 py-6">
            {[1, 2, 3].map(n => (
              <div key={n} className="h-14 rounded-xl shimmer-loading border border-border"></div>
            ))}
          </div>
        ) : activeTab === 'creators' ? (
          /* CREATORS TABLE */
          filteredCreators.length === 0 ? (
            <div className="text-center py-8 text-xs text-muted-foreground">No content creators found matching search.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-border text-muted-foreground font-bold uppercase tracking-wider text-[9px] pb-2">
                    <th className="py-2.5">Creator Name</th>
                    <th className="py-2.5">Location</th>
                    <th className="py-2.5">Category</th>
                    <th className="py-2.5">Followers</th>
                    <th className="py-2.5">Status</th>
                    <th className="py-2.5">Verified</th>
                    <th className="py-2.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {filteredCreators.map((c) => (
                    <tr key={c.uid} className="hover:bg-secondary/15 transition-colors">
                      <td className="py-3 font-bold text-foreground flex items-center gap-2">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={c.photo} alt={c.name} className="h-8 w-8 rounded-full object-cover border border-border" />
                        <div>
                          <p>{c.name}</p>
                          <span className="text-[9px] text-muted-foreground font-mono truncate block max-w-[120px]">{c.uid}</span>
                        </div>
                      </td>
                      <td className="py-3 text-muted-foreground">{c.location.city}, {c.location.state}</td>
                      <td className="py-3 text-muted-foreground truncate max-w-[100px]">{c.categories.join(', ')}</td>
                      <td className="py-3 font-bold text-foreground">{formatFollowers(c.followers)}</td>
                      <td className="py-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                          c.status === 'approved' ? 'bg-emerald-500/10 text-emerald-500' : c.status === 'suspended' ? 'bg-rose-500/10 text-rose-500' : 'bg-yellow-500/10 text-yellow-500'
                        }`}>
                          {c.status}
                        </span>
                      </td>
                      <td className="py-3">
                        {c.isVerified ? (
                          <span className="inline-flex items-center gap-0.5 bg-primary/10 text-primary px-1.5 py-0.5 rounded-md text-[9px] font-extrabold uppercase">
                            Yes
                          </span>
                        ) : (
                          <span className="text-muted-foreground">No</span>
                        )}
                      </td>
                      <td className="py-3 text-right">
                        <div className="flex gap-1.5 justify-end">
                          {/* Approve/Activate */}
                          {c.status !== 'approved' && (
                            <button
                              onClick={() => handleUpdateStatus(c.uid, 'creator', 'approved')}
                              className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20"
                              title="Approve Profile"
                            >
                              <Check className="h-4 w-4" />
                            </button>
                          )}
                          
                          {/* Suspend */}
                          {c.status === 'approved' && (
                            <button
                              onClick={() => handleUpdateStatus(c.uid, 'creator', 'suspended')}
                              className="p-1.5 rounded-lg bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/25"
                              title="Suspend Profile"
                            >
                              <AlertTriangle className="h-4 w-4" />
                            </button>
                          )}

                          {/* Verify */}
                          <button
                            onClick={() => handleToggleVerification(c.uid, 'creator', c.isVerified)}
                            className={`p-1.5 rounded-lg border ${
                              c.isVerified 
                                ? 'border-primary bg-primary/10 text-primary' 
                                : 'border-border bg-card text-muted-foreground hover:bg-secondary/40'
                            }`}
                            title="Toggle Verified badge"
                          >
                            <Award className="h-4 w-4" />
                          </button>

                          {/* Public Profile View link */}
                          <Link
                            href={`/creator/${c.uid}`}
                            className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-500 hover:bg-indigo-500/20"
                            title="View Public Profile"
                          >
                            <Eye className="h-4 w-4" />
                          </Link>

                          {/* Delete */}
                          <button
                            onClick={() => handleDelete(c.uid, 'creator')}
                            className="p-1.5 rounded-lg bg-rose-500/10 text-rose-500 hover:bg-rose-500/20"
                            title="Delete profile"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        ) : (
          /* BUSINESSES TABLE */
          filteredBusinesses.length === 0 ? (
            <div className="text-center py-8 text-xs text-muted-foreground">No businesses found matching search.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-border text-muted-foreground font-bold uppercase tracking-wider text-[9px] pb-2">
                    <th className="py-2.5">Business Name</th>
                    <th className="py-2.5">Location</th>
                    <th className="py-2.5">Category</th>
                    <th className="py-2.5">Working Hours</th>
                    <th className="py-2.5">Status</th>
                    <th className="py-2.5">Verified</th>
                    <th className="py-2.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {filteredBusinesses.map((b) => (
                    <tr key={b.uid} className="hover:bg-secondary/15 transition-colors">
                      <td className="py-3 font-bold text-foreground flex items-center gap-2">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={b.logo} alt={b.name} className="h-8 w-8 rounded-full object-cover border border-border" />
                        <div>
                          <p>{b.name}</p>
                          <span className="text-[9px] text-muted-foreground font-mono truncate block max-w-[120px]">{b.uid}</span>
                        </div>
                      </td>
                      <td className="py-3 text-muted-foreground">{b.city}, {b.state}</td>
                      <td className="py-3 text-muted-foreground">{b.category}</td>
                      <td className="py-3 text-muted-foreground">{b.workingHours || 'Not configured'}</td>
                      <td className="py-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                          b.status === 'approved' ? 'bg-emerald-500/10 text-emerald-500' : b.status === 'suspended' ? 'bg-rose-500/10 text-rose-500' : 'bg-yellow-500/10 text-yellow-500'
                        }`}>
                          {b.status}
                        </span>
                      </td>
                      <td className="py-3">
                        {b.isVerified ? (
                          <span className="inline-flex items-center gap-0.5 bg-primary/10 text-primary px-1.5 py-0.5 rounded-md text-[9px] font-extrabold uppercase">
                            Yes
                          </span>
                        ) : (
                          <span className="text-muted-foreground">No</span>
                        )}
                      </td>
                      <td className="py-3 text-right">
                        <div className="flex gap-1.5 justify-end">
                          {/* Approve/Activate */}
                          {b.status !== 'approved' && (
                            <button
                              onClick={() => handleUpdateStatus(b.uid, 'business', 'approved')}
                              className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20"
                              title="Approve Business"
                            >
                              <Check className="h-4 w-4" />
                            </button>
                          )}
                          
                          {/* Suspend */}
                          {b.status === 'approved' && (
                            <button
                              onClick={() => handleUpdateStatus(b.uid, 'business', 'suspended')}
                              className="p-1.5 rounded-lg bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/25"
                              title="Suspend Business"
                            >
                              <AlertTriangle className="h-4 w-4" />
                            </button>
                          )}

                          {/* Verify */}
                          <button
                            onClick={() => handleToggleVerification(b.uid, 'business', b.isVerified)}
                            className={`p-1.5 rounded-lg border ${
                              b.isVerified 
                                ? 'border-primary bg-primary/10 text-primary' 
                                : 'border-border bg-card text-muted-foreground hover:bg-secondary/40'
                            }`}
                            title="Toggle Verified badge"
                          >
                            <Award className="h-4 w-4" />
                          </button>

                          {/* Delete */}
                          <button
                            onClick={() => handleDelete(b.uid, 'business')}
                            className="p-1.5 rounded-lg bg-rose-500/10 text-rose-500 hover:bg-rose-500/20"
                            title="Delete Business"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        )}
      </div>

    </div>
  );
}

