'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CATEGORIES, SEED_CREATORS, SEED_BUSINESSES, Creator } from '@/lib/constants';
import { db } from '@/lib/db';
import CreatorCard from '@/components/CreatorCard';
import { 
  Search, 
  MapPin, 
  Utensils, 
  Shirt, 
  Sparkles, 
  Laptop, 
  Compass, 
  Dumbbell, 
  Home as HomeIcon, 
  GraduationCap,
  ArrowRight,
  ShieldCheck,
  Zap,
  Star,
  DollarSign,
  Smartphone,
  Download,
  CheckCircle,
  Wallet,
  MessageSquare,
  Bell,
  Share,
  QrCode,
  Shield
} from 'lucide-react';
import { useAuth } from '@/lib/auth';

export default function Home() {
  const router = useRouter();
  const { user, isBusiness, isCreator, isAdmin, loading: authLoading } = useAuth();
  
  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [cityQuery, setCityQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  
  // App Download State
  const [downloadProgress, setDownloadProgress] = useState<number | null>(null);
  const [downloadSuccessMsg, setDownloadSuccessMsg] = useState('');
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  // REDIRECT LOGGED-IN USERS TO DASHBOARD (NOT ALLOWED TO SEE LANDING PAGE WHEN LOGGED IN)
  useEffect(() => {
    if (!authLoading && user) {
      if (isBusiness) {
        router.replace('/business/dashboard');
      } else if (isCreator) {
        router.replace('/creator/dashboard');
      } else if (isAdmin) {
        router.replace('/admin/dashboard');
      } else {
        router.replace('/creators');
      }
    }
  }, [user, authLoading, isBusiness, isCreator, isAdmin, router]);

  // Listen for Browser PWA Install Prompt
  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  // Download Direct Web App Launcher & Trigger PWA Install
  const handleDownloadWebApp = async () => {
    // If PWA prompt is supported by browser, trigger native PWA app installation
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        setDownloadSuccessMsg('CreatorConnect Web App Installed on your device!');
        setTimeout(() => setDownloadSuccessMsg(''), 4000);
        setDeferredPrompt(null);
        return;
      }
    }

    // Direct Web App Launcher File Download (.url)
    setDownloadProgress(0);
    const interval = setInterval(() => {
      setDownloadProgress((prev) => {
        if (prev === null || prev >= 100) {
          clearInterval(interval);
          
          const link = document.createElement('a');
          link.href = '/downloads/CreatorConnect-WebApp.url';
          link.download = 'CreatorConnect-WebApp.url';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);

          setDownloadSuccessMsg('CreatorConnect-WebApp downloaded! Click the downloaded file to open CreatorConnect directly.');
          setTimeout(() => {
            setDownloadProgress(null);
            setDownloadSuccessMsg('');
          }, 5000);
          return 100;
        }
        return prev + 34;
      });
    }, 200);
  };

  // Download Android APK File (Mobile Only)
  const handleDownloadApk = () => {
    setDownloadProgress(0);
    const interval = setInterval(() => {
      setDownloadProgress((prev) => {
        if (prev === null || prev >= 100) {
          clearInterval(interval);
          
          const link = document.createElement('a');
          link.href = '/downloads/CreatorConnect-App.apk';
          link.download = 'CreatorConnect-v1.2.0.apk';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);

          setDownloadSuccessMsg('CreatorConnect-v1.2.0.apk downloaded! Open on Android Mobile to install.');
          setTimeout(() => {
            setDownloadProgress(null);
            setDownloadSuccessMsg('');
          }, 5000);
          return 100;
        }
        return prev + 25;
      });
    }, 250);
  };
  
  // Creators and Stats state
  const [creators, setCreators] = useState<Creator[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCreators, setTotalCreators] = useState(0);
  const [totalCollabs, setTotalCollabs] = useState(0);

  useEffect(() => {
    const loadCreators = async () => {
      try {
        const list = await db.getCreators();
        const approved = list.filter(c => c.status !== 'suspended');
        setCreators(approved);
        setTotalCreators(approved.length);
        const sum = approved.reduce((acc, curr) => acc + curr.completedCollabs, 0);
        setTotalCollabs(sum);
      } catch (e) {
        console.error('Failed to load creators for landing page:', e);
      } finally {
        setLoading(false);
      }
    };
    loadCreators();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    let url = '/creators?';
    if (searchQuery) url += `search=${encodeURIComponent(searchQuery)}&`;
    if (cityQuery) url += `city=${encodeURIComponent(cityQuery)}&`;
    if (selectedCategory) url += `category=${encodeURIComponent(selectedCategory)}&`;
    router.push(url);
  };

  const getCategoryIcon = (iconName: string) => {
    const classIcon = "h-6 w-6 text-primary group-hover:scale-110 transition-transform duration-300";
    switch (iconName) {
      case 'Utensils': return <Utensils className={classIcon} />;
      case 'Shirt': return <Shirt className={classIcon} />;
      case 'Sparkles': return <Sparkles className={classIcon} />;
      case 'Laptop': return <Laptop className={classIcon} />;
      case 'Compass': return <Compass className={classIcon} />;
      case 'Dumbbell': return <Dumbbell className={classIcon} />;
      case 'Home': return <HomeIcon className={classIcon} />;
      case 'GraduationCap': return <GraduationCap className={classIcon} />;
      default: return <Sparkles className={classIcon} />;
    }
  };

  // FAQ Accordion State
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const faqs = [
    {
      q: 'How does CreatorConnect work for local businesses?',
      a: 'Businesses can sign up, search for content creators in their city, filter by platform and followers, and book campaigns directly. You select a package, outline deliverables, set your budget, and submit the booking request. The creator receives the details and contacts you to collaborate.'
    },
    {
      q: 'Is there an in-app chat?',
      a: 'No. To ensure speed and remove barriers, we do NOT force you to use an in-app chat. Once a booking is requested, we provide direct buttons to open the creator’s Instagram, WhatsApp, Facebook Messenger, email, or phone. You negotiate and align on your preferred platform directly.'
    },
    {
      q: 'How are platform commissions calculated?',
      a: 'We use a dynamic commission override system. Administrators set a base commission (e.g. 10%), but can override it for specific creators, businesses, or bookings. This gives creators more earnings and offers businesses custom pricing. The calculator shows every fee (earnings, commission, GST) transparently before booking.'
    },
    {
      q: 'Are the creators verified?',
      a: 'Yes, admins manually verify and approve creators based on their linked handles, engagement audits, and sample reviews, adding a Verified Badge to verified profiles.'
    }
  ];

  if (user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4 text-center">
        <div className="flex flex-col items-center gap-4 p-8 rounded-3xl bg-card border border-border shadow-2xl max-w-sm w-full animate-in zoom-in-95">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <div>
            <h3 className="text-base font-extrabold text-foreground">Redirecting to Dashboard...</h3>
            <p className="text-xs text-muted-foreground mt-1">Logged in users are redirected to their account dashboard.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen gradient-bg w-full max-w-full overflow-x-hidden">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden pt-20 pb-16 lg:pt-32 lg:pb-24">
        <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80">
          <div className="relative left-[calc(50%-11rem)] aspect-1155/678 w-[36rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-indigo-500 to-purple-500 opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72rem] animate-float-slow"></div>
        </div>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto flex flex-col gap-6">
            <span className="inline-flex mx-auto items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary animate-pulse">
              <Zap className="h-3.5 w-3.5 fill-primary" /> Connect. Collaborate. Grow.
            </span>
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-5xl lg:text-6xl font-sans leading-tight">
              Grow Your Local Business With{' '}
              <span className="gradient-text">Local Content Creators</span>
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed px-2">
              Find top Instagram, YouTube, and TikTok creators in your neighborhood. Book campaigns, check analytics, and manage commission overrides in one simple panel.
            </p>

            {/* Glass search form */}
            <form 
              onSubmit={handleSearch}
              className="glass-panel mx-auto mt-6 w-full max-w-3xl rounded-2xl p-3 flex flex-col md:flex-row gap-2 border border-border shadow-lg"
            >
              <div className="flex-1 flex items-center gap-2 px-3 border-b md:border-b-0 md:border-r border-border pb-2 md:pb-0">
                <Search className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                <input 
                  type="text" 
                  placeholder="Search creator name or category..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-transparent border-0 focus:outline-none text-sm text-foreground placeholder-muted-foreground"
                />
              </div>

              <div className="flex-1 flex items-center gap-2 px-3 pb-2 md:pb-0">
                <MapPin className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                <input 
                  type="text" 
                  placeholder="City (e.g., Mumbai, Delhi)..." 
                  value={cityQuery}
                  onChange={(e) => setCityQuery(e.target.value)}
                  className="w-full bg-transparent border-0 focus:outline-none text-sm text-foreground placeholder-muted-foreground"
                />
              </div>

              <button 
                type="submit"
                className="rounded-xl gradient-primary px-6 py-3 text-sm font-bold text-white shadow-md shadow-primary/20 hover:opacity-95 hover:scale-105 active:scale-95 transition-all duration-300 flex items-center justify-center gap-2 flex-shrink-0"
              >
                Find Creators <ArrowRight className="h-4 w-4" />
              </button>
            </form>

            {/* Micro stats — wraps gracefully on small phones */}
            <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs text-muted-foreground mt-4 font-medium uppercase tracking-wider">
              <span>⚡ {totalCreators} Active Creators</span>
              <span className="hidden sm:inline">•</span>
              <span>🔥 {totalCollabs}+ Completed Campaigns</span>
              <span className="hidden sm:inline">•</span>
              <span>🛡️ Verified Local Businesses</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. PROBLEM & SOLUTION SECTION */}
      <section className="py-20 relative overflow-hidden">
        {/* Subtle background blobs */}
        <div className="absolute inset-0 -z-10 pointer-events-none">
          <div className="absolute -left-24 top-1/4 w-72 h-72 rounded-full bg-rose-500/10 blur-3xl animate-float" />
          <div className="absolute -right-24 bottom-1/4 w-72 h-72 rounded-full bg-primary/10 blur-3xl animate-float-slow" />
        </div>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Section header */}
          <div className="text-center mb-14">
            <span className="inline-flex items-center gap-2 rounded-full bg-rose-500/10 px-4 py-1.5 text-xs font-bold text-rose-400 uppercase tracking-wider mb-4">
              Why CreatorConnect?
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground leading-tight">
              Local businesses face a <span className="text-rose-400">real gap</span>.
              <br />
              We built the{' '}
              <span className="gradient-text">bridge.</span>
            </h2>
            <p className="mt-4 text-sm text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Traditional advertising is expensive, slow, and untargeted. Meanwhile, local content creators
              struggle to monetise their hyper-local audience. CreatorConnect fixes both sides.
            </p>
          </div>

          {/* Two-column: Problems | Solutions */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">

            {/* PROBLEMS COLUMN */}
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="h-5 w-5 rounded-full bg-rose-500/20 flex items-center justify-center text-rose-400 text-xs font-bold">✕</span>
                <h3 className="text-sm font-bold text-rose-400 uppercase tracking-wider">The Problems</h3>
              </div>

              {[
                {
                  emoji: '💸',
                  title: 'Expensive Traditional Ads',
                  desc: 'Print, radio, and Google Ads cost thousands yet rarely convert local foot traffic. Small businesses burn budgets with no guarantee of ROI.'
                },
                {
                  emoji: '🔍',
                  title: 'No Easy Way to Find Local Creators',
                  desc: 'Searching Instagram manually for city-based creators is time-consuming, unverified, and unreliable. There\'s no directory, no pricing, no trust layer.'
                },
                {
                  emoji: '🤝',
                  title: 'Collaboration is Messy',
                  desc: 'DMs go unanswered. Pricing is unclear. Contracts don\'t exist. Local businesses and creators can\'t find a professional workflow to work together.'
                },
                {
                  emoji: '🧾',
                  title: 'Zero Financial Transparency',
                  desc: 'Hidden commissions, surprise GST, and unclear earnings make both businesses and creators hesitant. There\'s no calculator, no breakdown, no trust.'
                }
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="flex gap-4 p-5 rounded-2xl bg-rose-500/5 border border-rose-500/20 hover:border-rose-500/40 transition-colors"
                >
                  <span className="text-2xl flex-shrink-0 mt-0.5">{item.emoji}</span>
                  <div>
                    <h4 className="font-bold text-sm text-foreground mb-1">{item.title}</h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* SOLUTIONS COLUMN */}
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="h-5 w-5 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-bold">✓</span>
                <h3 className="text-sm font-bold text-primary uppercase tracking-wider">Our Solution</h3>
              </div>

              {[
                {
                  emoji: '📍',
                  title: 'Hyper-Local Creator Discovery',
                  desc: 'Search verified creators by city, niche, follower count, and starting price — all in one place. No cold DMs, no guessing games.'
                },
                {
                  emoji: '📦',
                  title: 'One-Click Campaign Booking',
                  desc: 'Select a package, describe deliverables, and submit. The platform auto-calculates your budget, GST, and creator payout — completely transparently.'
                },
                {
                  emoji: '⚡',
                  title: 'Instant Direct Connection',
                  desc: 'No slow in-app chat. Direct buttons open the creator\'s Instagram, WhatsApp, or phone — so you negotiate and confirm in minutes, not days.'
                },
                {
                  emoji: '🛡️',
                  title: 'Verified Creators & Trust Layer',
                  desc: 'Every creator is manually reviewed by admins. Verified badges, engagement audits, and completed-collab history give you confidence before you pay.'
                }
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="flex gap-4 p-5 rounded-2xl bg-primary/5 border border-primary/20 hover:border-primary/50 transition-colors"
                >
                  <span className="text-2xl flex-shrink-0 mt-0.5">{item.emoji}</span>
                  <div>
                    <h4 className="font-bold text-sm text-foreground mb-1">{item.title}</h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom CTA strip */}
          <div className="mt-14 rounded-2xl gradient-primary p-px shadow-xl shadow-primary/20">
            <div className="rounded-2xl bg-card/90 p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
              <div>
                <h3 className="text-lg font-extrabold text-foreground">Ready to bridge the gap?</h3>
                <p className="text-xs text-muted-foreground mt-1 max-w-sm">
                  Join hundreds of local businesses already using CreatorConnect to reach real customers through authentic local content.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 flex-shrink-0">
                <Link
                  href="/signup?role=business"
                  className="rounded-xl gradient-primary px-6 py-3 text-sm font-bold text-white shadow-md hover:opacity-90 transition-all flex items-center gap-2"
                >
                  Get Started Free <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/creators"
                  className="rounded-xl border border-border px-6 py-3 text-sm font-bold text-foreground hover:bg-secondary/50 transition-all text-center"
                >
                  Browse Creators
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. CATEGORIES SECTION */}
      <section className="py-16 bg-card/20 border-y border-border/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-foreground sm:text-3xl">
              Browse Creators by Category
            </h2>
            <p className="text-sm text-muted-foreground mt-2">
              Collaborate with specialists who match your specific local market.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {CATEGORIES.map((cat) => (
              <Link 
                key={cat.id} 
                href={`/creators?category=${cat.slug}`}
                className="group flex flex-col items-center justify-center p-4 rounded-2xl bg-card border border-border/80 text-center hover:border-primary hover:shadow-md transition-all cursor-pointer hover-3d-tilt transform-3d"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 mb-3 group-hover:bg-primary/20 transition-colors">
                  {getCategoryIcon(cat.iconName)}
                </div>
                <span className="text-xs font-bold text-foreground group-hover:text-primary transition-colors">
                  {cat.name}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 3. FEATURED CREATORS SECTION */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-10 gap-4">
            <div>
              <h2 className="text-2xl font-bold text-foreground sm:text-3xl">
                Featured Creators
              </h2>
              <p className="text-sm text-muted-foreground mt-2">
                Top rated creators driving verified footfalls and high engagement.
              </p>
            </div>
            <Link 
              href="/creators" 
              className="flex items-center gap-1.5 text-sm font-bold text-primary hover:underline"
            >
              Browse all creators <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {loading ? (
              [1, 2, 3, 4].map(n => (
                <div key={n} className="h-[420px] rounded-2xl shimmer-loading border border-border"></div>
              ))
            ) : creators.length === 0 ? (
              <div className="col-span-full text-center py-12 bg-card/45 border border-dashed border-border rounded-2xl p-6">
                <p className="text-xs text-muted-foreground">No featured creators registered yet.</p>
              </div>
            ) : (
              creators.slice(0, 4).map((creator) => (
                <CreatorCard key={creator.uid} creator={creator} />
              ))
            )}
          </div>
        </div>
      </section>

      {/* 4. HOW IT WORKS */}
      <section id="how-it-works" className="py-16 bg-secondary/30 border-y border-border/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold text-foreground sm:text-3xl">
              How CreatorConnect Works
            </h2>
            <p className="text-sm text-muted-foreground mt-2">
              Collaborations completed in 4 simple, transparent steps.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              {
                step: '01',
                title: 'Find Creators',
                desc: 'Filter by city, platform, follower count, and starting prices to locate local promoters.'
              },
              {
                step: '02',
                title: 'Book a Campaign',
                desc: 'Fill out details, set your budget, and submit. The platform calculates GST and creator earnings.'
              },
              {
                step: '03',
                title: 'Connect Instantly',
                desc: 'No in-app chat barriers. Direct links open their Instagram, WhatsApp, or phone for quick setup.'
              },
              {
                step: '04',
                title: 'Complete and Review',
                desc: 'Creator posts deliverables, you confirm, and release payout. Leave feedback to build trust.'
              }
            ].map((item, idx) => (
              <div key={idx} className="relative bg-card rounded-2xl border border-border p-6 shadow-sm flex flex-col justify-between hover-3d-lift">
                <div>
                  <span className="text-3xl font-extrabold gradient-text block mb-4">
                    {item.step}
                  </span>
                  <h3 className="font-bold text-foreground mb-2 text-base">
                    {item.title}
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. FEATURED BUSINESSES & SUCCESS STORIES */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Story Card */}
            <div className="flex flex-col gap-6">
              <span className="text-xs font-bold text-primary uppercase tracking-wider">Success Story</span>
              <h2 className="text-3xl font-extrabold text-foreground leading-tight">
                How Bite & Brew Café drove 120k views with local dining reels
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                By hiring Aarav Sharma through CreatorConnect, Bite & Brew Cafe launched their Monsoon Dessert menu directly to local foodies. In 48 hours, Aarav’s reel drove massive digital views, converting directly into over 40+ table bookings in Bandra.
              </p>
              
              <div className="glass-panel p-4 rounded-xl border border-border/80 flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                  ★
                </div>
                <div className="text-xs">
                  <p className="italic text-foreground">
                    &quot;CreatorConnect took out the friction. We calculated the exact GST and commission, booked Aarav, and reached out on WhatsApp. Payout was done instantly!&quot;
                  </p>
                  <p className="font-bold text-muted-foreground mt-2">
                    — Manager, Bite & Brew Café
                  </p>
                </div>
              </div>
            </div>

            {/* Businesses Grid */}
            <div className="rounded-2xl border border-border bg-card/60 p-8 flex flex-col gap-6 shadow-inner">
              <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider text-center">
                Trusted by Local Brands
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {SEED_BUSINESSES.map((b) => (
                  <div key={b.uid} className="flex flex-col items-center justify-center p-4 rounded-xl bg-background border border-border/60 text-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img 
                      src={b.logo} 
                      alt={b.name} 
                      className="h-12 w-12 rounded-full object-cover mb-2 border border-border"
                    />
                    <span className="text-xs font-bold text-foreground">{b.name}</span>
                    <span className="text-[10px] text-muted-foreground mt-0.5">{b.city}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5.5 MOBILE APP & WEB APP DOWNLOAD SECTION */}
      <section className="py-20 bg-gradient-to-b from-background via-primary/5 to-background border-t border-border/60 relative overflow-hidden">
        <div className="absolute inset-0 -z-10 pointer-events-none">
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-3xl animate-pulse" />
        </div>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="glass-panel rounded-3xl border border-border p-8 lg:p-12 shadow-2xl relative overflow-hidden bg-card/80 backdrop-blur-xl">
            
            {/* Background Glow */}
            <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-primary/20 rounded-full blur-3xl pointer-events-none" />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
              
              {/* Left Column: Direct App Downloads */}
              <div className="lg:col-span-7 flex flex-col gap-6">
                <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3.5 py-1 text-xs font-bold text-primary w-fit">
                  <Smartphone className="h-4 w-4" /> Native Mobile & Web App Package (v1.2.0)
                </span>

                <h2 className="text-3xl sm:text-5xl font-extrabold text-foreground leading-tight tracking-tight">
                  Download Official <br />
                  <span className="gradient-text">CreatorConnect App</span>
                </h2>

                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                  Download the official CreatorConnect application directly to your mobile device or desktop. Get real-time campaign push alerts, fast 1-tap wallet deposits, and instant direct creator messaging.
                </p>

                {/* Download Progress Bar Feedback */}
                {downloadProgress !== null && (
                  <div className="p-4 rounded-2xl bg-secondary/60 border border-border flex flex-col gap-2 animate-in fade-in">
                    <div className="flex justify-between items-center text-xs font-bold">
                      <span className="text-foreground flex items-center gap-2">
                        <Download className="h-4 w-4 text-primary animate-bounce" /> Downloading App Package...
                      </span>
                      <span className="text-primary font-mono">{downloadProgress}%</span>
                    </div>
                    <div className="w-full bg-border rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-primary h-2 rounded-full transition-all duration-300 gradient-primary"
                        style={{ width: `${downloadProgress}%` }}
                      />
                    </div>
                  </div>
                )}

                {downloadSuccessMsg && (
                  <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-xs font-bold text-emerald-500 flex items-center gap-2 animate-in zoom-in-95">
                    <CheckCircle className="h-4 w-4 flex-shrink-0" /> {downloadSuccessMsg}
                  </div>
                )}

                {/* Real App Download Action Buttons */}
                <div className="flex flex-col sm:flex-row flex-wrap gap-3 pt-2">
                  
                  {/* Direct Web App Launcher Download Button */}
                  <button
                    type="button"
                    onClick={handleDownloadWebApp}
                    className="rounded-2xl gradient-primary px-6 py-4 text-xs font-bold text-white shadow-xl shadow-primary/25 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3 group"
                  >
                    <Download className="h-5 w-5 group-hover:animate-bounce" />
                    <div className="text-left">
                      <span className="text-[9px] uppercase tracking-wider block opacity-80">Instant Direct Web App</span>
                      <span className="text-sm font-bold block">Download Direct Web App (.url / PWA)</span>
                    </div>
                  </button>

                  {/* Android Mobile Phone APK Button */}
                  <button
                    type="button"
                    onClick={handleDownloadApk}
                    className="rounded-2xl border border-border bg-card hover:bg-secondary/60 px-6 py-4 text-xs font-bold text-foreground transition-all flex items-center justify-center gap-3 shadow-sm hover:scale-105 active:scale-95"
                  >
                    <span className="text-xl">🤖</span>
                    <div className="text-left">
                      <span className="text-[9px] uppercase tracking-wider block text-muted-foreground">Android Mobile Only</span>
                      <span className="text-sm font-bold text-foreground block">Download Android APK</span>
                    </div>
                  </button>

                </div>

                {/* System Specs Tag */}
                <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground font-medium pt-2">
                  <span>✅ Android 8.0+ & iOS 14+</span>
                  <span>•</span>
                  <span>🔒 100% Virus & Malware Scanned</span>
                  <span>•</span>
                  <span>⚡ Fast Installation</span>
                </div>

              </div>

              {/* Right Column: App Feature & System Overview Cards */}
              <div className="lg:col-span-5 flex flex-col gap-4">
                
                <div className="p-5 rounded-2xl bg-background/90 border border-border shadow-md flex items-start gap-4">
                  <div className="p-3 rounded-xl bg-primary/10 text-primary flex-shrink-0">
                    <Bell className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-foreground text-sm mb-1">Instant Push Notifications</h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Get real-time mobile push alerts whenever a creator accepts your booking request or submits campaign drafts.
                    </p>
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-background/90 border border-border shadow-md flex items-start gap-4">
                  <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-500 flex-shrink-0">
                    <Wallet className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-foreground text-sm mb-1">Security Wallet Protection</h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Mobile wallet hold policy guarantees money safety for businesses and payment delivery for creators.
                    </p>
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-background/90 border border-border shadow-md flex items-start gap-4">
                  <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-500 flex-shrink-0">
                    <ShieldCheck className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-foreground text-sm mb-1">Verified Direct Pitching</h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Connect in 1-tap with verified creators directly on WhatsApp or Instagram DM without slow messaging delays.
                    </p>
                  </div>
                </div>

              </div>

            </div>

          </div>
        </div>
      </section>

      {/* 6. FAQ SECTION */}
      <section id="faq" className="py-16 bg-secondary/30 border-t border-border/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 max-w-3xl">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-foreground sm:text-3xl">
              Frequently Asked Questions
            </h2>
            <p className="text-sm text-muted-foreground mt-2">
              Everything you need to know about local social marketing.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            {faqs.map((faq, idx) => (
              <div 
                key={idx}
                className="bg-card border border-border rounded-2xl overflow-hidden transition-colors"
              >
                <button
                  onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                  className="w-full flex items-center justify-between p-5 text-left font-bold text-sm text-foreground hover:bg-secondary/45 transition-colors"
                >
                  <span>{faq.q}</span>
                  <span className="text-lg font-mono text-primary">
                    {activeFaq === idx ? '−' : '+'}
                  </span>
                </button>
                {activeFaq === idx && (
                  <div className="p-5 pt-0 border-t border-border/40 text-xs text-muted-foreground leading-relaxed animate-in fade-in slide-in-from-top-1 duration-200">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

