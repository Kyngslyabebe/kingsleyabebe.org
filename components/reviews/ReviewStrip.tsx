'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { HiStar } from 'react-icons/hi2';
import { supabase } from '@/lib/supabase/client';
import styles from './ReviewStrip.module.css';

interface ReviewData {
  avatar: string;
  name: string;
  text: string;
  rating: number;
}

export default function ReviewStrip() {
  const [reviews, setReviews] = useState<ReviewData[]>([]);
  const [avgRating, setAvgRating] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [activeIndex, setActiveIndex] = useState(0);
  const [animState, setAnimState] = useState<'visible' | 'exiting' | 'entering'>('visible');

  useEffect(() => {
    async function loadReviews() {
      const { data, error } = await supabase
        .from('reviews')
        .select('reviewer_avatar, reviewer_name, rating, review_text')
        .eq('status', 'approved')
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        const avg = data.reduce((sum, r) => sum + r.rating, 0) / data.length;
        setAvgRating(Math.round(avg * 10) / 10);
        setTotalCount(data.length);
        setReviews(
          data.map(r => ({
            avatar: r.reviewer_avatar || '',
            name: r.reviewer_name,
            text: r.review_text || '',
            rating: r.rating,
          }))
        );
      }
    }
    loadReviews();
  }, []);

  // Auto-cycle reviews
  const cycleReview = useCallback(() => {
    if (reviews.length <= 1) return;

    // Gentle fade out
    setAnimState('exiting');

    setTimeout(() => {
      setActiveIndex(prev => (prev + 1) % reviews.length);
      setAnimState('entering');
    }, 600);

    setTimeout(() => {
      setAnimState('visible');
    }, 1200);
  }, [reviews.length]);

  useEffect(() => {
    if (reviews.length <= 1) return;
    const interval = setInterval(cycleReview, 5000);
    return () => clearInterval(interval);
  }, [cycleReview, reviews.length]);

  if (totalCount === 0) return null;

  const current = reviews[activeIndex];
  if (!current) return null;

  // Truncate review text
  const truncated = current.text.length > 80
    ? current.text.slice(0, 80).trimEnd() + '...'
    : current.text;

  return (
    <Link href="/reviews" className={styles.strip}>
      {/* Rating header */}
      <div className={styles.ratingLine}>
        <HiStar size={14} className={styles.starFilled} />
        <span className={styles.ratingText}>{avgRating}</span>
        <span className={styles.ratingFrom}>from {totalCount} review{totalCount !== 1 ? 's' : ''}</span>
      </div>

      {/* Testimonial card */}
      <div className={styles.testimonial}>
        <div
          className={`${styles.testimonialInner} ${
            animState === 'exiting' ? styles.slideOut :
            animState === 'entering' ? styles.slideIn :
            styles.slideVisible
          }`}
        >
          <div className={styles.quoteRow}>
            <div className={styles.avatar}>
              {current.avatar ? (
                <img src={current.avatar} alt={current.name} />
              ) : (
                <span className={styles.avatarInitial}>
                  {current.name.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <div className={styles.quoteContent}>
              <p className={styles.quoteText}>&ldquo;{truncated}&rdquo;</p>
              <span className={styles.quoteName}>— {current.name}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Progress dots */}
      {reviews.length > 1 && (
        <div className={styles.dots}>
          {reviews.map((_, i) => (
            <span
              key={i}
              className={`${styles.dot} ${i === activeIndex ? styles.dotActive : ''}`}
            />
          ))}
        </div>
      )}
    </Link>
  );
}
