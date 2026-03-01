'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { HiStar } from 'react-icons/hi2';
import { supabase } from '@/lib/supabase/client';
import styles from './ReviewStrip.module.css';

interface ReviewSummary {
  avatar: string;
  name: string;
}

export default function ReviewStrip() {
  const [reviews, setReviews] = useState<ReviewSummary[]>([]);
  const [avgRating, setAvgRating] = useState(0);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    async function loadReviews() {
      const { data, error } = await supabase
        .from('reviews')
        .select('reviewer_avatar, reviewer_name, rating')
        .eq('status', 'approved')
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        const avg = data.reduce((sum, r) => sum + r.rating, 0) / data.length;
        setAvgRating(Math.round(avg * 10) / 10);
        setTotalCount(data.length);
        setReviews(
          data.slice(0, 5).map(r => ({
            avatar: r.reviewer_avatar || '',
            name: r.reviewer_name,
          }))
        );
      }
    }
    loadReviews();
  }, []);

  if (totalCount === 0) return null;

  const extraCount = totalCount - reviews.length;

  return (
    <Link href="/reviews" className={styles.strip}>
      <div className={styles.stars}>
        {[1, 2, 3, 4, 5].map(star => (
          <HiStar
            key={star}
            size={16}
            className={star <= Math.round(avgRating) ? styles.starFilled : styles.starEmpty}
          />
        ))}
        <span className={styles.ratingText}>{avgRating}</span>
      </div>
      <span className={styles.divider} />
      <div className={styles.avatars}>
        {reviews.map((review, i) => (
          <div
            key={i}
            className={styles.avatar}
            style={{ zIndex: reviews.length - i }}
          >
            {review.avatar ? (
              <img src={review.avatar} alt={review.name} />
            ) : (
              <span className={styles.avatarInitial}>
                {review.name.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
        ))}
        {extraCount > 0 && (
          <div className={styles.avatar} style={{ zIndex: 0 }}>
            <span className={styles.avatarCount}>+{extraCount}</span>
          </div>
        )}
      </div>
      <span className={styles.reviewsLabel}>Reviews</span>
    </Link>
  );
}
