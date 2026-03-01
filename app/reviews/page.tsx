'use client';
export const dynamic = 'force-dynamic';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiStar, HiMapPin, HiCamera } from 'react-icons/hi2';
import { supabase } from '@/lib/supabase/client';
import { useSettings } from '@/lib/hooks/useSettings';
import BackToHome from '@/components/common/BackToHome';
import styles from './reviews.module.css';

interface Review {
  id: string;
  reviewer_name: string;
  reviewer_avatar: string;
  reviewer_company: string;
  reviewer_location: string;
  rating: number;
  review_text: string;
  created_at: string;
}

function timeAgo(dateString: string): string {
  const now = Date.now();
  const then = new Date(dateString).getTime();
  const seconds = Math.floor((now - then) / 1000);

  if (seconds < 5) return 'just now';
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  const weeks = Math.floor(days / 7);
  if (weeks < 5) return `${weeks}w ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  const years = Math.floor(days / 365);
  return `${years}y ago`;
}

const DESKTOP_LIMIT = 6;
const MOBILE_LIMIT = 3;

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

export default function ReviewsPage() {
  const { settings, loading: settingsLoading } = useSettings();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Form state
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formCompany, setFormCompany] = useState('');
  const [formLocation, setFormLocation] = useState('');
  const [formRating, setFormRating] = useState(5);
  const [formText, setFormText] = useState('');
  const [formAvatar, setFormAvatar] = useState('');
  const [hoverRating, setHoverRating] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState('');
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadReviews();
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  async function loadReviews() {
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .eq('status', 'approved')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setReviews(data);
    }
    setLoading(false);
  }

  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      setSubmitStatus('Avatar must be under 2MB');
      return;
    }

    setUploadingAvatar(true);
    const ext = file.name.split('.').pop();
    const fileName = `review-avatars/${Date.now()}.${ext}`;

    const { error } = await supabase.storage
      .from('portfolio-assets')
      .upload(fileName, file, { upsert: true });

    if (error) {
      setSubmitStatus('Failed to upload avatar');
    } else {
      const { data: urlData } = supabase.storage
        .from('portfolio-assets')
        .getPublicUrl(fileName);
      setFormAvatar(urlData.publicUrl);
    }
    setUploadingAvatar(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!formName.trim() || !formEmail.trim() || !formText.trim()) return;

    setSubmitting(true);
    setSubmitStatus('');

    const { error } = await supabase.from('reviews').insert({
      reviewer_name: formName.trim(),
      reviewer_email: formEmail.trim(),
      reviewer_company: formCompany.trim(),
      reviewer_location: formLocation.trim(),
      reviewer_avatar: formAvatar,
      rating: formRating,
      review_text: formText.trim(),
      status: 'pending',
    });

    if (error) {
      console.error('Review submit error:', error);
      setSubmitStatus('Something went wrong. Please try again.');
    } else {
      setSubmitStatus('Thank you! Your review has been submitted and is pending approval.');
      setFormName('');
      setFormEmail('');
      setFormCompany('');
      setFormLocation('');
      setFormRating(5);
      setFormText('');
      setFormAvatar('');
    }
    setSubmitting(false);
  }

  const avgRating =
    reviews.length > 0
      ? Math.round((reviews.reduce((s, r) => s + r.rating, 0) / reviews.length) * 10) / 10
      : 0;

  const limit = isMobile ? MOBILE_LIMIT : DESKTOP_LIMIT;
  const visibleReviews = showAll ? reviews : reviews.slice(0, limit);
  const hasMore = reviews.length > limit;

  // Loading screen
  if (loading || settingsLoading) {
    return (
      <div className={styles.container}>
        <BackToHome />
        <div className={styles.loadingScreen}>
          <div className={styles.loadingPulse}>
            <HiStar size={32} className={styles.loadingIcon} />
          </div>
          <p className={styles.loadingText}>Loading reviews...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {settings.reviews_bg_url && (
        <>
          <div className={styles.bgImage} style={{ backgroundImage: `url(${settings.reviews_bg_url})` }} />
          <div className={styles.bgOverlay} style={{ opacity: settings.reviews_bg_overlay_opacity }} />
        </>
      )}
      <BackToHome />

      {/* Header */}
      <motion.div
        className={styles.header}
        initial="hidden"
        animate="visible"
        variants={fadeInUp}
        transition={{ duration: 0.6 }}
      >
        <h1 className={styles.title}>
          {settings.reviews_title || 'Client Reviews'}
        </h1>
        <p className={styles.subtitle}>
          {settings.reviews_subtitle || 'What people say about working with me'}
        </p>
        {reviews.length > 0 && (
          <div className={styles.overallRating}>
            <div className={styles.overallStars}>
              {[1, 2, 3, 4, 5].map((star) => (
                <HiStar
                  key={star}
                  size={24}
                  className={
                    star <= Math.round(avgRating)
                      ? styles.starFilled
                      : styles.starEmpty
                  }
                />
              ))}
            </div>
            <span className={styles.overallValue}>{avgRating}</span>
            <span className={styles.overallText}>
              based on {reviews.length} review{reviews.length !== 1 ? 's' : ''}
            </span>
          </div>
        )}
      </motion.div>

      {/* Reviews List */}
      {reviews.length === 0 ? (
        <motion.div
          className={styles.emptyState}
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
        >
          <HiStar size={40} className={styles.emptyIcon} />
          <p>No reviews yet. Be the first to leave one!</p>
        </motion.div>
      ) : (
        <motion.div
          className={styles.reviewsGrid}
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
        >
          {visibleReviews.map((review) => (
            <motion.div
              key={review.id}
              className={styles.reviewCard}
              variants={fadeInUp}
              whileHover={{ y: -4 }}
              transition={{ duration: 0.3 }}
            >
              {/* Quote mark */}
              <div className={styles.quoteMark}>"</div>

              <div className={styles.reviewHeader}>
                <div className={styles.reviewerInfo}>
                  <div className={styles.reviewerAvatar}>
                    {review.reviewer_avatar ? (
                      <img
                        src={review.reviewer_avatar}
                        alt={review.reviewer_name}
                      />
                    ) : (
                      <span>
                        {review.reviewer_name.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div className={styles.reviewerDetails}>
                    <p className={styles.reviewerName}>
                      {review.reviewer_name}
                    </p>
                    {(review.reviewer_company || review.reviewer_location) && (
                      <p className={styles.reviewerMeta}>
                        {review.reviewer_company}
                        {review.reviewer_company && review.reviewer_location && ' · '}
                        {review.reviewer_location && (
                          <span className={styles.locationTag}>
                            <HiMapPin size={12} />
                            {review.reviewer_location}
                          </span>
                        )}
                      </p>
                    )}
                  </div>
                </div>
                <div className={styles.reviewStars}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <HiStar
                      key={star}
                      size={16}
                      className={
                        star <= review.rating
                          ? styles.starFilled
                          : styles.starEmpty
                      }
                    />
                  ))}
                </div>
              </div>

              <p className={styles.reviewText}>{review.review_text}</p>

              <p className={styles.reviewDate}>
                {timeAgo(review.created_at)}
              </p>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Show More */}
      {hasMore && !showAll && (
        <motion.div
          className={styles.showMoreWrap}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <button
            className={styles.showMoreBtn}
            onClick={() => setShowAll(true)}
          >
            Show all {reviews.length} reviews
          </button>
        </motion.div>
      )}

      {/* Submit Review Form */}
      <motion.div
        className={styles.formSection}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-50px' }}
        variants={fadeInUp}
        transition={{ duration: 0.6 }}
      >
        <h2 className={styles.formTitle}>Leave a Review</h2>
        <p className={styles.formSubtitle}>
          Worked with me? I'd love to hear your feedback.
        </p>

        <form onSubmit={handleSubmit} className={styles.form}>
          {/* Avatar Upload */}
          <div className={styles.avatarUploadSection}>
            <div
              className={styles.avatarUpload}
              onClick={() => avatarInputRef.current?.click()}
            >
              {formAvatar ? (
                <img src={formAvatar} alt="Your avatar" />
              ) : (
                <div className={styles.avatarPlaceholder}>
                  <HiCamera size={22} />
                </div>
              )}
              {uploadingAvatar && <div className={styles.avatarUploading} />}
            </div>
            <span className={styles.avatarHint}>
              {uploadingAvatar ? 'Uploading...' : 'Add your photo'}
            </span>
            <input
              ref={avatarInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarUpload}
              style={{ display: 'none' }}
            />
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Name *</label>
              <input
                type="text"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                className={styles.input}
                placeholder="Your name"
                required
                disabled={submitting}
              />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Email *</label>
              <input
                type="email"
                value={formEmail}
                onChange={(e) => setFormEmail(e.target.value)}
                className={styles.input}
                placeholder="Your email (not displayed)"
                required
                disabled={submitting}
              />
            </div>
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Company</label>
              <input
                type="text"
                value={formCompany}
                onChange={(e) => setFormCompany(e.target.value)}
                className={styles.input}
                placeholder="Your company (optional)"
                disabled={submitting}
              />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Location</label>
              <input
                type="text"
                value={formLocation}
                onChange={(e) => setFormLocation(e.target.value)}
                className={styles.input}
                placeholder="e.g. Bowie, MD"
                disabled={submitting}
              />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Rating *</label>
            <div className={styles.ratingPicker}>
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setFormRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className={styles.ratingBtn}
                >
                  <HiStar
                    size={32}
                    className={
                      star <= (hoverRating || formRating)
                        ? styles.starFilled
                        : styles.starEmpty
                    }
                  />
                </button>
              ))}
              <span className={styles.ratingLabel}>
                {(hoverRating || formRating) === 5 && 'Excellent'}
                {(hoverRating || formRating) === 4 && 'Great'}
                {(hoverRating || formRating) === 3 && 'Good'}
                {(hoverRating || formRating) === 2 && 'Fair'}
                {(hoverRating || formRating) === 1 && 'Poor'}
              </span>
            </div>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Review *</label>
            <textarea
              value={formText}
              onChange={(e) => setFormText(e.target.value)}
              className={styles.textarea}
              placeholder="Share your experience working with me..."
              rows={5}
              required
              disabled={submitting}
            />
          </div>

          <button
            type="submit"
            className={styles.submitBtn}
            disabled={submitting || uploadingAvatar}
          >
            {submitting ? 'Submitting...' : 'Submit Review'}
          </button>

          <AnimatePresence>
            {submitStatus && (
              <motion.p
                className={styles.submitStatus}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                style={{
                  color: submitStatus.includes('Thank')
                    ? '#27AE60'
                    : '#E74C3C',
                }}
              >
                {submitStatus}
              </motion.p>
            )}
          </AnimatePresence>
        </form>
      </motion.div>
    </div>
  );
}
