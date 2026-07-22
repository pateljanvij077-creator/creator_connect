'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { db } from '@/lib/db';
import { Booking, Business } from '@/lib/constants';
import { 
  Calendar, 
  MapPin, 
  DollarSign, 
  Clock, 
  CheckCircle, 
  XCircle, 
  MessageSquare,
  Phone, 
  Mail, 
  Globe, 
  FileText
} from 'lucide-react';
import { InstagramIcon } from '@/components/SocialIcons';
import { formatCurrency } from '@/lib/utils';

export default function CreatorBookings() {
  const { user, profile } = useAuth();
  
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);

  const loadBookings = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const list = await db.getBookings(user.uid, 'creator');
      setBookings(list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    } catch (e) {
      console.error('Error fetching bookings:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, [user]);

  // Load business contact info
  useEffect(() => {
    if (!selectedBooking) {
      setSelectedBusiness(null);
      return;
    }
    const loadBusinessData = async () => {
      try {
        const profile = await db.getBusiness(selectedBooking.businessId);
        setSelectedBusiness(profile);
      } catch (e) {
        console.error('Failed to load business contact details:', e);
      }
    };
    loadBusinessData();
  }, [selectedBooking]);

  const handleAction = async (bookingId: string, action: 'accepted' | 'rejected' | 'completed') => {
    try {
      const booking = bookings.find(b => b.id === bookingId);
      if (!booking) return;

      const updateData: Partial<Booking> = { status: action };
      if (action === 'completed') {
        updateData.paymentStatus = 'paid';
      }

      await db.updateBooking(bookingId, updateData);

      // Handle Wallet Transactions
      try {
        const settings = await db.getAdminSettings();
        const unconfirmedFee = settings.unconfirmedDeductionFee || 100;
        
        if (action === 'rejected') {
          // Deduct unconfirmed fee from business wallet
          await db.addWalletTransaction(
            booking.businessId,
            'deduction',
            unconfirmedFee,
            `Unconfirmed / Rejected Booking Fee for "${booking.campaignTitle}"`
          );
        } else if (action === 'completed' && (user?.uid || booking.creatorId)) {
          // Add earnings to creator wallet
          await db.addWalletTransaction(
            user?.uid || booking.creatorId,
            'payout',
            booking.creatorEarnings,
            `Campaign Payout Earnings for "${booking.campaignTitle}"`
          );
        }
      } catch (walletErr) {
        console.error('Wallet transaction logging failed:', walletErr);
      }

      // Create Notification for the Business Owner
      const notificationTitle = action === 'accepted' ? 'Campaign Accepted!' : action === 'rejected' ? 'Campaign Declined' : 'Campaign Completed!';
      const notificationMsg = action === 'accepted'
        ? `${profile?.name || 'A creator'} has accepted your campaign "${booking.campaignTitle}". Check direct links to connect on WhatsApp / Instagram.`
        : action === 'rejected'
        ? `${profile?.name || 'A creator'} has declined your campaign "${booking.campaignTitle}". ₹100 unconfirmed fee applied.`
        : `${profile?.name || 'A creator'} has marked the campaign "${booking.campaignTitle}" as completed. Payout credited to creator wallet.`;

      await db.createNotification(booking.businessId, notificationTitle, notificationMsg, `booking_${action}`);

      // Refresh list
      await loadBookings();
      
      // Update selected booking view
      if (selectedBooking?.id === bookingId) {
        setSelectedBooking({ ...selectedBooking, status: action, paymentStatus: action === 'completed' ? 'paid' : selectedBooking.paymentStatus });
      }
    } catch (e) {
      console.error(`Failed to execute booking action ${action}:`, e);
    }
  };

  const getStatusBadge = (status: string) => {
    const base = "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase";
    switch (status) {
      case 'completed': 
        return <span className={`${base} bg-emerald-500/10 text-emerald-500`}><CheckCircle className="h-3 w-3" /> Completed</span>;
      case 'accepted': 
        return <span className={`${base} bg-indigo-500/10 text-indigo-500`}><Clock className="h-3 w-3 animate-pulse" /> Active (Accepted)</span>;
      case 'rejected': 
        return <span className={`${base} bg-rose-500/10 text-rose-500`}><XCircle className="h-3 w-3" /> Declined</span>;
      default: 
        return <span className={`${base} bg-yellow-500/10 text-yellow-500`}><Clock className="h-3 w-3" /> Pending</span>;
    }
  };

  return (
    <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-10 flex-grow">
      <div className="flex items-center gap-2 mb-8">
        <FileText className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-extrabold text-foreground font-sans">
          My Campaign Bookings
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Bookings Table list */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <div className="glass-panel rounded-2xl border border-border p-5 shadow-sm">
            {loading ? (
              <div className="flex flex-col gap-3 py-6">
                {[1, 2, 3].map(n => (
                  <div key={n} className="h-16 rounded-xl shimmer-loading border border-border"></div>
                ))}
              </div>
            ) : bookings.length === 0 ? (
              <div className="text-center py-12 text-xs text-muted-foreground">
                No campaign bookings logged yet.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-border text-muted-foreground font-bold uppercase tracking-wider text-[10px]">
                      <th className="py-3">Campaign Name</th>
                      <th className="py-3">Business</th>
                      <th className="py-3">Launch Date</th>
                      <th className="py-3">Net Earnings</th>
                      <th className="py-3 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/40">
                    {bookings.map((booking) => (
                      <tr 
                        key={booking.id} 
                        onClick={() => setSelectedBooking(booking)}
                        className={`hover:bg-secondary/35 transition-colors cursor-pointer ${
                          selectedBooking?.id === booking.id ? 'bg-secondary/50 border-l-2 border-primary' : ''
                        }`}
                      >
                        <td className="py-3.5 font-bold text-foreground">{booking.campaignTitle}</td>
                        <td className="py-3.5 text-muted-foreground">{booking.businessName}</td>
                        <td className="py-3.5 text-muted-foreground">{booking.campaignDate}</td>
                        <td className="py-3.5 font-extrabold text-emerald-500">
                          {formatCurrency(booking.creatorEarnings)}
                        </td>
                        <td className="py-3.5 text-right">
                          {getStatusBadge(booking.status)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Selected Booking Details & Contacts */}
        <div className="lg:col-span-1">
          {selectedBooking ? (
            <div className="glass-panel rounded-2xl border border-border p-6 shadow-sm flex flex-col gap-5 sticky top-24">
              
              {/* Details Header */}
              <div>
                <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">
                  Campaign Details (ID: {selectedBooking.id})
                </span>
                <h3 className="text-base font-bold text-foreground leading-snug">
                  {selectedBooking.campaignTitle}
                </h3>
                <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                  {selectedBooking.campaignDescription}
                </p>
              </div>

              {/* Specs */}
              <div className="grid grid-cols-2 gap-3 bg-secondary/20 p-3.5 rounded-xl border border-border/40 text-xs">
                <div>
                  <span className="text-muted-foreground block text-[10px] font-semibold">Business</span>
                  <span className="font-bold text-foreground">{selectedBooking.businessName}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[10px] font-semibold">Date</span>
                  <span className="font-bold text-foreground">{selectedBooking.campaignDate}</span>
                </div>
                <div className="col-span-2 border-t border-border/40 pt-2 mt-1">
                  <span className="text-muted-foreground block text-[10px] font-semibold">Expected Deliverables</span>
                  <span className="font-medium text-foreground">{selectedBooking.expectedDeliverables}</span>
                </div>
              </div>

              {/* Earnings breakdown */}
              <div className="border-t border-border/60 pt-4 flex flex-col gap-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Collaborator Budget (Base)</span>
                  <span className="font-semibold text-foreground">{formatCurrency(selectedBooking.budget)}</span>
                </div>
                <div className="flex justify-between text-rose-500">
                  <span className="text-muted-foreground">Platform Commission ({selectedBooking.commissionPercent}%)</span>
                  <span>-{formatCurrency(selectedBooking.commissionAmount)}</span>
                </div>
                <div className="flex justify-between border-t border-border/60 pt-2 mt-1 font-bold text-sm text-emerald-500 bg-emerald-500/5 p-2 rounded-xl">
                  <span>Net Creator Earnings</span>
                  <span>{formatCurrency(selectedBooking.creatorEarnings)}</span>
                </div>
              </div>

              {/* DIRECT ESCAPES (WhatsApp, Call, Instagram) */}
              {selectedBusiness && (
                <div className="border-t border-border/60 pt-4 flex flex-col gap-3">
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                    <MessageSquare className="h-3.5 w-3.5 text-primary" />
                    <span>Direct Chat with Business</span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {/* WhatsApp */}
                    <a
                      href={`https://wa.me/${selectedBusiness.phone.replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex h-9 items-center justify-center rounded-xl bg-emerald-500 font-bold text-white shadow-sm hover:bg-emerald-600 transition-colors"
                    >
                      WhatsApp
                    </a>

                    {/* Instagram */}
                    {selectedBusiness.socials.instagram ? (
                      <a
                        href={selectedBusiness.socials.instagram}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex h-9 items-center justify-center rounded-xl bg-gradient-to-r from-purple-500 via-pink-500 to-yellow-500 font-bold text-white shadow-sm hover:opacity-90"
                      >
                        Instagram
                      </a>
                    ) : (
                      <div className="h-9 rounded-xl border border-dashed border-border flex items-center justify-center text-[10px] text-muted-foreground">
                        No Instagram URL
                      </div>
                    )}

                    {/* Email */}
                    <a
                      href={`mailto:${selectedBusiness.email}`}
                      className="flex h-9 items-center justify-center rounded-xl border border-border bg-card font-semibold text-muted-foreground hover:bg-secondary/40"
                    >
                      Email
                    </a>

                    {/* Phone call */}
                    <a
                      href={`tel:${selectedBusiness.phone}`}
                      className="flex h-9 items-center justify-center rounded-xl border border-border bg-card font-semibold text-muted-foreground hover:bg-secondary/40"
                    >
                      Call
                    </a>
                  </div>
                </div>
              )}

              {/* Actions Section (Accept / Decline / Complete) */}
              <div className="border-t border-border/60 pt-4">
                {selectedBooking.status === 'pending' && (
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => handleAction(selectedBooking.id, 'rejected')}
                      className="h-10 rounded-xl border border-rose-500/20 bg-rose-500/10 text-rose-500 text-xs font-bold hover:bg-rose-500/20 transition-colors uppercase"
                    >
                      Decline
                    </button>
                    <button
                      onClick={() => handleAction(selectedBooking.id, 'accepted')}
                      className="h-10 rounded-xl bg-primary text-white text-xs font-bold hover:opacity-90 transition-opacity uppercase"
                    >
                      Accept
                    </button>
                  </div>
                )}

                {selectedBooking.status === 'accepted' && (
                  <button
                    onClick={() => handleAction(selectedBooking.id, 'completed')}
                    className="w-full h-11 rounded-xl bg-emerald-500 text-xs font-bold text-white shadow-sm hover:bg-emerald-600 transition-colors uppercase"
                  >
                    Mark campaign deliverables completed
                  </button>
                )}

                {selectedBooking.status === 'completed' && (
                  <div className="text-center text-xs font-semibold text-emerald-500 bg-emerald-500/10 p-2.5 rounded-xl border border-emerald-500/20 flex items-center justify-center gap-1.5">
                    <CheckCircle className="h-4.5 w-4.5" /> Campaign successfully completed!
                  </div>
                )}

                {selectedBooking.status === 'rejected' && (
                  <div className="text-center text-xs font-semibold text-rose-500 bg-rose-500/10 p-2.5 rounded-xl border border-rose-500/20">
                    You declined this campaign invitation.
                  </div>
                )}
              </div>

            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-border p-8 text-center text-xs text-muted-foreground">
              Click on a campaign row to view details, budget overrides, and business owner direct contact lines.
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
