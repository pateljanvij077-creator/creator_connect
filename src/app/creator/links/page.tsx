'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { db } from '@/lib/db';
import { Creator } from '@/lib/constants';
import { 
  Link as LinkIcon, 
  Trash2, 
  Plus, 
  Globe, 
  FileText, 
  CheckCircle2,
  FolderOpen
} from 'lucide-react';
import { 
  InstagramIcon, 
  FacebookIcon, 
  YoutubeIcon, 
  LinkedinIcon, 
  TwitterIcon 
} from '@/components/SocialIcons';

interface MarketingLink {
  id: string;
  title: string;
  url: string;
}

export default function MarketingLinksManager() {
  const { user, profile, refreshProfile } = useAuth();
  
  const [links, setLinks] = useState<MarketingLink[]>([]);
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Load existing links (using standard creator portfolio urls or socials)
  useEffect(() => {
    if (profile && 'portfolio' in profile) {
      const c = profile as Creator;
      // Pre-seed mock marketing links based on portfolio arrays and socials
      const seeded: MarketingLink[] = [];
      
      // Load from portfolio urls
      if (c.portfolio && c.portfolio.length > 0) {
        c.portfolio.forEach((pUrl, idx) => {
          if (!pUrl.includes('unsplash.com')) { // Only load actual portfolio links, not seed images
            seeded.push({
              id: `port_${idx}`,
              title: `Portfolio Resource ${idx + 1}`,
              url: pUrl
            });
          }
        });
      }

      // Load from socials keys
      let idx = 0;
      Object.entries(c.socials || {}).forEach(([key, val]) => {
        if (val && key !== 'email' && key !== 'snapchat') {
          seeded.push({
            id: `soc_${idx++}`,
            title: key.toUpperCase(),
            url: val as string
          });
        }
      });

      setLinks(seeded);
    }
  }, [profile]);

  // Detect correct icon from url domain name
  const getUrlIcon = (linkUrl: string) => {
    const l = linkUrl.toLowerCase();
    const classIcon = "h-5 w-5 text-primary";
    
    if (l.includes('instagram.com')) return <InstagramIcon className={classIcon} />;
    if (l.includes('youtube.com') || l.includes('youtu.be')) return <YoutubeIcon className={classIcon} />;
    if (l.includes('facebook.com')) return <FacebookIcon className={classIcon} />;
    if (l.includes('linkedin.com')) return <LinkedinIcon className={classIcon} />;
    if (l.includes('twitter.com') || l.includes('x.com')) return <TwitterIcon className={classIcon} />;
    if (l.includes('drive.google.com') || l.includes('dropbox.com')) return <FolderOpen className={classIcon} />;
    if (l.includes('behance.net')) return <FileText className={classIcon} />;
    if (l.includes('dribbble.com')) return <Globe className={classIcon} />;
    return <LinkIcon className={classIcon} />;
  };

  const handleAddLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !url.trim()) return;

    // Basic URL validation prepend protocol
    let formattedUrl = url.trim();
    if (!/^https?:\/\//i.test(formattedUrl)) {
      formattedUrl = `https://${formattedUrl}`;
    }

    const newLink: MarketingLink = {
      id: 'link_' + Math.random().toString(36).substr(2, 9),
      title: title.trim(),
      url: formattedUrl
    };

    setLinks([...links, newLink]);
    setTitle('');
    setUrl('');
  };

  const handleRemoveLink = (id: string) => {
    setLinks(links.filter(l => l.id !== id));
  };

  const handleSaveChanges = async () => {
    if (!user || !profile) return;
    setLoading(true);
    setSuccess(false);

    try {
      const c = profile as Creator;
      
      // Separate links into standard portfolio URLs and socials
      const updatedPortfolio: string[] = [];
      const updatedSocials: any = { ...c.socials };

      links.forEach((l) => {
        const u = l.url.toLowerCase();
        if (u.includes('instagram.com')) updatedSocials.instagram = l.url;
        else if (u.includes('youtube.com') || u.includes('youtu.be')) updatedSocials.youtube = l.url;
        else if (u.includes('facebook.com')) updatedSocials.facebook = l.url;
        else if (u.includes('linkedin.com')) updatedSocials.linkedin = l.url;
        else if (u.includes('twitter.com') || u.includes('x.com')) updatedSocials.twitter = l.url;
        else if (u.includes('threads.net')) updatedSocials.threads = l.url;
        else if (u.includes('linktr.ee')) updatedSocials.linktree = l.url;
        else {
          // Standard portfolio resource URL
          updatedPortfolio.push(l.url);
        }
      });

      // Maintain seed images in portfolio if portfolio is otherwise empty
      if (updatedPortfolio.length === 0 && c.portfolio && c.portfolio.length > 0) {
        c.portfolio.forEach(p => {
          if (p.includes('unsplash.com')) updatedPortfolio.push(p);
        });
      }

      await db.saveCreator(user.uid, {
        portfolio: updatedPortfolio,
        socials: updatedSocials
      });

      await refreshProfile();
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (e) {
      console.error('Failed to update creator links:', e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-3xl px-4 sm:px-6 lg:px-8 py-10 flex-grow">
      
      <div className="flex items-center gap-2 mb-8">
        <LinkIcon className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-extrabold text-foreground font-sans">
          Marketing & Social Links
        </h1>
      </div>

      {success && (
        <div className="mb-6 rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-4 text-xs font-bold text-emerald-500 flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="h-4.5 w-4.5" /> Links successfully synced to your profile directory!
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Left column: Add Link Form */}
        <div className="md:col-span-1 flex flex-col gap-4">
          <div className="glass-panel rounded-2xl border border-border p-5">
            <h3 className="text-xs font-bold text-foreground uppercase tracking-wider mb-3 border-b border-border/60 pb-2">
              Add Custom Link
            </h3>
            
            <form onSubmit={handleAddLink} className="flex flex-col gap-3">
              <div>
                <label className="block text-[9px] font-bold text-muted-foreground uppercase tracking-wider mb-1">
                  Link Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Behance Portfolio"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[9px] font-bold text-muted-foreground uppercase tracking-wider mb-1">
                  URL Address
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., behance.net/username"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full h-9 rounded-lg bg-primary hover:opacity-90 text-[11px] font-bold text-white transition-opacity flex items-center justify-center gap-1 mt-2"
              >
                <Plus className="h-3.5 w-3.5" /> Add Link
              </button>
            </form>
          </div>
        </div>

        {/* Right column: Links List */}
        <div className="md:col-span-2 flex flex-col gap-4">
          <div className="glass-panel rounded-2xl border border-border p-5 flex flex-col gap-4">
            <div className="flex justify-between items-center border-b border-border/60 pb-2">
              <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">
                My Marketing Directory ({links.length})
              </h3>
              <p className="text-[10px] text-muted-foreground">Automatically renders source icon</p>
            </div>

            {links.length === 0 ? (
              <div className="text-center py-8 text-xs text-muted-foreground">
                No custom links added yet. Add links on the left panel (e.g. Behance, Linktree, Dribbble).
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {links.map((link) => (
                  <div 
                    key={link.id}
                    className="rounded-xl border border-border bg-background/50 p-3 flex items-center justify-between hover:border-primary/40 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      {getUrlIcon(link.url)}
                      <div className="flex flex-col gap-0.5 text-xs">
                        <span className="font-bold text-foreground">{link.title}</span>
                        <a 
                          href={link.url} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="text-[10px] text-muted-foreground hover:text-primary hover:underline truncate max-w-sm"
                        >
                          {link.url}
                        </a>
                      </div>
                    </div>

                    <button
                      onClick={() => handleRemoveLink(link.id)}
                      className="rounded-lg p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <button
              onClick={handleSaveChanges}
              disabled={loading}
              className="w-full h-10 rounded-xl gradient-primary text-xs font-bold text-white shadow-md shadow-primary/20 hover:opacity-95 transition-opacity mt-4"
            >
              {loading ? 'Saving Directory...' : 'Sync & Save Links to Profile'}
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}
