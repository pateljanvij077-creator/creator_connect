'use client';

import React, { useState, useEffect } from 'react';
import { Creator, Business, Booking } from '@/lib/constants';
import { db } from '@/lib/db';
import { useAuth } from '@/lib/auth';
import { X, Calculator, HelpCircle, CheckCircle } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import confetti from 'canvas-confetti';

interface BookingModalProps {
  creator: Creator;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function BookingModal({ creator, isOpen, onClose, onSuccess }: BookingModalProps) {
  const { user, profile } = useAuth();
  
  // Form fields
  const [campaignTitle, setCampaignTitle] = useState('');
  const [campaignDescription, setCampaignDescription] = useState('');
  const [campaignDate, setCampaignDate] = useState('');
  const [location, setLocation] = useState('');
  const [expectedDeliverables, setExpectedDeliverables] = useState('');
  const [budget, setBudget] = useState<number>(creator.pricingPackages[0]?.price || 5000);
  
  // Platform settings & commission overrides
  const [commissionPercent, setCommissionPercent] = useState<number>(10);
  const [gstPercent, setGstPercent] = useState<number>(18);
  const [currency, setCurrency] = useState('₹');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Load fees configurations
  useEffect(() => {
    if (!isOpen) return;
    
    const loadFeesConfig = async () => {
      try {
        const settings = await db.getAdminSettings();
        setGstPercent(settings.gstPercent);
        setCurrency(settings.currency);
        
        let activeCommission = settings.defaultCommissionPercent;
        
        // Fetch overrides
        const overrides = await db.getCommissionOverrides();
        
        // Precedence: Creator Override > Business Override > Default Commission
        const creatorOverride = overrides.find(o => o.targetId === creator.uid && o.targetType === 'creator');
        const businessOverride = overrides.find(o => o.targetId === user?.uid && o.targetType === 'business');
        
        if (creatorOverride) {
          activeCommission = creatorOverride.commissionPercent;
        } else if (businessOverride) {
          activeCommission = businessOverride.commissionPercent;
        }
        
        setCommissionPercent(activeCommission);
      } catch (e) {
        console.error('Error loading fees configurations:', e);
      }
    };

    loadFeesConfig();
  }, [isOpen, creator.uid, user?.uid]);

  if (!isOpen) return null;

  // Live fee calculations
  const parsedBudget = Number(budget) || 0;
  const commissionAmount = parsedBudget * (commissionPercent / 100);
  const creatorEarnings = parsedBudget - commissionAmount;
  const gstAmount = parsedBudget * (gstPercent / 100);
  const businessPayment = parsedBudget + gstAmount;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || user.role !== 'business') return;
    setLoading(true);

    try {
      const businessProfile = profile as Business;
      
      const newBooking: Omit<Booking, 'id' | 'createdAt'> = {
        businessId: user.uid,
        businessName: businessProfile?.name || user.email,
        creatorId: creator.uid,
        creatorName: creator.name,
        campaignTitle,
        campaignDescription,
        campaignDate,
        location: location || businessProfile?.address || '',
        expectedDeliverables,
        budget: parsedBudget,
        commissionPercent,
        commissionAmount,
        creatorEarnings,
        businessPayment,
        status: 'pending',
        paymentStatus: 'pending',
        refundStatus: 'none'
      };

      const booking = await db.createBooking(newBooking);

      // Trigger notification for Creator
      await db.createNotification(
        creator.uid,
        'New Campaign Request!',
        `${businessProfile?.name || 'A business'} has requested a campaign booking for "${campaignTitle}" on ${campaignDate}. Check request details to accept.`,
        'booking_received'
      );

      // Trigger notification for Admin
      await db.createNotification(
        'admin_default',
        'New Booking Logged',
        `Booking ${booking.id} between ${businessProfile?.name} and ${creator.name} created. Commission rate set to ${commissionPercent}%.`,
        'booking_received'
      );

      setSubmitted(true);
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
      
      setTimeout(() => {
        if (onSuccess) onSuccess();
        onClose();
        // Reset form
        setCampaignTitle('');
        setCampaignDescription('');
        setCampaignDate('');
        setLocation('');
        setExpectedDeliverables('');
        setSubmitted(false);
      }, 2000);

    } catch (err) {
      console.error('Error submitting booking:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
      <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl border border-border bg-card p-6 shadow-xl animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border pb-4 mb-4">
          <div className="flex items-center gap-2">
            <Calculator className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-bold text-foreground">
              Book {creator.name}
            </h2>
          </div>
          <button 
            onClick={onClose}
            className="rounded-full p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {submitted ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <CheckCircle className="h-16 w-16 text-emerald-500 mb-4 animate-bounce" />
            <h3 className="text-2xl font-bold text-foreground mb-2">Booking Requested!</h3>
            <p className="text-muted-foreground max-w-md">
              Your campaign booking request was sent to {creator.name}. You will be notified once they accept or reject the campaign.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Form Fields */}
            <div className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">
                  Campaign Title *
                </label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g., Summer Menu Launch Reel"
                  value={campaignTitle}
                  onChange={(e) => setCampaignTitle(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">
                    Date *
                  </label>
                  <input 
                    type="date" 
                    required
                    value={campaignDate}
                    onChange={(e) => setCampaignDate(e.target.value)}
                    className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">
                    Location *
                  </label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g., Bandra Outlet"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">
                  Campaign Description & Focus *
                </label>
                <textarea 
                  required
                  rows={3}
                  placeholder="What is the objective? E.g., Showcase our new range of sourdough pizzas, high energy vibe, focus on cheese pull."
                  value={campaignDescription}
                  onChange={(e) => setCampaignDescription(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">
                  Expected Deliverables *
                </label>
                <textarea 
                  required
                  rows={2}
                  placeholder="E.g., 1 Dedicated Reel (30-60s) + 2 Stories with swipe-up link."
                  value={expectedDeliverables}
                  onChange={(e) => setExpectedDeliverables(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                />
              </div>
            </div>

            {/* Financial Calculations Box */}
            <div className="flex flex-col rounded-2xl bg-secondary/50 border border-border p-5 justify-between">
              <div>
                <h3 className="font-bold text-foreground text-sm mb-3 flex items-center gap-1.5 border-b border-border/80 pb-2">
                  Campaign Cost Breakdown
                </h3>
                
                <div className="flex flex-col gap-3 text-xs mb-4">
                  {/* Budget input */}
                  <div>
                    <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">
                      Collaborator Budget ({currency}) *
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-2.5 text-muted-foreground font-semibold">
                        {currency}
                      </span>
                      <input 
                        type="number" 
                        required
                        min={100}
                        value={budget}
                        onChange={(e) => setBudget(Number(e.target.value))}
                        className="w-full rounded-xl border border-border bg-background pl-8 pr-4 py-2 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                  </div>

                  <div className="flex justify-between border-t border-border/40 pt-2 mt-1">
                    <span className="text-muted-foreground">Booking Subtotal (Base)</span>
                    <span className="font-semibold text-foreground">{formatCurrency(parsedBudget, currency)}</span>
                  </div>

                  <div className="flex justify-between items-center text-[11px] bg-card/60 p-2 rounded-lg border border-border/40">
                    <div className="flex items-center gap-1">
                      <span className="text-muted-foreground">Platform Commission ({commissionPercent}%)</span>
                      <span title="Configured by admin. Deducted from creator earnings.">
                        <HelpCircle className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                      </span>
                    </div>
                    <span className="font-semibold text-foreground">-{formatCurrency(commissionAmount, currency)}</span>
                  </div>

                  <div className="flex justify-between text-emerald-500 font-semibold bg-emerald-500/10 p-2 rounded-lg">
                    <span>Creator Net Earnings</span>
                    <span>{formatCurrency(creatorEarnings, currency)}</span>
                  </div>

                  <div className="flex justify-between border-t border-border/40 pt-2">
                    <span className="text-muted-foreground">GST ({gstPercent}%)</span>
                    <span className="font-semibold text-foreground">+{formatCurrency(gstAmount, currency)}</span>
                  </div>
                </div>

                <div className="border-t border-border pt-3 mt-3 flex justify-between items-end">
                  <div>
                    <span className="text-xs text-muted-foreground font-semibold block">Total Business Payment</span>
                    <span className="text-[10px] text-muted-foreground block">(Inclusive of Taxes)</span>
                  </div>
                  <span className="text-xl font-extrabold text-primary">
                    {formatCurrency(businessPayment, currency)}
                  </span>
                </div>
              </div>

              {/* Action Button */}
              <button
                type="submit"
                disabled={loading || parsedBudget <= 0}
                className="w-full h-11 rounded-xl gradient-primary text-sm font-bold text-white shadow-md shadow-primary/20 hover:opacity-90 transition-opacity mt-6 disabled:opacity-50"
              >
                {loading ? 'Processing...' : 'Confirm & Request Booking'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

