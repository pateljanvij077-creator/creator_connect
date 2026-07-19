'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { db } from '@/lib/db';
import { Creator } from '@/lib/constants';
import { 
  User, 
  MapPin, 
  Sparkles, 
  TrendingUp, 
  Users, 
  Play, 
  Globe, 
  Briefcase,
  CheckCircle2
} from 'lucide-react';
import { InstagramIcon, YoutubeIcon, LinkedinIcon } from '@/components/SocialIcons';

export default function CreatorProfileEditor() {
  const { user, profile, refreshProfile } = useAuth();

  // Form fields
  const [name, setName] = useState('');
  const [photo, setPhoto] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [bio, setBio] = useState('');
  const [languages, setLanguages] = useState('');
  const [experienceYears, setExperienceYears] = useState<number>(0);
  const [categories, setCategories] = useState<string[]>([]);
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [followers, setFollowers] = useState<number>(0);
  const [averageViews, setAverageViews] = useState<number>(0);
  const [engagementRate, setEngagementRate] = useState<number>(0);
  
  // Package 1
  const [pkg1Name, setPkg1Name] = useState('Standard Reel');
  const [pkg1Desc, setPkg1Desc] = useState('1 Reel + 1 Story post');
  const [pkg1Price, setPkg1Price] = useState<number>(5000);

  // Package 2
  const [pkg2Name, setPkg2Name] = useState('Premium Collaboration');
  const [pkg2Desc, setPkg2Desc] = useState('2 Reels + 3 Stories + permanent link');
  const [pkg2Price, setPkg2Price] = useState<number>(12000);

  // Socials
  const [instagram, setInstagram] = useState('');
  const [facebook, setFacebook] = useState('');
  const [youtube, setYoutube] = useState('');
  const [tiktok, setTiktok] = useState('');
  const [threads, setThreads] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [snapchat, setSnapchat] = useState(''); // Mapping Snapchat URL / Whatsapp phone number
  const [website, setWebsite] = useState('');

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Prepopulate
  useEffect(() => {
    if (profile && 'photo' in profile) {
      const c = profile as Creator;
      setName(c.name || '');
      setPhoto(c.photo || '');
      setCoverImage(c.coverImage || '');
      setBio(c.bio || '');
      setLanguages(c.languages ? c.languages.join(', ') : '');
      setExperienceYears(c.experienceYears || 0);
      setCategories(c.categories || []);
      setCity(c.location?.city || '');
      setState(c.location?.state || '');
      setFollowers(c.followers || 0);
      setAverageViews(c.averageViews || 0);
      setEngagementRate(c.engagementRate || 0);

      // Packages
      if (c.pricingPackages && c.pricingPackages.length > 0) {
        setPkg1Name(c.pricingPackages[0]?.name || 'Standard Reel');
        setPkg1Desc(c.pricingPackages[0]?.description || '1 Reel + 1 Story post');
        setPkg1Price(c.pricingPackages[0]?.price || 5000);
        
        if (c.pricingPackages[1]) {
          setPkg2Name(c.pricingPackages[1]?.name || 'Premium Collaboration');
          setPkg2Desc(c.pricingPackages[1]?.description || '2 Reels + 3 Stories');
          setPkg2Price(c.pricingPackages[1]?.price || 12000);
        }
      }

      // Socials
      setInstagram(c.socials?.instagram || '');
      setFacebook(c.socials?.facebook || '');
      setYoutube(c.socials?.youtube || '');
      setTiktok(c.socials?.tiktok || '');
      setThreads(c.socials?.threads || '');
      setLinkedin(c.socials?.linkedin || '');
      setSnapchat(c.socials?.snapchat || '');
      setWebsite(c.socials?.website || '');
    }
  }, [profile]);

  const handleCategoryToggle = (catName: string) => {
    if (categories.includes(catName)) {
      setCategories(categories.filter(c => c !== catName));
    } else {
      setCategories([...categories, catName]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const formattedCity = city.toUpperCase().trim();
    const formattedState = state.toUpperCase().trim();



    setLoading(true);
    setSuccess(false);

    try {
      const languagesArray = languages.split(',').map(s => s.trim()).filter(Boolean);
      
      const pricingPackages = [
        { name: pkg1Name, description: pkg1Desc, price: Number(pkg1Price) }
      ];
      if (pkg2Name && pkg2Price > 0) {
        pricingPackages.push({ name: pkg2Name, description: pkg2Desc, price: Number(pkg2Price) });
      }

      const updatedCreator: Partial<Creator> = {
        name,
        photo: photo || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=300&h=300',
        coverImage: coverImage || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=1200&h=400',
        bio,
        languages: languagesArray,
        experienceYears: Number(experienceYears),
        categories,
        location: { city: formattedCity, state: formattedState },
        followers: Number(followers),
        averageViews: Number(averageViews),
        engagementRate: Number(engagementRate),
        pricingPackages,
        socials: {
          instagram,
          facebook,
          youtube,
          tiktok,
          threads,
          linkedin,
          snapchat,
          website
        }
      };

      await db.saveCreator(user.uid, updatedCreator);
      await refreshProfile();
      setSuccess(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setTimeout(() => setSuccess(false), 3000);
    } catch (e) {
      console.error('Error saving creator details:', e);
    } finally {
      setLoading(false);
    }
  };

  const availableCategories = [
    'Food & Dining', 'Fashion & Lifestyle', 'Beauty & Cosmetics',
    'Tech & Gadgets', 'Travel & Adventure', 'Fitness & Wellness',
    'Real Estate & Design', 'Education & Career'
  ];

  return (
    <div className="mx-auto w-full max-w-4xl px-4 sm:px-6 lg:px-8 py-10 flex-grow">
      
      <div className="flex items-center gap-2 mb-8">
        <User className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-extrabold text-foreground font-sans">
          Creator Profile Settings
        </h1>
      </div>

      {success && (
        <div className="mb-6 rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-4 text-xs font-bold text-emerald-500 flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="h-4.5 w-4.5" /> Creator profile successfully updated! Changes are live on the platform.
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        
        {/* Images */}
        <div className="glass-panel rounded-2xl border border-border p-6 shadow-sm flex flex-col gap-4">
          <h3 className="text-sm font-bold text-foreground border-b border-border/80 pb-2">
            Profile Imagery
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">
                Profile Photo URL
              </label>
              <input
                type="url"
                value={photo}
                onChange={(e) => setPhoto(e.target.value)}
                className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">
                Cover Banner URL
              </label>
              <input
                type="url"
                value={coverImage}
                onChange={(e) => setCoverImage(e.target.value)}
                className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>
        </div>

        {/* Basic profile details */}
        <div className="glass-panel rounded-2xl border border-border p-6 shadow-sm flex flex-col gap-4">
          <h3 className="text-sm font-bold text-foreground border-b border-border/80 pb-2">
            Bio & Base Information
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">
                Display Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">
                Experience (Years)
              </label>
              <input
                type="number"
                value={experienceYears}
                onChange={(e) => setExperienceYears(Number(e.target.value))}
                className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">
              Bio Summary *
            </label>
            <textarea
              required
              rows={4}
              placeholder="Tell brands what content formats you produce, who your target audience is, and what products you love showcasing..."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">
                City *
              </label>
              <input
                type="text"
                required
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">
                State *
              </label>
              <input
                type="text"
                required
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">
                Languages (comma separated)
              </label>
              <input
                type="text"
                placeholder="English, Hindi, Tamil"
                value={languages}
                onChange={(e) => setLanguages(e.target.value)}
                className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>
        </div>

        {/* Categories */}
        <div className="glass-panel rounded-2xl border border-border p-6 shadow-sm flex flex-col gap-4">
          <h3 className="text-sm font-bold text-foreground border-b border-border/80 pb-2">
            Creator Categories (Select All That Apply)
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {availableCategories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => handleCategoryToggle(cat)}
                className={`py-2 px-3 rounded-xl border text-center text-xs font-semibold transition-all ${
                  categories.includes(cat)
                    ? 'border-primary bg-primary/10 text-primary font-bold'
                    : 'border-border bg-card text-muted-foreground hover:bg-secondary/40'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Social Metrics */}
        <div className="glass-panel rounded-2xl border border-border p-6 shadow-sm flex flex-col gap-4">
          <h3 className="text-sm font-bold text-foreground border-b border-border/80 pb-2">
            Analytics Metrics
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">
                Follower Count (Total)
              </label>
              <input
                type="number"
                value={followers}
                onChange={(e) => setFollowers(Number(e.target.value))}
                className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 font-bold"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">
                Average Reels Views
              </label>
              <input
                type="number"
                value={averageViews}
                onChange={(e) => setAverageViews(Number(e.target.value))}
                className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 font-bold"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">
                Engagement Rate (%)
              </label>
              <input
                type="number"
                step="0.1"
                value={engagementRate}
                onChange={(e) => setEngagementRate(Number(e.target.value))}
                className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 font-bold"
              />
            </div>
          </div>
        </div>

        {/* Pricing Packages */}
        <div className="glass-panel rounded-2xl border border-border p-6 shadow-sm flex flex-col gap-5">
          <h3 className="text-sm font-bold text-foreground border-b border-border/80 pb-2">
            Collaboration Pricing Packages
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Package 1 */}
            <div className="bg-secondary/15 rounded-xl border border-border p-4 flex flex-col gap-3">
              <h4 className="text-xs font-bold text-foreground border-b border-border/40 pb-1.5 uppercase tracking-wider">Package 1 (Required)</h4>
              <div>
                <label className="block text-[9px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Package Name</label>
                <input
                  type="text"
                  required
                  value={pkg1Name}
                  onChange={(e) => setPkg1Name(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[9px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Description</label>
                <input
                  type="text"
                  required
                  value={pkg1Desc}
                  onChange={(e) => setPkg1Desc(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[9px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Price (₹)</label>
                <input
                  type="number"
                  required
                  value={pkg1Price}
                  onChange={(e) => setPkg1Price(Number(e.target.value))}
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs focus:outline-none font-bold"
                />
              </div>
            </div>

            {/* Package 2 */}
            <div className="bg-secondary/15 rounded-xl border border-border p-4 flex flex-col gap-3">
              <h4 className="text-xs font-bold text-foreground border-b border-border/40 pb-1.5 uppercase tracking-wider">Package 2 (Optional)</h4>
              <div>
                <label className="block text-[9px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Package Name</label>
                <input
                  type="text"
                  value={pkg2Name}
                  onChange={(e) => setPkg2Name(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[9px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Description</label>
                <input
                  type="text"
                  value={pkg2Desc}
                  onChange={(e) => setPkg2Desc(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[9px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Price (₹)</label>
                <input
                  type="number"
                  value={pkg2Price}
                  onChange={(e) => setPkg2Price(Number(e.target.value))}
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs focus:outline-none font-bold"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Social media handles */}
        <div className="glass-panel rounded-2xl border border-border p-6 shadow-sm flex flex-col gap-4">
          <h3 className="text-sm font-bold text-foreground border-b border-border/80 pb-2">
            Social Links & handles (Direct Connection)
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1 flex items-center gap-1">
                <InstagramIcon className="h-3.5 w-3.5" /> Instagram URL
              </label>
              <input
                type="url"
                placeholder="https://instagram.com/username"
                value={instagram}
                onChange={(e) => setInstagram(e.target.value)}
                className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1 flex items-center gap-1">
                <YoutubeIcon className="h-3.5 w-3.5" /> YouTube Channel
              </label>
              <input
                type="url"
                placeholder="https://youtube.com/@channelname"
                value={youtube}
                onChange={(e) => setYoutube(e.target.value)}
                className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1 flex items-center gap-1">
                <Globe className="h-3.5 w-3.5" /> WhatsApp Phone Number (Direct chat)
              </label>
              <input
                type="tel"
                placeholder="+919876543210 (with country code)"
                value={snapchat}
                onChange={(e) => setSnapchat(e.target.value)}
                className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 font-bold"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1 flex items-center gap-1">
                <LinkedinIcon className="h-3.5 w-3.5" /> LinkedIn profile
              </label>
              <input
                type="url"
                placeholder="https://linkedin.com/in/username"
                value={linkedin}
                onChange={(e) => setLinkedin(e.target.value)}
                className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">
                TikTok profile
              </label>
              <input
                type="url"
                placeholder="https://tiktok.com/@username"
                value={tiktok}
                onChange={(e) => setTiktok(e.target.value)}
                className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">
                Threads profile
              </label>
              <input
                type="url"
                placeholder="https://threads.net/@username"
                value={threads}
                onChange={(e) => setThreads(e.target.value)}
                className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1 flex items-center gap-1">
                <Globe className="h-3.5 w-3.5" /> Personal Website / Linktree URL
              </label>
              <input
                type="url"
                placeholder="https://linktr.ee/username"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full h-11 rounded-xl gradient-primary text-sm font-bold text-white shadow-md shadow-primary/25 hover:opacity-95 transition-opacity"
        >
          {loading ? 'Saving Profile Details...' : 'Save & Publish Creator Profile'}
        </button>

      </form>
    </div>
  );
}
