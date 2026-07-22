'use client';

import React, { useState, useEffect } from 'react';
import { db } from '@/lib/db';
import { AdminSettings } from '@/lib/constants';
import { 
  Settings, 
  Percent, 
  ShieldCheck, 
  AlertOctagon, 
  HelpCircle, 
  CheckCircle2, 
  Mail, 
  Phone,
  FileText,
  Search,
  Wallet,
  CreditCard,
  Key,
  Lock,
  Scale
} from 'lucide-react';

export default function AdminSettingsPage() {
  const [platformName, setPlatformName] = useState('');
  const [platformLogo, setPlatformLogo] = useState('');
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [defaultCommissionPercent, setDefaultCommissionPercent] = useState<number>(10);
  const [currency, setCurrency] = useState('₹');
  const [gstPercent, setGstPercent] = useState<number>(18);
  const [supportEmail, setSupportEmail] = useState('');
  const [supportPhone, setSupportPhone] = useState('');
  const [privacyPolicy, setPrivacyPolicy] = useState('');
  const [termsOfService, setTermsOfService] = useState('');
  const [refundPolicy, setRefundPolicy] = useState('');
  const [seoTitle, setSeoTitle] = useState('');
  const [seoDescription, setSeoDescription] = useState('');

  // Payment & Wallet Settings State
  const [minWalletDeposit, setMinWalletDeposit] = useState<number>(1000);
  const [unconfirmedDeductionFee, setUnconfirmedDeductionFee] = useState<number>(100);
  const [baseBookingPlatformFee, setBaseBookingPlatformFee] = useState<number>(500);
  const [razorpayKeyId, setRazorpayKeyId] = useState('');
  const [razorpaySecret, setRazorpaySecret] = useState('');
  const [stripePublicKey, setStripePublicKey] = useState('');
  const [stripeSecretKey, setStripeSecretKey] = useState('');
  const [paymentMode, setPaymentMode] = useState<'test' | 'live'>('test');
  const [bookingPolicyTerms, setBookingPolicyTerms] = useState('');

  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);

  // Load existing settings
  useEffect(() => {
    const loadSettings = async () => {
      setLoading(true);
      try {
        const data = await db.getAdminSettings();
        setPlatformName(data.platformName || '');
        setPlatformLogo(data.platformLogo || '');
        setMaintenanceMode(data.maintenanceMode || false);
        setDefaultCommissionPercent(data.defaultCommissionPercent || 10);
        setCurrency(data.currency || '₹');
        setGstPercent(data.gstPercent || 18);
        setSupportEmail(data.supportEmail || '');
        setSupportPhone(data.supportPhone || '');
        setPrivacyPolicy(data.privacyPolicy || '');
        setTermsOfService(data.termsOfService || '');
        setRefundPolicy(data.refundPolicy || '');
        setSeoTitle(data.seoTitle || '');
        setSeoDescription(data.seoDescription || '');

        // Wallet & Payment settings
        setMinWalletDeposit(data.minWalletDeposit !== undefined ? data.minWalletDeposit : 1000);
        setUnconfirmedDeductionFee(data.unconfirmedDeductionFee !== undefined ? data.unconfirmedDeductionFee : 100);
        setBaseBookingPlatformFee(data.baseBookingPlatformFee !== undefined ? data.baseBookingPlatformFee : 500);
        setRazorpayKeyId(data.razorpayKeyId || 'rzp_test_9876543210');
        setRazorpaySecret(data.razorpaySecret || 'rzp_sec_test_secret_key');
        setStripePublicKey(data.stripePublicKey || 'pk_test_51Nx9876543210');
        setStripeSecretKey(data.stripeSecretKey || 'sk_test_51Nx9876543210');
        setPaymentMode(data.paymentMode || 'test');
        setBookingPolicyTerms(data.bookingPolicyTerms || '');
      } catch (e) {
        console.error('Error loading administrative settings:', e);
      } finally {
        setLoading(false);
      }
    };
    loadSettings();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(false);

    try {
      const updated: AdminSettings = {
        platformName,
        platformLogo,
        maintenanceMode,
        defaultCommissionPercent: Number(defaultCommissionPercent),
        currency,
        gstPercent: Number(gstPercent),
        supportEmail,
        supportPhone,
        privacyPolicy,
        termsOfService,
        refundPolicy,
        seoTitle,
        seoDescription,
        minWalletDeposit: Number(minWalletDeposit),
        unconfirmedDeductionFee: Number(unconfirmedDeductionFee),
        baseBookingPlatformFee: Number(baseBookingPlatformFee),
        razorpayKeyId,
        razorpaySecret,
        stripePublicKey,
        stripeSecretKey,
        paymentMode,
        bookingPolicyTerms
      };

      await db.updateAdminSettings(updated);
      setSuccess(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to save settings:', err);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto w-full max-w-4xl px-4 sm:px-6 lg:px-8 py-12 flex-grow">
        <div className="h-96 rounded-2xl shimmer-loading border border-border"></div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-4xl px-4 sm:px-6 lg:px-8 py-10 flex-grow">
      <div className="flex items-center gap-2 mb-8">
        <Settings className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-extrabold text-foreground font-sans">
          Platform System Settings
        </h1>
      </div>

      {success && (
        <div className="mb-6 rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-4 text-xs font-bold text-emerald-500 flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="h-4.5 w-4.5" /> Platform settings updated successfully! Configuration is live.
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        
        {/* Basic configuration variables */}
        <div className="glass-panel rounded-2xl border border-border p-6 shadow-sm flex flex-col gap-4">
          <h3 className="text-sm font-bold text-foreground border-b border-border/80 pb-2">
            Base Parameters
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">
                Platform Brand Name
              </label>
              <input
                type="text"
                required
                value={platformName}
                onChange={(e) => setPlatformName(e.target.value)}
                className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">
                Logo Icon (Emoji or Char)
              </label>
              <input
                type="text"
                required
                value={platformLogo}
                onChange={(e) => setPlatformLogo(e.target.value)}
                className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">
                Local Currency Token
              </label>
              <input
                type="text"
                required
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">
                Default Commission Rate (%)
              </label>
              <input
                type="number"
                required
                min={0}
                max={50}
                value={defaultCommissionPercent}
                onChange={(e) => setDefaultCommissionPercent(Number(e.target.value))}
                className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">
                GST Tax Rate (%)
              </label>
              <input
                type="number"
                required
                min={0}
                max={30}
                value={gstPercent}
                onChange={(e) => setGstPercent(Number(e.target.value))}
                className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          {/* Maintenance Mode */}
          <div className="flex items-center justify-between bg-yellow-500/5 p-4 rounded-xl border border-yellow-500/20 mt-2">
            <div className="flex items-start gap-3">
              <AlertOctagon className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
              <div>
                <span className="text-xs font-bold text-foreground block">Platform Maintenance Mode</span>
                <span className="text-[10px] text-muted-foreground">If enabled, guests will see a placeholder offline screen. Only admins can browse.</span>
              </div>
            </div>
            <input
              type="checkbox"
              checked={maintenanceMode}
              onChange={(e) => setMaintenanceMode(e.target.checked)}
              className="h-5 w-5 rounded border-border text-primary focus:ring-primary/20 accent-primary"
            />
          </div>
        </div>

        {/* Wallet Deposit & Policy Rules Configuration */}
        <div className="glass-panel rounded-2xl border border-border p-6 shadow-sm flex flex-col gap-4">
          <h3 className="text-sm font-bold text-foreground border-b border-border/80 pb-2 flex items-center gap-2">
            <Wallet className="h-4 w-4 text-primary" /> Wallet & Booking Policy Controls
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">
                Minimum Wallet Deposit ({currency})
              </label>
              <input
                type="number"
                required
                min={0}
                value={minWalletDeposit}
                onChange={(e) => setMinWalletDeposit(Number(e.target.value))}
                className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              <span className="text-[10px] text-muted-foreground mt-1 block">Customer must have this balance before booking</span>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">
                Unconfirmed Deduction Fee ({currency})
              </label>
              <input
                type="number"
                required
                min={0}
                value={unconfirmedDeductionFee}
                onChange={(e) => setUnconfirmedDeductionFee(Number(e.target.value))}
                className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              <span className="text-[10px] text-muted-foreground mt-1 block">Fee deducted if booking deal fails or gets cancelled</span>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">
                Base Booking Service Charge ({currency})
              </label>
              <input
                type="number"
                required
                min={0}
                value={baseBookingPlatformFee}
                onChange={(e) => setBaseBookingPlatformFee(Number(e.target.value))}
                className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              <span className="text-[10px] text-muted-foreground mt-1 block">Per-booking platform fee baseline</span>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">
              Customer Booking & Wallet Policy Agreement Terms
            </label>
            <textarea
              rows={4}
              value={bookingPolicyTerms}
              onChange={(e) => setBookingPolicyTerms(e.target.value)}
              className="w-full rounded-xl border border-border bg-background px-4 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>

        {/* Payment Gateway API Credentials */}
        <div className="glass-panel rounded-2xl border border-border p-6 shadow-sm flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-border/80 pb-2">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-primary" /> Payment Gateway API Credentials
            </h3>
            <div className="flex items-center gap-2 bg-secondary/50 p-1 rounded-xl border border-border">
              <button
                type="button"
                onClick={() => setPaymentMode('test')}
                className={`px-3 py-1 rounded-lg text-[10px] font-bold transition-all ${
                  paymentMode === 'test' ? 'bg-amber-500 text-white shadow-sm' : 'text-muted-foreground'
                }`}
              >
                Test Gateway Mode
              </button>
              <button
                type="button"
                onClick={() => setPaymentMode('live')}
                className={`px-3 py-1 rounded-lg text-[10px] font-bold transition-all ${
                  paymentMode === 'live' ? 'bg-emerald-500 text-white shadow-sm' : 'text-muted-foreground'
                }`}
              >
                Live Mode
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">
                Razorpay Key ID
              </label>
              <input
                type="text"
                value={razorpayKeyId}
                onChange={(e) => setRazorpayKeyId(e.target.value)}
                className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">
                Razorpay Secret Key
              </label>
              <input
                type="password"
                value={razorpaySecret}
                onChange={(e) => setRazorpaySecret(e.target.value)}
                className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">
                Stripe Publishable Key
              </label>
              <input
                type="text"
                value={stripePublicKey}
                onChange={(e) => setStripePublicKey(e.target.value)}
                className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">
                Stripe Secret Key
              </label>
              <input
                type="password"
                value={stripeSecretKey}
                onChange={(e) => setStripeSecretKey(e.target.value)}
                className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>
        </div>

        {/* Support contacts */}
        <div className="glass-panel rounded-2xl border border-border p-6 shadow-sm flex flex-col gap-4">
          <h3 className="text-sm font-bold text-foreground border-b border-border/80 pb-2">
            Support Info
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">
                Support Email Address
              </label>
              <input
                type="email"
                required
                value={supportEmail}
                onChange={(e) => setSupportEmail(e.target.value)}
                className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">
                Support Phone Number
              </label>
              <input
                type="text"
                required
                value={supportPhone}
                onChange={(e) => setSupportPhone(e.target.value)}
                className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>
        </div>

        {/* Legal policies */}
        <div className="glass-panel rounded-2xl border border-border p-6 shadow-sm flex flex-col gap-4">
          <h3 className="text-sm font-bold text-foreground border-b border-border/80 pb-2">
            Legal Terms & Policies
          </h3>
          <div className="flex flex-col gap-4">
            <div>
              <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">
                Privacy Policy Summary
              </label>
              <textarea
                rows={3}
                value={privacyPolicy}
                onChange={(e) => setPrivacyPolicy(e.target.value)}
                className="w-full rounded-xl border border-border bg-background px-4 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">
                Terms of Service Terms
              </label>
              <textarea
                rows={3}
                value={termsOfService}
                onChange={(e) => setTermsOfService(e.target.value)}
                className="w-full rounded-xl border border-border bg-background px-4 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">
                Refund Policy Details
              </label>
              <textarea
                rows={3}
                value={refundPolicy}
                onChange={(e) => setRefundPolicy(e.target.value)}
                className="w-full rounded-xl border border-border bg-background px-4 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
              />
            </div>
          </div>
        </div>

        {/* Default SEO metadata */}
        <div className="glass-panel rounded-2xl border border-border p-6 shadow-sm flex flex-col gap-4">
          <h3 className="text-sm font-bold text-foreground border-b border-border/80 pb-2">
            Global Search Engine Optimization (SEO)
          </h3>
          <div className="flex flex-col gap-4">
            <div>
              <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">
                SEO Meta Title Tag
              </label>
              <input
                type="text"
                required
                value={seoTitle}
                onChange={(e) => setSeoTitle(e.target.value)}
                className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">
                SEO Meta Description Tag
              </label>
              <textarea
                rows={3}
                required
                value={seoDescription}
                onChange={(e) => setSeoDescription(e.target.value)}
                className="w-full rounded-xl border border-border bg-background px-4 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          className="w-full h-11 rounded-xl gradient-primary text-sm font-bold text-white shadow-md shadow-primary/20 hover:opacity-95 transition-opacity"
        >
          Publish System Settings Changes
        </button>

      </form>
    </div>
  );
}

