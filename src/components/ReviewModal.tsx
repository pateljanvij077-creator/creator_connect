'use client';

import React, { useState } from 'react';
import { db } from '@/lib/db';
import { useAuth } from '@/lib/auth';
import { X, Star, MessageSquare, CheckCircle, Camera } from 'lucide-react';
import confetti from 'canvas-confetti';

interface ReviewModalProps {
  bookingId: string;
  revieweeId: string;
  revieweeName: string;
  reviewerRole: 'business' | 'creator';
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function ReviewModal({
  bookingId,
  revieweeId,
  revieweeName,
  reviewerRole,
  isOpen,
  onClose,
  onSuccess
}: ReviewModalProps) {
  const { user, profile } = useAuth();
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [comment, setComment] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);

    try {
      const reviewerName = profile?.name || user.email;
      
      const newReview = {
        bookingId,
        reviewerId: user.uid,
        reviewerRole,
        revieweeId,
        rating,
        comment,
        photos: photoUrl ? [photoUrl] : []
      };

      await db.createReview(newReview);

      // Create notification for reviewee
      await db.createNotification(
        revieweeId,
        'New Review Received!',
        `${reviewerName} left you a ${rating}-star review: "${comment.substring(0, 40)}..."`,
        'booking_completed'
      );

      setSubmitted(true);
      confetti({
        particleCount: 80,
        angle: 60,
        spread: 55,
        origin: { x: 0 }
      });
      confetti({
        particleCount: 80,
        angle: 120,
        spread: 55,
        origin: { x: 1 }
      });

      setTimeout(() => {
        if (onSuccess) onSuccess();
        onClose();
        setComment('');
        setPhotoUrl('');
        setRating(5);
        setSubmitted(false);
      }, 2000);

    } catch (e) {
      console.error('Failed to submit review:', e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/85 backdrop-blur-sm">
      <div className="relative w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-xl animate-in fade-in zoom-in-95 duration-200">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        {submitted ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <CheckCircle className="h-14 w-14 text-emerald-500 mb-3 animate-bounce" />
            <h3 className="text-xl font-bold text-foreground mb-1">Review Submitted!</h3>
            <p className="text-xs text-muted-foreground max-w-xs">
              Thank you for sharing your feedback. Your review will assist in keeping our community trustworthy and high-quality.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex items-center gap-2 border-b border-border pb-3">
              <MessageSquare className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-bold text-foreground">
                Leave a Review
              </h2>
            </div>
            
            <p className="text-xs text-muted-foreground">
              Share your experience collaborating with <strong className="text-foreground">{revieweeName}</strong>.
            </p>

            {/* Stars Selector */}
            <div className="flex flex-col items-center justify-center py-2 bg-secondary/30 rounded-xl border border-border/40">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">
                Rating
              </span>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(null)}
                    className="p-1 hover:scale-110 transition-transform"
                  >
                    <Star 
                      className={`h-8 w-8 transition-colors ${
                        star <= (hoverRating ?? rating)
                          ? 'fill-yellow-500 text-yellow-500'
                          : 'text-muted-foreground/45'
                      }`}
                    />
                  </button>
                ))}
              </div>
              <span className="text-xs font-bold text-foreground mt-2">
                {rating === 5 && 'Excellent - Highly Recommended'}
                {rating === 4 && 'Good - Satisfactory Collaboration'}
                {rating === 3 && 'Average - Met Basic Expectations'}
                {rating === 2 && 'Poor - Disappointed'}
                {rating === 1 && 'Terrible - Not Recommended'}
              </span>
            </div>

            {/* Review Comment */}
            <div>
              <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">
                Your Review
              </label>
              <textarea
                required
                rows={4}
                placeholder="What went well? Were deliverables met? How was the communication?"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
              />
            </div>

            {/* Optional Photo URL */}
            <div>
              <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">
                Photo URL (Optional)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-muted-foreground">
                  <Camera className="h-4 w-4" />
                </span>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={photoUrl}
                  onChange={(e) => setPhotoUrl(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background pl-9 pr-4 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>

            {/* Action buttons */}
            <button
              type="submit"
              disabled={loading || !comment.trim()}
              className="w-full h-10 rounded-xl gradient-primary text-xs font-bold text-white shadow-md shadow-primary/20 hover:opacity-90 transition-opacity mt-2 disabled:opacity-50"
            >
              {loading ? 'Submitting...' : 'Post Review'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

