'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { useTheme } from 'next-themes';
import { 
  Sun, 
  Moon, 
  Menu, 
  X, 
  User, 
  LogOut, 
  Compass, 
  LayoutDashboard, 
  Calendar, 
  Link as LinkIcon, 
  Settings, 
  ShieldAlert,
  Users,
  Wallet
} from 'lucide-react';
import { cn, formatCurrency } from '@/lib/utils';
import { db } from '@/lib/db';
import WalletModal from './WalletModal';

export default function Navbar() {
  const { user, profile, logout, isBusiness, isCreator, isAdmin } = useAuth();
  const { theme, setTheme } = useTheme();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isWalletOpen, setIsWalletOpen] = useState(false);
  const [walletBalance, setWalletBalance] = useState<number>(0);
  const [currency, setCurrency] = useState('₹');

  React.useEffect(() => {
    if (!user) return;
    const fetchWallet = async () => {
      try {
        const settings = await db.getAdminSettings();
        setCurrency(settings.currency);
        const bal = await db.getWalletBalance(user.uid);
        setWalletBalance(bal);
      } catch (err) {
        console.error('Error fetching navbar wallet balance:', err);
      }
    };
    fetchWallet();
  }, [user]);

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const navLinks = [
    { label: 'Explore Creators', href: '/creators', show: true },
  ];

  if (isBusiness) {
    navLinks.push(
      { label: 'My Bookings', href: '/business/bookings', show: true },
      { label: 'Business Dashboard', href: '/business/dashboard', show: true }
    );
  } else if (isCreator) {
    navLinks.push(
      { label: 'Campaign Requests', href: '/creator/bookings', show: true },
      { label: 'Marketing Links', href: '/creator/links', show: true },
      { label: 'Creator Dashboard', href: '/creator/dashboard', show: true }
    );
  } else if (isAdmin) {
    navLinks.push(
      { label: 'Admin Dashboard', href: '/admin/dashboard', show: true },
      { label: 'Manage Users', href: '/admin/users', show: true },
      { label: 'Override Commissions', href: '/admin/bookings', show: true },
      { label: 'Settings', href: '/admin/settings', show: true }
    );
  }

  const getProfileImage = () => {
    if (profile) {
      if ('photo' in profile) return profile.photo;
      if ('logo' in profile) return profile.logo;
    }
    return '';
  };

  const getUserName = () => {
    if (profile) return profile.name;
    if (isAdmin) return 'Platform Admin';
    return user?.email || 'User';
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border/80 bg-slate-900/95 text-white dark:bg-slate-950/95 backdrop-blur-xl shadow-lg transition-colors">
      <div className="w-full px-3 sm:px-6 lg:px-10">
        <div className="flex h-16 sm:h-20 items-center justify-between">
          
          {/* Logo as Image */}
          <div className="flex items-center gap-2">
            <Link 
              href="/" 
              className="flex items-center gap-2 bg-white/95 hover:bg-white px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-xl border border-slate-200/80 shadow-sm transition-all hover:scale-105 active:scale-95"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src="/logo.png" 
                alt="CreatorConnect Logo" 
                className="h-8 sm:h-12 w-auto object-contain" 
              />
              <span className="text-xs sm:text-sm font-extrabold text-slate-900 font-sans tracking-tight hidden xs:inline">
                Creator<span className="text-indigo-600">Connect</span>
              </span>
            </Link>
          </div>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'text-sm font-semibold transition-colors hover:text-indigo-400',
                  pathname === link.href ? 'text-indigo-400 font-bold' : 'text-slate-300'
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* User Controls & Mobile Toggle */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Wallet Button (Mobile & Desktop) */}
            {user && (
              <button
                type="button"
                onClick={() => setIsWalletOpen(true)}
                className="flex items-center gap-1.5 rounded-xl bg-indigo-600/20 border border-indigo-500/40 px-2.5 py-1.5 text-xs font-bold text-indigo-300 hover:bg-indigo-600/30 transition-all shadow-sm active:scale-95"
              >
                <Wallet className="h-3.5 w-3.5 text-indigo-400 flex-shrink-0" />
                <span className="text-[11px] sm:text-xs">
                  {currency}{walletBalance.toLocaleString()}
                </span>
              </button>
            )}

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="rounded-full p-2 text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>

            {/* User Profile Dropdown (Desktop) */}
            {user ? (
              <div className="relative hidden md:block">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800/80 p-1.5 pr-3 hover:bg-slate-800 transition-colors"
                >
                  {getProfileImage() ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img 
                      src={getProfileImage()} 
                      alt={getUserName()} 
                      className="h-7 w-7 rounded-full object-cover border border-slate-600" 
                    />
                  ) : (
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-600/30 text-indigo-300 font-bold text-xs">
                      {getUserName().charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span className="text-xs font-bold text-slate-200 max-w-[100px] truncate">
                    {getUserName()}
                  </span>
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-slate-700 bg-slate-900 p-2 shadow-2xl z-50 flex flex-col gap-1 animate-in fade-in zoom-in-95">
                    <div className="px-3 py-2 border-b border-slate-800">
                      <p className="text-xs font-bold text-white truncate">{getUserName()}</p>
                      <p className="text-[10px] text-slate-400 truncate">{user.email}</p>
                      <span className="inline-block mt-1 px-2 py-0.5 rounded-full bg-indigo-500/20 text-[9px] font-bold text-indigo-300 uppercase">
                        {user.role}
                      </span>
                    </div>

                    {isBusiness && (
                      <Link
                        href="/business/profile"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-white"
                      >
                        <User className="h-4 w-4" /> Edit Profile
                      </Link>
                    )}

                    {isCreator && (
                      <Link
                        href="/creator/profile"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-white"
                      >
                        <User className="h-4 w-4" /> Edit Profile
                      </Link>
                    )}

                    <button
                      onClick={() => {
                        setDropdownOpen(false);
                        logout();
                      }}
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-rose-400 hover:bg-rose-500/10"
                    >
                      <LogOut className="h-4 w-4" /> Log Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <Link
                  href="/login"
                  className="text-xs font-bold text-slate-300 hover:text-white px-3 py-2 transition-colors"
                >
                  Log In
                </Link>
                <Link
                  href="/signup"
                  className="rounded-xl gradient-primary px-4 py-2 text-xs font-bold text-white shadow-md hover:opacity-90 transition-opacity"
                >
                  Sign Up
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="rounded-xl p-2 text-slate-300 hover:bg-slate-800 md:hidden"
              aria-label="Toggle mobile menu"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="border-t border-slate-800 bg-slate-900/98 px-4 py-5 md:hidden flex flex-col gap-3 shadow-2xl animate-in slide-in-from-top-2 duration-200">
          
          {/* Mobile Logo Banner inside drawer */}
          <div className="flex items-center justify-between bg-slate-800/80 p-3 rounded-2xl border border-slate-700/80 mb-1">
            <div className="flex items-center gap-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo.png" alt="CreatorConnect Logo" className="h-8 w-auto bg-white p-1 rounded-lg" />
              <span className="text-xs font-extrabold text-white">CreatorConnect Mobile</span>
            </div>
            {user && (
              <span className="text-[10px] bg-indigo-500/20 text-indigo-300 font-bold px-2.5 py-0.5 rounded-full uppercase">
                {user.role}
              </span>
            )}
          </div>

          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className={cn(
                'block rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors',
                pathname === link.href 
                  ? 'bg-indigo-600 text-white shadow-md font-bold' 
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              )}
            >
              {link.label}
            </Link>
          ))}

          <hr className="border-slate-800 my-1" />

          {user ? (
            <div className="flex flex-col gap-2">
              <div className="px-4 py-2 bg-slate-800/50 rounded-xl border border-slate-700/50">
                <p className="text-xs font-bold text-white truncate">{getUserName()}</p>
                <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
              </div>
              
              {isBusiness && (
                <Link
                  href="/business/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-300 hover:bg-slate-800 hover:text-white"
                >
                  <User className="h-4 w-4" /> Edit Profile
                </Link>
              )}

              {isCreator && (
                <Link
                  href="/creator/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-300 hover:bg-slate-800 hover:text-white"
                >
                  <User className="h-4 w-4" /> Edit Profile
                </Link>
              )}

              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  logout();
                }}
                className="flex w-full items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold text-rose-400 hover:bg-rose-500/10"
              >
                <LogOut className="h-4 w-4" /> Log Out
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-2 pt-1">
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="flex h-11 items-center justify-center rounded-xl border border-slate-700 text-xs font-bold text-white hover:bg-slate-800"
              >
                Log In
              </Link>
              <Link
                href="/signup"
                onClick={() => setMobileMenuOpen(false)}
                className="flex h-11 items-center justify-center rounded-xl gradient-primary text-xs font-bold text-white shadow-lg"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Wallet Modal */}
      <WalletModal
        isOpen={isWalletOpen}
        onClose={() => setIsWalletOpen(false)}
        onBalanceUpdated={(newBal) => setWalletBalance(newBal)}
      />
    </nav>
  );
}

