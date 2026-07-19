'use client';

import React, { useState, useEffect } from 'react';
import { db } from '@/lib/db';
import { Booking, CommissionOverride, Creator, Business } from '@/lib/constants';
import { 
  Percent, 
  FileText, 
  Search, 
  Plus, 
  Trash2, 
  Download, 
  TrendingUp, 
  Check, 
  X,
  HelpCircle,
  AlertCircle
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

export default function AdminBookingsAndCommissions() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [overrides, setOverrides] = useState<CommissionOverride[]>([]);
  const [creators, setCreators] = useState<Creator[]>([]);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  // New Override Form State
  const [targetType, setTargetType] = useState<'creator' | 'business'>('creator');
  const [targetId, setTargetId] = useState('');
  const [customRate, setCustomRate] = useState<number>(10);
  
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const bookingList = await db.getBookings();
      const overrideList = await db.getCommissionOverrides();
      const creatorList = await db.getCreators();
      const businessList = await db.getBusinesses();
      
      setBookings(bookingList);
      setOverrides(overrideList);
      setCreators(creatorList);
      setBusinesses(businessList);

      // Seed initial target selection
      if (creatorList.length > 0) {
        setTargetId(creatorList[0].uid);
      }
    } catch (e) {
      console.error('Failed to load admin bookings data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Update target selection when type changes
  useEffect(() => {
    if (targetType === 'creator' && creators.length > 0) {
      setTargetId(creators[0].uid);
    } else if (targetType === 'business' && businesses.length > 0) {
      setTargetId(businesses[0].uid);
    }
  }, [targetType, creators, businesses]);

  const handleCreateOverride = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!targetId) {
      setErrorMsg('Please select a target user.');
      return;
    }

    try {
      await db.saveCommissionOverride(targetId, targetType, Number(customRate));
      setSuccessMsg('Commission override successfully applied!');
      setTimeout(() => setSuccessMsg(''), 3000);
      await loadData();
    } catch (e) {
      setErrorMsg('Failed to apply commission override.');
    }
  };

  const handleDeleteOverride = async (id: string) => {
    try {
      await db.deleteCommissionOverride(id);
      await loadData();
    } catch (e) {
      console.error('Failed to delete override:', e);
    }
  };

  const handleBookingAction = async (bookingId: string, action: 'completed' | 'rejected') => {
    try {
      const update: Partial<Booking> = { status: action };
      if (action === 'completed') {
        update.paymentStatus = 'paid';
      }
      await db.updateBooking(bookingId, update);
      await loadData();
    } catch (e) {
      console.error('Failed to update booking status:', e);
    }
  };

  // Export Bookings to CSV
  const handleExportCSV = () => {
    if (bookings.length === 0) return;

    // Headings
    const headers = [
      'Booking ID',
      'Business Name',
      'Creator Name',
      'Campaign Title',
      'Date',
      'Budget Amount',
      'Commission Percent',
      'Commission Amount',
      'Creator Net Earnings',
      'Business Payout (Total)',
      'Status',
      'Payment Status'
    ];

    const rows = bookings.map((b) => [
      b.id,
      `"${b.businessName.replace(/"/g, '""')}"`,
      `"${b.creatorName.replace(/"/g, '""')}"`,
      `"${b.campaignTitle.replace(/"/g, '""')}"`,
      b.campaignDate,
      b.budget,
      b.commissionPercent,
      b.commissionAmount,
      b.creatorEarnings,
      b.businessPayment,
      b.status,
      b.paymentStatus
    ]);

    // Build CSV String
    const csvContent = 'data:text/csv;charset=utf-8,' 
      + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    
    // Download trigger
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `CreatorConnect_Bookings_Export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filter bookings based on query
  const filteredBookings = bookings.filter((b) => {
    const q = searchQuery.toLowerCase().trim();
    return (
      b.id.toLowerCase().includes(q) ||
      b.businessName.toLowerCase().includes(q) ||
      b.creatorName.toLowerCase().includes(q) ||
      b.campaignTitle.toLowerCase().includes(q)
    );
  });

  // Helper to find target display name for override list
  const getTargetName = (override: CommissionOverride) => {
    if (override.targetType === 'creator') {
      return creators.find(c => c.uid === override.targetId)?.name || `Creator: ${override.targetId}`;
    } else {
      return businesses.find(b => b.uid === override.targetId)?.name || `Business: ${override.targetId}`;
    }
  };

  return (
    <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-10 flex-grow">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-extrabold text-foreground font-sans">
            Commissions & Bookings Audits
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Configure custom commissions override rates and audit global bookings records.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          disabled={bookings.length === 0}
          className="flex items-center gap-1.5 rounded-xl gradient-primary px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-primary/20 hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          <Download className="h-4 w-4" /> Export CSV Report
        </button>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Commission Override Settings */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          {/* Create Form */}
          <div className="glass-panel rounded-2xl border border-border p-5 shadow-sm">
            <h3 className="text-xs font-bold text-foreground uppercase tracking-wider mb-4 border-b border-border/80 pb-2 flex items-center gap-1.5">
              <Percent className="h-4 w-4 text-primary" /> Create Override Rule
            </h3>

            {successMsg && (
              <div className="mb-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-2.5 text-[11px] font-semibold text-emerald-500">
                {successMsg}
              </div>
            )}
            {errorMsg && (
              <div className="mb-3 rounded-lg bg-destructive/10 border border-destructive/20 p-2.5 text-[11px] font-semibold text-destructive">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleCreateOverride} className="flex flex-col gap-4">
              <div>
                <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5">
                  Select User Type
                </label>
                <div className="grid grid-cols-2 gap-2 bg-secondary/50 p-1 rounded-lg border border-border/85">
                  <button
                    type="button"
                    onClick={() => setTargetType('creator')}
                    className={`py-1.5 rounded-md text-[10px] font-bold transition-all ${
                      targetType === 'creator'
                        ? 'bg-card text-foreground shadow-sm'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Creator Specific
                  </button>
                  <button
                    type="button"
                    onClick={() => setTargetType('business')}
                    className={`py-1.5 rounded-md text-[10px] font-bold transition-all ${
                      targetType === 'business'
                        ? 'bg-card text-foreground shadow-sm'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Business Specific
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">
                  Select Collaborator
                </label>
                <select
                  value={targetId}
                  onChange={(e) => setTargetId(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground focus:outline-none"
                >
                  {targetType === 'creator' ? (
                    creators.map(c => <option key={c.uid} value={c.uid}>{c.name} ({c.location.city})</option>)
                  ) : (
                    businesses.map(b => <option key={b.uid} value={b.uid}>{b.name} ({b.city})</option>)
                  )}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">
                  Override Commission Rate (%)
                </label>
                <div className="flex gap-2">
                  {[5, 8, 12, 15].map((pct) => (
                    <button
                      key={pct}
                      type="button"
                      onClick={() => setCustomRate(pct)}
                      className={`flex-1 py-1 rounded-lg border text-[10px] font-bold transition-all ${
                        customRate === pct
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-border bg-card text-muted-foreground hover:bg-secondary/40'
                      }`}
                    >
                      {pct}%
                    </button>
                  ))}
                  <input
                    type="number"
                    min="1"
                    max="50"
                    placeholder="Custom"
                    value={customRate}
                    onChange={(e) => setCustomRate(Number(e.target.value))}
                    className="w-16 rounded-lg border border-border bg-background px-2 text-center text-xs font-bold text-foreground focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full h-9 rounded-xl gradient-primary text-xs font-bold text-white shadow-sm hover:opacity-90 transition-opacity mt-2"
              >
                Apply Override Rate
              </button>
            </form>
          </div>

          {/* Active Overrides list */}
          <div className="glass-panel rounded-2xl border border-border p-5 shadow-sm">
            <h3 className="text-xs font-bold text-foreground uppercase tracking-wider mb-4 border-b border-border/80 pb-2 flex items-center gap-1">
              Active Overrides Rules ({overrides.length})
            </h3>
            
            {overrides.length === 0 ? (
              <div className="text-center py-6 text-xs text-muted-foreground">
                No active custom commission overrides set. Standard default rates apply.
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {overrides.map((rule) => (
                  <div 
                    key={rule.id}
                    className="rounded-xl border border-border bg-background/50 p-3 flex items-center justify-between text-xs hover:border-primary/45"
                  >
                    <div>
                      <p className="font-bold text-foreground">{getTargetName(rule)}</p>
                      <span className="text-[10px] text-muted-foreground uppercase font-semibold">
                        Type: {rule.targetType} • Rate: <strong className="text-primary">{rule.commissionPercent}%</strong>
                      </span>
                    </div>
                    
                    <button
                      onClick={() => handleDeleteOverride(rule.id)}
                      className="rounded-lg p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                      title="Remove override"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Global Bookings table registry */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <div className="glass-panel rounded-2xl border border-border p-5 shadow-sm">
            <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center border-b border-border/80 pb-3 mb-4 gap-3">
              <h3 className="text-sm font-bold text-foreground">
                All System Bookings ({filteredBookings.length})
              </h3>
              
              <div className="w-full sm:w-64 flex items-center gap-2 px-2 bg-card rounded-xl border border-border">
                <Search className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                <input
                  type="text"
                  placeholder="Search by ID, business, creator..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-transparent border-0 py-1.5 text-[11px] text-foreground focus:outline-none"
                />
              </div>
            </div>

            {filteredBookings.length === 0 ? (
              <div className="text-center py-12 text-xs text-muted-foreground">
                No system bookings found matching search filter.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-border text-muted-foreground font-bold uppercase tracking-wider text-[9px]">
                      <th className="py-2.5">ID</th>
                      <th className="py-2.5">Collab Partners</th>
                      <th className="py-2.5">Cost details</th>
                      <th className="py-2.5">Comm. fee</th>
                      <th className="py-2.5">Status</th>
                      <th className="py-2.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/40">
                    {filteredBookings.map((b) => (
                      <tr key={b.id} className="hover:bg-secondary/15 transition-colors">
                        <td className="py-3 font-semibold text-foreground font-mono">{b.id}</td>
                        <td className="py-3">
                          <p className="font-bold text-foreground">B: {b.businessName}</p>
                          <p className="text-[10px] text-muted-foreground">C: {b.creatorName}</p>
                        </td>
                        <td className="py-3">
                          <p className="font-bold text-foreground">{formatCurrency(b.businessPayment)}</p>
                          <span className="text-[10px] text-muted-foreground">Base: {formatCurrency(b.budget)}</span>
                        </td>
                        <td className="py-3 text-rose-500 font-semibold">
                          <p>{formatCurrency(b.commissionAmount)}</p>
                          <span className="text-[10px] text-muted-foreground">Rate: {b.commissionPercent}%</span>
                        </td>
                        <td className="py-3">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                            b.status === 'completed' 
                              ? 'bg-emerald-500/10 text-emerald-500' 
                              : b.status === 'rejected'
                              ? 'bg-rose-500/10 text-rose-500'
                              : b.status === 'accepted'
                              ? 'bg-indigo-500/10 text-indigo-500'
                              : 'bg-yellow-500/10 text-yellow-500'
                          }`}>
                            {b.status}
                          </span>
                        </td>
                        <td className="py-3 text-right">
                          <div className="flex gap-1 justify-end">
                            {/* Force complete */}
                            {b.status === 'accepted' && (
                              <button
                                onClick={() => handleBookingAction(b.id, 'completed')}
                                className="p-1 rounded bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20"
                                title="Force Complete"
                              >
                                <Check className="h-3.5 w-3.5" />
                              </button>
                            )}

                            {/* Cancel / Reject */}
                            {(b.status === 'pending' || b.status === 'accepted') && (
                              <button
                                onClick={() => handleBookingAction(b.id, 'rejected')}
                                className="p-1 rounded bg-rose-500/10 text-rose-500 hover:bg-rose-500/20"
                                title="Force Cancel/Decline"
                              >
                                <X className="h-3.5 w-3.5" />
                              </button>
                            )}
                          </div>
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

    </div>
  );
}

