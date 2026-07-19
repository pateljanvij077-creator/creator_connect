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
  DollarSign
} from 'lucide-react';
import { formatFollowers } from '@/lib/utils';

export default function Home() {
  const router = useRouter();
  
  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [cityQuery, setCityQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  
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

  return (
    <div className="flex flex-col min-h-screen gradient-bg">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden pt-20 pb-16 lg:pt-32 lg:pb-24">
        <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80">
          <div className="relative left-[calc(50%-11rem)] aspect-1155/678 w-[36rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-indigo-500 to-purple-500 opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72rem]"></div>
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
                className="rounded-xl gradient-primary px-6 py-3 text-sm font-bold text-white shadow-md shadow-primary/20 hover:opacity-95 transition-all flex items-center justify-center gap-2 flex-shrink-0"
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

      {/* 2. CATEGORIES SECTION */}
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
                className="group flex flex-col items-center justify-center p-4 rounded-2xl bg-card border border-border/80 text-center hover:border-primary hover:shadow-md transition-all cursor-pointer"
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
              <div key={idx} className="relative bg-card rounded-2xl border border-border p-6 shadow-sm flex flex-col justify-between">
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

