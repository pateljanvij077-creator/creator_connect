'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { db } from '@/lib/db';
import { Booking, Creator } from '@/lib/constants';
import ReviewModal from '@/components/ReviewModal';
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
  HelpCircle,
  FileText,
  Star
} from 'lucide-react';
import { InstagramIcon } from '@/components/SocialIcons';
import { formatCurrency } from '@/lib/utils';

export default function BusinessBookings() {
  const { user } = useAuth();
  
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [selectedCreator, setSelectedCreator] = useState<Creator | null>(null);
  const [loading, setLoading] = useState(true);

  // Review Modal State
  const [reviewOpen, setReviewOpen] = useState(false);

  const loadBookings = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const all = await db.getBookings();
      const list = all.filter(b => b.businessId === user.uid);
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

  // Load selected creator profiles to show direct contact details
  useEffect(() => {
    if (!selectedBooking) {
      setSelectedCreator(null);
      return;
    }
    const loadCreatorData = async () => {
      try {
        const profile = await db.getCreator(selectedBooking.creatorId);
        setSelectedCreator(profile);
      } catch (e) {
        console.error('Failed to load creator contact details:', e);
      }
    };
    loadCreatorData();
  }, [selectedBooking]);

  const handleComplete = async (booking: Booking) => {
    try {
      // 1. Update status to completed in db
      await db.updateBooking(booking.id, { 
        status: 'completed', 
        paymentStatus: 'paid' 
      });
      
      // 2. Refresh lists
      await loadBookings();
      
      // 3. Set selected booking for review trigger and open modal
      setSelectedBooking({ ...booking, status: 'completed', paymentStatus: 'paid' });
      setReviewOpen(true);
    } catch (e) {
      console.error('Failed to complete campaign:', e);
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
        return <span className={`${base} bg-rose-500/10 text-rose-500`}><XCircle className="h-3 w-3" /> Rejected</span>;
      default: 
        return <span className={`${base} bg-yellow-500/10 text-yellow-500`}><Clock className="h-3 w-3" /> Pending Accept</span>;
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
        
        {/* Left/Middle Column: Bookings Table list */}
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
                No campaign bookings logged yet. Browse creators to start a marketing campaign.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-border text-muted-foreground font-bold uppercase tracking-wider text-[10px]">
                      <th className="py-3">Campaign Name</th>
                      <th className="py-3">Creator Name</th>
                      <th className="py-3">Launch Date</th>
                      <th className="py-3">Cost (Total)</th>
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
                        <td className="py-3.5 text-muted-foreground">{booking.creatorName}</td>
                        <td className="py-3.5 text-muted-foreground">{booking.campaignDate}</td>
                        <td className="py-3.5 font-extrabold text-foreground">
                          {formatCurrency(booking.businessPayment)}
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

        {/* Right Column: Selected Booking Details & Contacts */}
        <div className="lg:col-span-1">
          {selectedBooking ? (
            <div className="glass-panel rounded-2xl border border-border p-6 shadow-sm flex flex-col gap-5 sticky top-24">
              
              {/* Card Header */}
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

              {/* Specs Grid */}
              <div className="grid grid-cols-2 gap-3 bg-secondary/20 p-3.5 rounded-xl border border-border/40 text-xs">
                <div>
                  <span className="text-muted-foreground block text-[10px] font-semibold">Creator</span>
                  <span className="font-bold text-foreground">{selectedBooking.creatorName}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[10px] font-semibold">Date</span>
                  <span className="font-bold text-foreground">{selectedBooking.campaignDate}</span>
                </div>
                <div className="col-span-2 border-t border-border/40 pt-2 mt-1">
                  <span className="text-muted-foreground block text-[10px] font-semibold">Deliverables</span>
                  <span className="font-medium text-foreground">{selectedBooking.expectedDeliverables}</span>
                </div>
              </div>

              {/* Financial calculations */}
              <div className="border-t border-border/60 pt-4 flex flex-col gap-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Collaborator Budget (Base)</span>
                  <span className="font-semibold text-foreground">{formatCurrency(selectedBooking.budget)}</span>
                </div>
                <div className="flex justify-between text-[11px] bg-secondary/15 p-1.5 rounded-md border border-border/30">
                  <span className="text-muted-foreground">Platform Fee</span>
                  <span className="font-semibold text-muted-foreground">Calculated internally</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">GST (18%)</span>
                  <span className="font-semibold text-foreground">
                    {formatCurrency(selectedBooking.businessPayment - selectedBooking.budget)}
                  </span>
                </div>
                <div className="flex justify-between border-t border-border/60 pt-2 mt-1 font-bold text-sm">
                  <span className="text-foreground">Total Paid Amount</span>
                  <span className="text-primary">{formatCurrency(selectedBooking.businessPayment)}</span>
                </div>
              </div>

              {/* DIRECT CHAT ESCAPES (WhatsApp, Call, Instagram) */}
              {selectedCreator && (
                <div className="border-t border-border/60 pt-4 flex flex-col gap-3">
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                    <MessageSquare className="h-3.5 w-3.5 text-primary" />
                    <span>Direct Chat with {selectedBooking.creatorName}</span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {/* WhatsApp URL */}
                    <a
                      href={`https://wa.me/${(selectedCreator.socials.snapchat || '919876543210').replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex h-9 items-center justify-center rounded-xl bg-emerald-500 font-bold text-white shadow-sm hover:bg-emerald-600 transition-colors"
                    >
                      WhatsApp
                    </a>

                    {/* Instagram */}
                    {selectedCreator.socials.instagram && (
                      <a
                        href={selectedCreator.socials.instagram}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex h-9 items-center justify-center rounded-xl bg-gradient-to-r from-purple-500 via-pink-500 to-yellow-500 font-bold text-white shadow-sm hover:opacity-90 transition-opacity"
                      >
                        Instagram
                      </a>
                    )}

                    {/* Email */}
                    <a
                      href={`mailto:${selectedCreator.socials.email || 'aarav@creator.com'}`}
                      className="flex h-9 items-center justify-center rounded-xl border border-border bg-card font-semibold text-muted-foreground hover:bg-secondary/40"
                    >
                      Email
                    </a>

                    {/* Phone call */}
                    {selectedCreator.socials.snapchat && (
                      <a
                        href={`tel:${selectedCreator.socials.snapchat}`}
                        className="flex h-9 items-center justify-center rounded-xl border border-border bg-card font-semibold text-muted-foreground hover:bg-secondary/40"
                      >
                        Call
                      </a>
                    )}
                  </div>
                </div>
              )}

              {/* Actions Section (Complete / Leave review) */}
              <div className="border-t border-border/60 pt-4">
                {selectedBooking.status === 'accepted' && (
                  <button
                    onClick={() => handleComplete(selectedBooking)}
                    className="w-full h-11 rounded-xl bg-emerald-500 text-xs font-bold text-white shadow-sm hover:bg-emerald-600 transition-colors"
                  >
                    Complete Campaign & Release Payout
                  </button>
                )}

                {selectedBooking.status === 'completed' && (
                  <button
                    onClick={() => setReviewOpen(true)}
                    className="w-full h-11 rounded-xl border border-primary bg-primary/10 text-xs font-bold text-primary hover:bg-primary/20 transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Star className="h-4 w-4 fill-primary" /> Leave Creator a Review
                  </button>
                )}

                {selectedBooking.status === 'rejected' && (
                  <div className="text-center text-xs font-semibold text-rose-500 bg-rose-500/10 p-2.5 rounded-xl border border-rose-500/20">
                    This booking request was declined by the creator.
                  </div>
                )}

                {selectedBooking.status === 'pending' && (
                  <div className="text-center text-xs font-semibold text-yellow-500 bg-yellow-500/10 p-2.5 rounded-xl border border-yellow-500/20">
                    Awaiting acceptance from creator.
                  </div>
                )}
              </div>

            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-border p-8 text-center text-xs text-muted-foreground">
              Click on a booking item to view campaigns cost detail, deliverables, and direct contact options.
            </div>
          )}
        </div>

      </div>

      {/* Review Modal Trigger */}
      {reviewOpen && selectedBooking && (
        <ReviewModal 
          bookingId={selectedBooking.id}
          revieweeId={selectedBooking.creatorId}
          revieweeName={selectedBooking.creatorName}
          reviewerRole="business"
          isOpen={reviewOpen}
          onClose={() => setReviewOpen(false)}
          onSuccess={() => loadBookings()}
        />
      )}

    </div>
  );
}
