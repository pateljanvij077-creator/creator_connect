'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { db } from '@/lib/db';
import { Business } from '@/lib/constants';
import { 
  Building2, 
  MapPin, 
  Phone, 
  Mail, 
  Globe, 
  Clock, 
  DollarSign, 
  CheckCircle2, 
  Image as ImageIcon 
} from 'lucide-react';
import { InstagramIcon, FacebookIcon, YoutubeIcon } from '@/components/SocialIcons';

export default function BusinessProfileEditor() {
  const { user, profile, refreshProfile } = useAuth();
  
  // Form fields
  const [name, setName] = useState('');
  const [logo, setLogo] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [instagram, setInstagram] = useState('');
  const [facebook, setFacebook] = useState('');
  const [youtube, setYoutube] = useState('');
  const [website, setWebsite] = useState('');
  const [workingHours, setWorkingHours] = useState('');
  const [budgetMin, setBudgetMin] = useState<number>(0);
  const [budgetMax, setBudgetMax] = useState<number>(5000);

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Prepopulate form
  useEffect(() => {
    if (profile && 'logo' in profile) {
      const b = profile as Business;
      setName(b.name || '');
      setLogo(b.logo || '');
      setCoverImage(b.coverImage || '');
      setCategory(b.category || '');
      setDescription(b.description || '');
      setAddress(b.address || '');
      setCity(b.city || '');
      setState(b.state || '');
      setPhone(b.phone || '');
      setEmail(b.email || '');
      setInstagram(b.socials?.instagram || '');
      setFacebook(b.socials?.facebook || '');
      setYoutube(b.socials?.youtube || '');
      setWebsite(b.socials?.website || '');
      setWorkingHours(b.workingHours || '');
      setBudgetMin(b.budgetRange?.min || 0);
      setBudgetMax(b.budgetRange?.max || 5000);
    }
  }, [profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const formattedCity = city.toUpperCase().trim();
    const formattedState = state.toUpperCase().trim();



    setLoading(true);
    setSuccess(false);

    try {
      const updatedBusiness: Partial<Business> = {
        name,
        logo: logo || 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=200&h=200',
        coverImage: coverImage || 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=1200&h=400',
        category,
        description,
        address,
        city: formattedCity,
        state: formattedState,
        phone,
        email,
        socials: {
          instagram,
          facebook,
          youtube,
          website
        },
        workingHours,
        budgetRange: {
          min: Number(budgetMin),
          max: Number(budgetMax)
        }
      };

      await db.saveBusiness(user.uid, updatedBusiness);
      await refreshProfile();
      setSuccess(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('Error updating business profile:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-4xl px-4 sm:px-6 lg:px-8 py-10 flex-grow">
      <div className="flex items-center gap-2 mb-8">
        <Building2 className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-extrabold text-foreground font-sans">
          Business Profile Settings
        </h1>
      </div>

      {success && (
        <div className="mb-6 rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-4 text-xs font-bold text-emerald-500 flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="h-4.5 w-4.5" /> Profile successfully updated! Changes are live on the platform.
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        
        {/* Images Card */}
        <div className="glass-panel rounded-2xl border border-border p-6 shadow-sm flex flex-col gap-4">
          <h3 className="text-sm font-bold text-foreground border-b border-border/80 pb-2">
            Profile Imagery
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">
                Logo URL
              </label>
              <input
                type="url"
                placeholder="https://images.unsplash.com/your-logo.jpg"
                value={logo}
                onChange={(e) => setLogo(e.target.value)}
                className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">
                Cover Image URL
              </label>
              <input
                type="url"
                placeholder="https://images.unsplash.com/your-cover.jpg"
                value={coverImage}
                onChange={(e) => setCoverImage(e.target.value)}
                className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>
        </div>

        {/* Basic Details */}
        <div className="glass-panel rounded-2xl border border-border p-6 shadow-sm flex flex-col gap-4">
          <h3 className="text-sm font-bold text-foreground border-b border-border/80 pb-2">
            Company Info
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">
                Business Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g., Bite & Brew Café"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">
                Industry Category *
              </label>
              <select
                required
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="">Select Category</option>
                <option value="Food & Dining">Food & Dining</option>
                <option value="Fashion & Lifestyle">Fashion & Lifestyle</option>
                <option value="Beauty & Cosmetics">Beauty & Cosmetics</option>
                <option value="Tech & Gadgets">Tech & Gadgets</option>
                <option value="Travel & Adventure">Travel & Adventure</option>
                <option value="Fitness & Wellness">Fitness & Wellness</option>
                <option value="Real Estate & Design">Real Estate & Design</option>
                <option value="Education & Career">Education & Career</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">
              Description *
            </label>
            <textarea
              required
              rows={4}
              placeholder="What makes your local business unique? Tell creators about your brand..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">
                Store Address *
              </label>
              <input
                type="text"
                required
                placeholder="24, Rose Garden Road, Bandra West"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">
                  City *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Mumbai"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">
                  State *
                </label>
                <input
                  type="text"
                  required
                  placeholder="MH"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Contact & Availability */}
        <div className="glass-panel rounded-2xl border border-border p-6 shadow-sm flex flex-col gap-4">
          <h3 className="text-sm font-bold text-foreground border-b border-border/80 pb-2">
            Contact & Working Hours
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">
                Store Phone *
              </label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">
                Store Email *
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">
                Working Hours
              </label>
              <input
                type="text"
                placeholder="e.g., 10:00 AM - 11:00 PM"
                value={workingHours}
                onChange={(e) => setWorkingHours(e.target.value)}
                className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">
                Minimum Collab Budget (₹)
              </label>
              <input
                type="number"
                value={budgetMin}
                onChange={(e) => setBudgetMin(Number(e.target.value))}
                className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">
                Maximum Collab Budget (₹)
              </label>
              <input
                type="number"
                value={budgetMax}
                onChange={(e) => setBudgetMax(Number(e.target.value))}
                className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>
        </div>

        {/* Social media handles */}
        <div className="glass-panel rounded-2xl border border-border p-6 shadow-sm flex flex-col gap-4">
          <h3 className="text-sm font-bold text-foreground border-b border-border/80 pb-2">
            Social Media Links
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1 flex items-center gap-1">
                <InstagramIcon className="h-3.5 w-3.5" /> Instagram Link
              </label>
              <input
                type="url"
                placeholder="https://instagram.com/brandname"
                value={instagram}
                onChange={(e) => setInstagram(e.target.value)}
                className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1 flex items-center gap-1">
                <FacebookIcon className="h-3.5 w-3.5" /> Facebook Link
              </label>
              <input
                type="url"
                placeholder="https://facebook.com/brandname"
                value={facebook}
                onChange={(e) => setFacebook(e.target.value)}
                className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1 flex items-center gap-1">
                <YoutubeIcon className="h-3.5 w-3.5" /> YouTube Channel
              </label>
              <input
                type="url"
                placeholder="https://youtube.com/@brandname"
                value={youtube}
                onChange={(e) => setYoutube(e.target.value)}
                className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1 flex items-center gap-1">
                <Globe className="h-3.5 w-3.5" /> Official Website
              </label>
              <input
                type="url"
                placeholder="https://brandname.in"
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
          {loading ? 'Saving Profile Details...' : 'Save & Publish Profile'}
        </button>

      </form>
    </div>
  );
}
