import React from 'react';
import Link from 'next/link';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full border-t border-border bg-card/30 py-12 text-sm transition-colors mt-auto">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand Info */}
          <div className="flex flex-col gap-3">
            <Link href="/" className="flex items-center gap-1.5 text-xl font-bold tracking-tight">
              <span className="gradient-primary flex h-7 w-7 items-center justify-center rounded-lg text-white font-mono shadow-md text-sm">
                C
              </span>
              <span className="font-sans font-extrabold text-foreground">
                Creator<span className="text-primary">Connect</span>
              </span>
            </Link>
            <p className="text-muted-foreground text-xs leading-relaxed max-w-xs">
              The premier marketplace connecting local restaurants, boutiques, and services with community content creators for high-engagement social media collaborations.
            </p>
          </div>

          {/* Explore Links */}
          <div className="flex flex-col gap-2">
            <h4 className="font-bold text-foreground mb-1 text-xs uppercase tracking-wider">Explore</h4>
            <Link href="/creators" className="text-muted-foreground hover:text-primary transition-colors">
              Browse All Creators
            </Link>
            <Link href="/creators?category=food-dining" className="text-muted-foreground hover:text-primary transition-colors">
              Food & Dining
            </Link>
            <Link href="/creators?category=fashion-lifestyle" className="text-muted-foreground hover:text-primary transition-colors">
              Fashion & Lifestyle
            </Link>
            <Link href="/creators?category=beauty-cosmetics" className="text-muted-foreground hover:text-primary transition-colors">
              Beauty & Cosmetics
            </Link>
          </div>

          {/* Platform Links */}
          <div className="flex flex-col gap-2">
            <h4 className="font-bold text-foreground mb-1 text-xs uppercase tracking-wider">Platform</h4>
            <Link href="/#how-it-works" className="text-muted-foreground hover:text-primary transition-colors">
              How it Works
            </Link>
            <Link href="/#faq" className="text-muted-foreground hover:text-primary transition-colors">
              Frequently Asked Questions
            </Link>
            <Link href="/login" className="text-muted-foreground hover:text-primary transition-colors">
              Admin Login
            </Link>
          </div>

          {/* Legal / Contact */}
          <div className="flex flex-col gap-2">
            <h4 className="font-bold text-foreground mb-1 text-xs uppercase tracking-wider">Legal & Support</h4>
            <span className="text-muted-foreground text-xs">
              Email: <a href="mailto:support@creatorconnect.in" className="hover:text-primary">support@creatorconnect.in</a>
            </span>
            <span className="text-muted-foreground text-xs mb-1">
              Phone: +91 98765 43210
            </span>
            <div className="flex flex-col gap-1 text-xs text-muted-foreground border-t border-border/50 pt-2 mt-1">
              <span className="hover:text-primary cursor-pointer">Privacy Policy</span>
              <span className="hover:text-primary cursor-pointer">Terms of Service</span>
              <span className="hover:text-primary cursor-pointer">Refund Policy</span>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-border pt-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-muted-foreground">
          <p>© {currentYear} CreatorConnect. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <p>Made for local businesses & creators</p>
            <span>•</span>
            <p>Default currency: INR (₹)</p>
          </div>
        </div>
      </div>
    </footer>
  );
}

