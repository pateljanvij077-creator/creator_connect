'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Creator, CATEGORIES } from '@/lib/constants';
import { db } from '@/lib/db';
import { useAuth } from '@/lib/auth';
import CreatorCard from '@/components/CreatorCard';
import { 
  Filter, 
  SlidersHorizontal, 
  MapPin, 
  Sparkles, 
  Search, 
  CheckCircle,
  TrendingUp,
  RotateCcw
} from 'lucide-react';

function SearchResultsContent() {
  const { user, profile } = useAuth();
  const searchParams = useSearchParams();
  const searchCategory = searchParams.get('category');
  const searchCity = searchParams.get('city');
  const searchQuery = searchParams.get('search');

  const businessCity = (user?.role === 'business' && profile && 'logo' in profile)
    ? (profile as any).city
    : '';

  // Database list
  const [allCreators, setAllCreators] = useState<Creator[]>([]);
  const [filteredCreators, setFilteredCreators] = useState<Creator[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters state
  const [category, setCategory] = useState(searchCategory || '');
  const [city, setCity] = useState('');
  const [search, setSearch] = useState(searchQuery || '');
  const [tempSearch, setTempSearch] = useState(searchQuery || '');
  const [tempCity, setTempCity] = useState('');
  const [maxPrice, setMaxPrice] = useState<number>(50000);
  const [minFollowers, setMinFollowers] = useState<number>(0);
  const [minRating, setMinRating] = useState<number>(0);
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [sortBy, setSortBy] = useState('highest-rated');
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Load creators
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const list = await db.getCreators();
        setAllCreators(list);
      } catch (e) {
        console.error('Failed to load creators:', e);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // Sync with search queries — only pre-fill the input (tempCity), NOT the active city filter.
  // This ensures creators without a location still appear; user must click Search to filter by city.
  useEffect(() => {
    if (searchCity) {
      setTempCity(searchCity);
      // Do NOT set city here so all creators show by default
    } else {
      setTempCity('');
    }
  }, [searchCity]);

  useEffect(() => {
    if (searchCategory) setCategory(searchCategory);
    if (searchQuery) {
      setSearch(searchQuery);
      setTempSearch(searchQuery);
    }
  }, [searchCategory, searchQuery]);

  // Apply filters and sorting
  useEffect(() => {
    let result = [...allCreators];

    // Status filter: Show both 'approved' and 'pending' creators — hide only suspended
    result = result.filter(c => c.status !== 'suspended');

    // Category Filter
    if (category) {
      const activeCat = CATEGORIES.find(cat => cat.slug === category)?.name || category;
      result = result.filter(c => c.categories && Array.isArray(c.categories) && c.categories.some(cat => cat.toLowerCase().includes(activeCat.toLowerCase())));
    }

    // City Filter
    if (city.trim()) {
      result = result.filter(c => c.location?.city && c.location.city.toLowerCase().includes(city.toLowerCase().trim()));
    }

    // Search Query (Name/Bio)
    if (search.trim()) {
      const query = search.toLowerCase().trim();
      result = result.filter(c => 
        (c.name || '').toLowerCase().includes(query) || 
        (c.bio || '').toLowerCase().includes(query)
      );
    }

    // Pricing Filter (Minimum starting package price)
    // Creators with no packages or price=0 always pass (they haven't set pricing yet)
    result = result.filter(c => {
      const pkgs = (c.pricingPackages || []).filter(p => p.price > 0);
      if (pkgs.length === 0) return true; // No pricing set yet — always show
      const startPrice = Math.min(...pkgs.map(p => p.price));
      return startPrice <= maxPrice;
    });

    // Followers Filter
    if (minFollowers > 0) {
      result = result.filter(c => (c.followers || 0) >= minFollowers);
    }

    // Rating Filter
    if (minRating > 0) {
      result = result.filter(c => (c.rating || 0) >= minRating);
    }

    // Verified Filter
    if (verifiedOnly) {
      result = result.filter(c => c.isVerified);
    }

    // Sorting
    if (sortBy === 'highest-rated') {
      result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } else if (sortBy === 'lowest-price') {
      result.sort((a, b) => {
        const pkgsA = a.pricingPackages || [];
        const pkgsB = b.pricingPackages || [];
        const priceA = pkgsA.length > 0 ? Math.min(...pkgsA.map(p => p.price)) : 0;
        const priceB = pkgsB.length > 0 ? Math.min(...pkgsB.map(p => p.price)) : 0;
        return priceA - priceB;
      });
    } else if (sortBy === 'highest-followers') {
      result.sort((a, b) => (b.followers || 0) - (a.followers || 0));
    } else if (sortBy === 'newest') {
      result.sort((a, b) => {
        const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return timeB - timeA;
      });
    }

    // Local priority sorting: if businessCity is set and the city input is cleared, push local matches to the top
    if (businessCity && !city.trim()) {
      const targetCity = businessCity.toUpperCase().trim();
      result.sort((a, b) => {
        const cityA = a.location?.city || '';
        const cityB = b.location?.city || '';
        const aMatch = cityA.toUpperCase() === targetCity ? 1 : 0;
        const bMatch = cityB.toUpperCase() === targetCity ? 1 : 0;
        return bMatch - aMatch;
      });
    }

    setFilteredCreators(result);
  }, [allCreators, category, city, search, maxPrice, minFollowers, minRating, verifiedOnly, sortBy, businessCity]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(tempSearch);
    setCity(tempCity);
  };

  const resetFilters = () => {
    setCategory('');
    setCity('');
    setTempCity('');
    setSearch('');
    setTempSearch('');
    setMaxPrice(50000);
    setMinFollowers(0);
    setMinRating(0);
    setVerifiedOnly(false);
    setSortBy('highest-rated');
    setShowMobileFilters(false);
  };

  return (
    <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-6 sm:py-10 flex-grow flex flex-col">
      {/* Top Search bar */}
      <form 
        onSubmit={handleSearchSubmit} 
        className="glass-panel w-full rounded-2xl p-3 mb-6 flex flex-col lg:flex-row gap-2.5 border border-border shadow-sm items-stretch lg:items-center"
      >
        <div className="flex-1 w-full flex items-center gap-2 px-3 bg-background rounded-xl border border-border/80 min-w-0">
          <Search className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          <input 
            type="text" 
            placeholder="Search creators by name, keywords..." 
            value={tempSearch}
            onChange={(e) => setTempSearch(e.target.value)}
            className="w-full bg-transparent border-0 py-2 text-xs text-foreground focus:outline-none placeholder-muted-foreground"
          />
        </div>

        <div className="w-full lg:w-56 flex items-center gap-2 px-3 bg-background rounded-xl border border-border/80 min-w-0">
          <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          <input 
            type="text" 
            placeholder="City (e.g., Delhi, Chennai)..." 
            value={tempCity}
            onChange={(e) => setTempCity(e.target.value)}
            className="w-full bg-transparent border-0 py-2 text-xs text-foreground focus:outline-none placeholder-muted-foreground"
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select 
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="flex-1 sm:w-44 rounded-xl border border-border bg-background px-3 py-2 text-xs font-semibold text-foreground focus:outline-none min-w-0 truncate"
            >
              <option value="highest-rated">Sort: Highest Rated</option>
              <option value="lowest-price">Sort: Lowest Price</option>
              <option value="highest-followers">Sort: Followers</option>
              <option value="newest">Sort: Newest</option>
            </select>

            {/* Mobile filters toggle */}
            <button
              type="button"
              onClick={() => setShowMobileFilters(!showMobileFilters)}
              className="lg:hidden rounded-xl border border-border bg-background px-3 py-2 text-xs font-bold text-foreground flex items-center justify-center gap-1.5 flex-shrink-0"
            >
              <SlidersHorizontal className="h-3.5 w-3.5" /> Filters
            </button>
          </div>

          <button
            type="submit"
            className="w-full sm:w-auto rounded-xl bg-primary px-5 py-2 text-xs font-bold text-primary-foreground hover:opacity-90 transition-opacity flex items-center justify-center gap-1.5 shadow-sm"
          >
            <Search className="h-4 w-4" /> Search
          </button>
        </div>
      </form>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-8 flex-grow">
        
        {/* Filter Sidebar — hidden on mobile unless toggled */}
        <aside className={`lg:col-span-1 flex flex-col gap-5 ${showMobileFilters ? 'block' : 'hidden lg:flex'}`}>
          <div className="glass-panel rounded-2xl border border-border p-5 sticky top-24">
            <div className="flex items-center justify-between border-b border-border/60 pb-3 mb-4">
              <span className="flex items-center gap-1.5 text-sm font-bold text-foreground">
                <SlidersHorizontal className="h-4 w-4 text-primary" /> Filters
              </span>
              <button 
                onClick={resetFilters}
                className="flex items-center gap-1 text-[10px] font-bold text-muted-foreground hover:text-primary transition-colors uppercase"
              >
                <RotateCcw className="h-3 w-3" /> Reset
              </button>
            </div>

            <div className="flex flex-col gap-5">
              {/* Category Filter */}
              <div>
                <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">
                  Category
                </label>
                <select 
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground focus:outline-none"
                >
                  <option value="">All Categories</option>
                  {CATEGORIES.map(cat => (
                    <option key={cat.id} value={cat.slug}>{cat.name}</option>
                  ))}
                </select>
              </div>

              {/* Verified Badge */}
              <div className="flex items-center justify-between bg-secondary/20 p-3 rounded-xl border border-border/40">
                <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <CheckCircle className="h-4 w-4 text-primary fill-primary text-white" /> Verified Creators
                </span>
                <input 
                  type="checkbox"
                  checked={verifiedOnly}
                  onChange={(e) => setVerifiedOnly(e.target.checked)}
                  className="h-4.5 w-4.5 rounded border-border text-primary focus:ring-primary/20 accent-primary"
                />
              </div>

              {/* Price Range */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                    Max Starting Price
                  </label>
                  <span className="text-xs font-bold text-primary">₹{maxPrice.toLocaleString()}</span>
                </div>
                <input 
                  type="range"
                  min="1000"
                  max="50000"
                  step="1000"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="w-full h-1.5 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
                />
              </div>

              {/* Followers Minimum */}
              <div>
                <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">
                  Min Followers
                </label>
                <select 
                  value={minFollowers}
                  onChange={(e) => setMinFollowers(Number(e.target.value))}
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground focus:outline-none"
                >
                  <option value={0}>Any Followers</option>
                  <option value={10000}>10K+ Followers</option>
                  <option value={50000}>50K+ Followers</option>
                  <option value={100000}>100K+ Followers</option>
                  <option value={200000}>200K+ Followers</option>
                </select>
              </div>

              {/* Star Rating Minimum */}
              <div>
                <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">
                  Min Star Rating
                </label>
                <div className="grid grid-cols-4 gap-1.5">
                  {[0, 4.5, 4.7, 4.8].map((ratingVal) => (
                    <button
                      key={ratingVal}
                      type="button"
                      onClick={() => setMinRating(ratingVal)}
                      className={`py-1.5 rounded-lg border text-center text-[10px] font-bold transition-all ${
                        minRating === ratingVal
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-border bg-card text-muted-foreground hover:bg-secondary/40'
                      }`}
                    >
                      {ratingVal === 0 ? 'Any' : `${ratingVal}⭐`}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Creators Grid list */}
        <main className="lg:col-span-3">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map(n => (
                <div key={n} className="h-96 rounded-2xl shimmer-loading border border-border"></div>
              ))}
            </div>
          ) : filteredCreators.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center p-12 bg-card/45 border border-dashed border-border rounded-2xl">
              <Sparkles className="h-10 w-10 text-muted-foreground mb-3" />
              <h3 className="text-base font-bold text-foreground mb-1">No creators match your filters</h3>
              <p className="text-xs text-muted-foreground max-w-sm">
                Try widening your budget, modifying your city search, or resetting all current filter values.
              </p>
              <button 
                onClick={resetFilters}
                className="mt-4 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-primary-foreground"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCreators.map((creator) => (
                <CreatorCard key={creator.uid} creator={creator} localCity={businessCity} />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default function SearchResults() {
  return (
    <Suspense fallback={
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        <div className="h-96 rounded-2xl shimmer-loading border border-border"></div>
      </div>
    }>
      <SearchResultsContent />
    </Suspense>
  );
}

