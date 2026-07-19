'use client';

import React from 'react';
import Link from 'next/link';
import { Creator } from '@/lib/constants';
import { 
  Star, 
  MapPin, 
  CheckCircle, 
  Globe, 
  Play, 
  Users, 
  TrendingUp, 
  Briefcase 
} from 'lucide-react';
import { 
  InstagramIcon, 
  FacebookIcon, 
  YoutubeIcon, 
  LinkedinIcon 
} from './SocialIcons';
import { formatFollowers, formatCurrency } from '@/lib/utils';

interface CreatorCardProps {
  creator: Creator;
  localCity?: string;
}

export default function CreatorCard({ creator, localCity }: CreatorCardProps) {
  // Get starting price
  const startPrice = creator.pricingPackages && creator.pricingPackages.length > 0
    ? Math.min(...creator.pricingPackages.map(p => p.price))
    : 1000;

  // Render social icon helper
  const renderSocialIcon = (platform: string, url?: string) => {
    if (!url) return null;
    const iconClass = "h-4 w-4 text-muted-foreground hover:text-primary transition-colors cursor-pointer";
    
    switch (platform) {
      case 'instagram':
        return <a href={url} target="_blank" rel="noopener noreferrer" title="Instagram"><InstagramIcon className={iconClass} /></a>;
      case 'facebook':
        return <a href={url} target="_blank" rel="noopener noreferrer" title="Facebook"><FacebookIcon className={iconClass} /></a>;
      case 'youtube':
        return <a href={url} target="_blank" rel="noopener noreferrer" title="YouTube"><YoutubeIcon className={iconClass} /></a>;
      case 'linkedin':
        return <a href={url} target="_blank" rel="noopener noreferrer" title="LinkedIn"><LinkedinIcon className={iconClass} /></a>;
      default:
        return <a href={url} target="_blank" rel="noopener noreferrer" title="Website"><Globe className={iconClass} /></a>;
    }
  };

  return (
    <div className="glass-card flex flex-col overflow-hidden rounded-2xl border border-border bg-card">
      {/* Cover and Photo Header */}
      <div className="relative h-32 w-full bg-muted">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img 
          src={creator.coverImage || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=600'} 
          alt={`${creator.name} cover`} 
          className="h-full w-full object-cover opacity-80 dark:opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-card via-card/20 to-transparent"></div>
        
        {/* Photo */}
        <div className="absolute -bottom-6 left-6 h-16 w-16 overflow-hidden rounded-full border-2 border-card bg-muted shadow-md">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img 
            src={creator.photo || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150'} 
            alt={creator.name} 
            className="h-full w-full object-cover"
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col flex-grow p-6 pt-8">
        {/* Name and Verification */}
        <div className="flex items-center gap-1.5 mb-1">
          <h3 className="text-lg font-bold text-foreground truncate max-w-[80%]">
            {creator.name}
          </h3>
          {creator.isVerified && (
            <span title="Verified Creator">
              <CheckCircle className="h-4.5 w-4.5 fill-primary text-primary-foreground" />
            </span>
          )}
        </div>

        {/* Location & Rating */}
        <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
          <div className="flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5" />
            <span>{creator.location?.city || 'Unknown'}, {creator.location?.state || 'Unknown'}</span>
            {localCity && creator.location?.city && creator.location.city.toUpperCase() === localCity.toUpperCase() && (
              <span className="ml-1.5 px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-500 text-[9px] font-extrabold uppercase tracking-wide border border-emerald-500/20">
                Local
              </span>
            )}
          </div>
          <div className="flex items-center gap-1 text-yellow-500 font-bold bg-yellow-500/10 px-1.5 py-0.5 rounded-md">
            <Star className="h-3.5 w-3.5 fill-yellow-500" />
            <span>{creator.rating || 0}</span>
          </div>
        </div>

        {/* Categories */}
        <div className="flex flex-wrap gap-1 mb-4 h-12 overflow-hidden">
          {creator.categories && Array.isArray(creator.categories) && creator.categories.map((cat) => (
            <span 
              key={cat} 
              className="px-2 py-0.5 rounded-full bg-secondary text-[10px] font-semibold text-secondary-foreground"
            >
              {cat}
            </span>
          ))}
        </div>

        {/* Analytics Grid */}
        <div className="grid grid-cols-3 gap-2 border-y border-border/60 py-3 mb-4 text-center">
          <div>
            <div className="flex items-center justify-center gap-0.5 text-xs text-muted-foreground mb-0.5">
              <Users className="h-3.5 w-3.5" />
              <span>Followers</span>
            </div>
            <p className="text-sm font-extrabold text-foreground">
              {formatFollowers(creator.followers || 0)}
            </p>
          </div>
          <div>
            <div className="flex items-center justify-center gap-0.5 text-xs text-muted-foreground mb-0.5">
              <Play className="h-3.5 w-3.5" />
              <span>Avg Views</span>
            </div>
            <p className="text-sm font-extrabold text-foreground">
              {formatFollowers(creator.averageViews || 0)}
            </p>
          </div>
          <div>
            <div className="flex items-center justify-center gap-0.5 text-xs text-muted-foreground mb-0.5">
              <TrendingUp className="h-3.5 w-3.5" />
              <span>Eng. Rate</span>
            </div>
            <p className="text-sm font-extrabold text-foreground">
              {creator.engagementRate || 0}%
            </p>
          </div>
        </div>

        {/* Bottom Socials and Collab Info */}
        <div className="flex items-center justify-between mb-4 text-xs">
          <div className="flex items-center gap-1.5">
            <Briefcase className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-muted-foreground">
              <strong className="text-foreground font-semibold">{creator.completedCollabs || 0}</strong> collabs
            </span>
          </div>
          <div className="text-right">
            <span className="text-muted-foreground text-[10px] block">Starting from</span>
            <span className="text-sm font-extrabold text-primary">
              {formatCurrency(startPrice)}
            </span>
          </div>
        </div>

        {/* Social Icons row */}
        <div className="flex gap-3 mb-5 py-1 border-t border-border/30 justify-center">
          {renderSocialIcon('instagram', creator.socials?.instagram)}
          {renderSocialIcon('youtube', creator.socials?.youtube)}
          {renderSocialIcon('facebook', creator.socials?.facebook)}
          {renderSocialIcon('linkedin', creator.socials?.linkedin)}
          {creator.socials?.linktree && renderSocialIcon('linktree', creator.socials.linktree)}
        </div>

        {/* CTA Buttons */}
        <div className="grid grid-cols-2 gap-2 mt-auto">
          {creator.socials?.linktree || (creator.portfolio && creator.portfolio.length > 0) ? (
            <a 
              href={creator.socials?.linktree || creator.portfolio?.[0]} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="flex h-9 items-center justify-center rounded-xl border border-border text-xs font-semibold text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
            >
              Portfolio
            </a>
          ) : (
            <div className="flex h-9 items-center justify-center rounded-xl border border-dashed border-border text-[10px] text-muted-foreground">
              No Portfolio Links
            </div>
          )}
          <Link 
            href={`/creator/${creator.uid}`} 
            className="flex h-9 items-center justify-center rounded-xl bg-primary text-xs font-bold text-primary-foreground shadow-sm shadow-primary/10 hover:opacity-90 transition-opacity"
          >
            View Profile
          </Link>
        </div>
      </div>
    </div>
  );
}

