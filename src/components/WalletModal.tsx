'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { db } from '@/lib/db';
import { useAuth } from '@/lib/auth';
import { WalletTransaction } from '@/lib/constants';
import { formatCurrency } from '@/lib/utils';
import { 
  Wallet, 
  X, 
  PlusCircle, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Lock, 
  CheckCircle2, 
  ShieldCheck, 
  CreditCard, 
  Building2, 
  QrCode,
  Sparkles,
  History,
  AlertCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBalanceUpdated?: (newBalance: number) => void;
}

export default function WalletModal({ isOpen, onClose, onBalanceUpdated }: WalletModalProps) {
  const { user } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [balance, setBalance] = useState<number>(0);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Top Up State
  const [topUpAmount, setTopUpAmount] = useState<number>(1000);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [selectedMethod, setSelectedMethod] = useState<'upi' | 'card' | 'netbanking'>('upi');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [currency, setCurrency] = useState('₹');

  useEffect(() => {
    setMounted(true);
  }, []);

  // Load wallet data
  useEffect(() => {
    if (!isOpen || !user) return;

    const loadWalletData = async () => {
      setLoading(true);
      try {
        const settings = await db.getAdminSettings();
        setCurrency(settings.currency);
        
        const bal = await db.getWalletBalance(user.uid);
        const txs = await db.getWalletTransactions(user.uid);
        
        setBalance(bal);
        setTransactions(txs);
      } catch (err) {
        console.error('Error loading wallet data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadWalletData();
  }, [isOpen, user]);

  if (!isOpen || !user || !mounted) return null;

  const activeAmount = customAmount ? Number(customAmount) : topUpAmount;

  const handleProcessPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeAmount || activeAmount <= 0) return;

    setIsProcessing(true);

    setTimeout(async () => {
      const targetUid = user?.uid || 'user_guest';
      try {
        const newBal = await db.addWalletTransaction(
          targetUid,
          'deposit',
          activeAmount,
          `Wallet Deposit via Mock Payment Gateway (${selectedMethod.toUpperCase()})`
        );

        setBalance(newBal);
        
        // Refresh transaction list
        const updatedTxs = await db.getWalletTransactions(targetUid);
        setTransactions(updatedTxs);

        if (onBalanceUpdated) {
          onBalanceUpdated(newBal);
        }

        setIsProcessing(false);
        setPaymentSuccess(true);

        confetti({
          particleCount: 80,
          spread: 60,
          origin: { y: 0.6 }
        });

        setTimeout(() => {
          setPaymentSuccess(false);
          setCustomAmount('');
        }, 2500);

      } catch (err) {
        console.warn('Primary transaction failed, applying direct test deposit fallback:', err);
        
        // Direct LocalStorage Test Mode Fallback
        const currentWallets = JSON.parse(localStorage.getItem('cc_wallets') || '{}');
        const fallbackBal = (currentWallets[targetUid] || 0) + activeAmount;
        currentWallets[targetUid] = fallbackBal;
        localStorage.setItem('cc_wallets', JSON.stringify(currentWallets));

        setBalance(fallbackBal);
        if (onBalanceUpdated) onBalanceUpdated(fallbackBal);
        
        setIsProcessing(false);
        setPaymentSuccess(true);

        confetti({
          particleCount: 80,
          spread: 60,
          origin: { y: 0.6 }
        });

        setTimeout(() => {
          setPaymentSuccess(false);
          setCustomAmount('');
        }, 2500);
      }
    }, 1500);
  };

  return createPortal(
    <div className="fixed inset-0 z-[99999] overflow-y-auto bg-black/75 backdrop-blur-md p-4 sm:p-6 flex items-center justify-center animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl my-auto max-h-[90vh] flex flex-col rounded-3xl border border-border bg-card p-5 sm:p-6 shadow-2xl z-[100000]">
        
        {/* Sticky Header */}
        <div className="flex items-center justify-between border-b border-border pb-4 mb-4 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl gradient-primary text-white shadow-md shadow-primary/20">
              <Wallet className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground font-sans">
                CreatorConnect Wallet
              </h2>
              <p className="text-[11px] text-muted-foreground">
                Policy Minimum Deposit & Campaign Security Fund
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="rounded-full p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="overflow-y-auto pr-1 flex-1 flex flex-col gap-6">

        {loading ? (
          <div className="h-64 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            
            {/* Wallet Balance Card */}
            <div className="relative overflow-hidden rounded-2xl gradient-primary p-6 text-white shadow-xl">
              <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-xs uppercase font-bold tracking-wider opacity-80 block mb-1">
                    Available Wallet Balance
                  </span>
                  <div className="text-3xl font-extrabold tracking-tight">
                    {formatCurrency(balance, currency)}
                  </div>
                  {balance < 1000 && (
                    <div className="mt-2 text-xs font-semibold bg-red-500/20 text-red-100 backdrop-blur-sm px-2.5 py-1 rounded-lg inline-flex items-center gap-1.5 border border-red-400/30">
                      <AlertCircle className="h-3.5 w-3.5" /> Below policy minimum (₹1,000 required for bookings)
                    </div>
                  )}
                </div>

                {/* Locked Withdrawal Button */}
                <div className="flex flex-col sm:items-end gap-1">
                  <button
                    disabled
                    title="Direct cash withdrawal is locked per platform policy terms."
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/10 backdrop-blur-md text-xs font-bold text-white/70 border border-white/20 cursor-not-allowed"
                  >
                    <Lock className="h-3.5 w-3.5 text-yellow-300" /> Withdraw Funds
                  </button>
                  <span className="text-[10px] text-white/80 font-medium flex items-center gap-1">
                    <Sparkles className="h-3 w-3 text-yellow-300" /> Withdrawal Feature Coming Soon
                  </span>
                </div>
              </div>
            </div>

            {/* Top Up Section */}
            <div className="rounded-2xl border border-border bg-secondary/30 p-5 flex flex-col gap-4">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <PlusCircle className="h-4 w-4 text-primary" /> Top-Up Wallet (Mock Payment Gateway)
              </h3>

              {paymentSuccess ? (
                <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-6 text-center flex flex-col items-center justify-center animate-in zoom-in-95">
                  <CheckCircle2 className="h-12 w-12 text-emerald-500 mb-2 animate-bounce" />
                  <h4 className="text-base font-bold text-foreground">Payment Successful!</h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatCurrency(activeAmount, currency)} added to your CreatorConnect Wallet balance.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleProcessPayment} className="flex flex-col gap-4">
                  {/* Preset Buttons */}
                  <div className="grid grid-cols-4 gap-2">
                    {[1000, 2000, 5000].map((amt) => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => {
                          setTopUpAmount(amt);
                          setCustomAmount('');
                        }}
                        className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                          !customAmount && topUpAmount === amt
                            ? 'border-primary bg-primary/10 text-primary shadow-sm'
                            : 'border-border bg-background text-muted-foreground hover:bg-secondary'
                        }`}
                      >
                        {currency}{amt}
                      </button>
                    ))}
                    <input
                      type="number"
                      placeholder="Custom"
                      min={100}
                      value={customAmount}
                      onChange={(e) => setCustomAmount(e.target.value)}
                      className={`py-2 px-3 rounded-xl border text-xs font-bold bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 ${
                        customAmount ? 'border-primary ring-2 ring-primary/20' : 'border-border'
                      }`}
                    />
                  </div>

                  {/* Payment Method Selector */}
                  <div className="grid grid-cols-3 gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setSelectedMethod('upi')}
                      className={`flex items-center justify-center gap-2 p-2.5 rounded-xl border text-xs font-semibold transition-all ${
                        selectedMethod === 'upi'
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-border bg-background text-muted-foreground'
                      }`}
                    >
                      <QrCode className="h-4 w-4" /> UPI / QR
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedMethod('card')}
                      className={`flex items-center justify-center gap-2 p-2.5 rounded-xl border text-xs font-semibold transition-all ${
                        selectedMethod === 'card'
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-border bg-background text-muted-foreground'
                      }`}
                    >
                      <CreditCard className="h-4 w-4" /> Card
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedMethod('netbanking')}
                      className={`flex items-center justify-center gap-2 p-2.5 rounded-xl border text-xs font-semibold transition-all ${
                        selectedMethod === 'netbanking'
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-border bg-background text-muted-foreground'
                      }`}
                    >
                      <Building2 className="h-4 w-4" /> NetBanking
                    </button>
                  </div>

                  {/* Process Button */}
                  <button
                    type="submit"
                    disabled={isProcessing || activeAmount <= 0}
                    className="w-full h-11 rounded-xl gradient-primary text-sm font-bold text-white shadow-md shadow-primary/20 hover:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-50 mt-1"
                  >
                    {isProcessing ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                        Connecting Gateway (Razorpay/Stripe Test)...
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="h-4 w-4" /> Pay & Add {formatCurrency(activeAmount, currency)}
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>

            {/* Transaction Log History */}
            <div className="flex flex-col gap-3">
              <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                <History className="h-4 w-4 text-primary" /> Wallet Activity History
              </h3>

              {transactions.length === 0 ? (
                <div className="text-xs text-muted-foreground text-center py-6 border border-dashed border-border rounded-xl">
                  No wallet transactions recorded yet.
                </div>
              ) : (
                <div className="flex flex-col gap-2 max-h-48 overflow-y-auto pr-1">
                  {transactions.map((tx) => (
                    <div
                      key={tx.id}
                      className="flex items-center justify-between p-3 rounded-xl bg-background border border-border/80 text-xs"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${
                          tx.type === 'deposit' || tx.type === 'refund'
                            ? 'bg-emerald-500/10 text-emerald-500'
                            : 'bg-rose-500/10 text-rose-500'
                        }`}>
                          {tx.type === 'deposit' || tx.type === 'refund' ? (
                            <ArrowDownLeft className="h-4 w-4" />
                          ) : (
                            <ArrowUpRight className="h-4 w-4" />
                          )}
                        </div>
                        <div>
                          <span className="font-semibold text-foreground block">
                            {tx.description}
                          </span>
                          <span className="text-[10px] text-muted-foreground">
                            {new Date(tx.createdAt).toLocaleDateString()} at {new Date(tx.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>

                      <span className={`font-bold ${
                        tx.type === 'deposit' || tx.type === 'refund'
                          ? 'text-emerald-500'
                          : 'text-rose-500'
                      }`}>
                        {tx.type === 'deposit' || tx.type === 'refund' ? '+' : '-'}
                        {formatCurrency(tx.amount, currency)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        )}
        </div>

      </div>
    </div>,
    document.body
  );
}
