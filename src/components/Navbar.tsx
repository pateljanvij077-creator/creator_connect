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
  Users
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Navbar() {
  const { user, profile, logout, isBusiness, isCreator, isAdmin } = useAuth();
  const { theme, setTheme } = useTheme();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

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
    <nav className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-md transition-colors">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center gap-1.5 text-2xl font-bold tracking-tight">
              <span className="gradient-primary flex h-8 w-8 items-center justify-center rounded-lg text-white font-mono shadow-md">
                C
              </span>
              <span className="font-sans font-extrabold text-foreground">
                Creator<span className="text-primary">Connect</span>
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
                  'text-sm font-medium transition-colors hover:text-primary',
                  pathname === link.href ? 'text-primary' : 'text-muted-foreground'
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right Actions */}
          <div className="hidden md:flex items-center gap-4">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="rounded-full p-2 text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>

            {/* Auth Dropdown */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 rounded-full border border-border bg-card p-1.5 pr-3 hover:bg-secondary/50 transition-colors"
                >
                  {getProfileImage() ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={getProfileImage()}
                      alt={getUserName()}
                      className="h-7 w-7 rounded-full object-cover border border-border"
                    />
                  ) : (
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <User className="h-4 w-4" />
                    </div>
                  )}
                  <span className="text-xs font-semibold max-w-[120px] truncate">
                    {getUserName()}
                  </span>
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-xl border border-border bg-card p-2 shadow-lg ring-1 ring-black/5 z-50">
                    <div className="px-3 py-2 border-b border-border mb-1 text-xs">
                      <p className="font-semibold text-foreground">{getUserName()}</p>
                      <p className="text-muted-foreground truncate">{user.email}</p>
                      <span className="inline-block mt-1.5 px-2 py-0.5 rounded-full bg-primary/10 text-[10px] font-bold text-primary uppercase">
                        {user.role}
                      </span>
                    </div>

                    {isBusiness && (
                      <Link
                        href="/business/profile"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
                      >
                        <User className="h-4 w-4" /> Edit Profile
                      </Link>
                    )}

                    {isCreator && (
                      <Link
                        href="/creator/profile"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
                      >
                        <User className="h-4 w-4" /> Edit Profile
                      </Link>
                    )}

                    <button
                      onClick={() => {
                        setDropdownOpen(false);
                        logout();
                      }}
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors"
                    >
                      <LogOut className="h-4 w-4" /> Log Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  href="/login"
                  className="text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"
                >
                  Log In
                </Link>
                <Link
                  href="/signup"
                  className="rounded-xl gradient-primary px-4 py-2 text-sm font-semibold text-white shadow-md shadow-primary/10 hover:opacity-90 transition-opacity"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-3 md:hidden">
            <button
              onClick={toggleTheme}
              className="rounded-full p-2 text-muted-foreground hover:bg-secondary hover:text-foreground"
            >
              {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="rounded-lg p-2 text-muted-foreground hover:bg-secondary"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="border-t border-border bg-background px-4 py-4 md:hidden flex flex-col gap-3 shadow-inner">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className={cn(
                'block rounded-lg px-3 py-2 text-base font-semibold transition-colors',
                pathname === link.href 
                  ? 'bg-primary/10 text-primary' 
                  : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
              )}
            >
              {link.label}
            </Link>
          ))}

          <hr className="border-border my-1" />

          {user ? (
            <div className="flex flex-col gap-2">
              <div className="px-3 py-2">
                <p className="text-sm font-bold text-foreground">{getUserName()}</p>
                <p className="text-xs text-muted-foreground">{user.email}</p>
                <span className="inline-block mt-1 px-2 py-0.5 rounded-full bg-primary/10 text-[9px] font-bold text-primary uppercase">
                  {user.role}
                </span>
              </div>
              
              {isBusiness && (
                <Link
                  href="/business/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground"
                >
                  <User className="h-4 w-4" /> Edit Profile
                </Link>
              )}

              {isCreator && (
                <Link
                  href="/creator/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground"
                >
                  <User className="h-4 w-4" /> Edit Profile
                </Link>
              )}

              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  logout();
                }}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-destructive hover:bg-destructive/10"
              >
                <LogOut className="h-4 w-4" /> Log Out
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="flex h-11 items-center justify-center rounded-xl border border-border text-sm font-semibold hover:bg-secondary"
              >
                Log In
              </Link>
              <Link
                href="/signup"
                onClick={() => setMobileMenuOpen(false)}
                className="flex h-11 items-center justify-center rounded-xl gradient-primary text-sm font-semibold text-white shadow-md shadow-primary/10"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}

