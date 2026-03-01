'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useToast } from '@/components/admin/Toast';
import ConfirmDialog from '@/components/admin/ConfirmDialog';
import {
  HiCheck,
  HiTrash,
  HiEyeSlash,
  HiEye,
  HiMagnifyingGlass,
  HiStar,
  HiPencilSquare,
  HiXMark,
} from 'react-icons/hi2';
import styles from './reviews.module.css';

interface Review {
  id: string;
  reviewer_name: string;
  reviewer_email: string;
  reviewer_avatar: string;
  reviewer_company: string;
  reviewer_location: string;
  rating: number;
  review_text: string;
  status: 'pending' | 'approved' | 'hidden';
  created_at: string;
}

interface EditState {
  id: string;
  reviewer_name: string;
  reviewer_company: string;
  reviewer_location: string;
  rating: number;
  review_text: string;
}

export default function ReviewsAdmin() {
  const { showToast } = useToast();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'hidden'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedReviews, setSelectedReviews] = useState<string[]>([]);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [editing, setEditing] = useState<EditState | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadReviews();
  }, []);

  async function loadReviews() {
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setReviews(data);
    }
    setLoading(false);
  }

  async function updateStatus(id: string, status: 'approved' | 'hidden' | 'pending') {
    const { error } = await supabase
      .from('reviews')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      showToast('Failed to update review', 'error');
    } else {
      setReviews(prev => prev.map(r => r.id === id ? { ...r, status } : r));
      showToast(`Review ${status}`, 'success');
    }
  }

  async function deleteReview(id: string) {
    const { error } = await supabase.from('reviews').delete().eq('id', id);

    if (error) {
      showToast('Failed to delete review', 'error');
    } else {
      setReviews(prev => prev.filter(r => r.id !== id));
      setSelectedReviews(prev => prev.filter(s => s !== id));
      showToast('Review deleted', 'success');
    }
    setConfirmDelete(null);
  }

  async function bulkApprove() {
    const { error } = await supabase
      .from('reviews')
      .update({ status: 'approved', updated_at: new Date().toISOString() })
      .in('id', selectedReviews);

    if (!error) {
      setReviews(prev =>
        prev.map(r => selectedReviews.includes(r.id) ? { ...r, status: 'approved' as const } : r)
      );
      setSelectedReviews([]);
      showToast(`${selectedReviews.length} reviews approved`, 'success');
    }
  }

  async function bulkDelete() {
    const { error } = await supabase.from('reviews').delete().in('id', selectedReviews);

    if (!error) {
      setReviews(prev => prev.filter(r => !selectedReviews.includes(r.id)));
      setSelectedReviews([]);
      showToast('Reviews deleted', 'success');
    }
  }

  function startEdit(review: Review) {
    setEditing({
      id: review.id,
      reviewer_name: review.reviewer_name,
      reviewer_company: review.reviewer_company,
      reviewer_location: review.reviewer_location || '',
      rating: review.rating,
      review_text: review.review_text,
    });
  }

  async function saveEdit() {
    if (!editing) return;
    setSaving(true);

    const { error } = await supabase
      .from('reviews')
      .update({
        reviewer_name: editing.reviewer_name.trim(),
        reviewer_company: editing.reviewer_company.trim(),
        reviewer_location: editing.reviewer_location.trim(),
        rating: editing.rating,
        review_text: editing.review_text.trim(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', editing.id);

    if (error) {
      console.error('Review edit error:', error);
      showToast('Failed to save changes', 'error');
    } else {
      setReviews(prev =>
        prev.map(r =>
          r.id === editing.id
            ? {
                ...r,
                reviewer_name: editing.reviewer_name.trim(),
                reviewer_company: editing.reviewer_company.trim(),
                reviewer_location: editing.reviewer_location.trim(),
                rating: editing.rating,
                review_text: editing.review_text.trim(),
              }
            : r
        )
      );
      setEditing(null);
      showToast('Review updated', 'success');
    }
    setSaving(false);
  }

  const toggleSelect = (id: string) => {
    setSelectedReviews(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedReviews.length === filtered.length) {
      setSelectedReviews([]);
    } else {
      setSelectedReviews(filtered.map(r => r.id));
    }
  };

  const filtered = reviews.filter(r => {
    if (filter !== 'all' && r.status !== filter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        r.reviewer_name.toLowerCase().includes(q) ||
        r.reviewer_email.toLowerCase().includes(q) ||
        r.review_text.toLowerCase().includes(q) ||
        r.reviewer_company.toLowerCase().includes(q) ||
        (r.reviewer_location || '').toLowerCase().includes(q)
      );
    }
    return true;
  });

  const stats = {
    total: reviews.length,
    pending: reviews.filter(r => r.status === 'pending').length,
    approved: reviews.filter(r => r.status === 'approved').length,
    hidden: reviews.filter(r => r.status === 'hidden').length,
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <h1 className={styles.pageTitle}>Reviews</h1>
        <div className={styles.loading}>Loading reviews...</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.pageTitle}>Reviews</h1>

      {/* Stats */}
      <div className={styles.statsCards}>
        <div className={styles.statCard}>
          <span className={styles.statValue}>{stats.total}</span>
          <span className={styles.statLabel}>Total</span>
        </div>
        <div className={`${styles.statCard} ${styles.statPending}`}>
          <span className={styles.statValue}>{stats.pending}</span>
          <span className={styles.statLabel}>Pending</span>
        </div>
        <div className={`${styles.statCard} ${styles.statApproved}`}>
          <span className={styles.statValue}>{stats.approved}</span>
          <span className={styles.statLabel}>Approved</span>
        </div>
        <div className={`${styles.statCard} ${styles.statHidden}`}>
          <span className={styles.statValue}>{stats.hidden}</span>
          <span className={styles.statLabel}>Hidden</span>
        </div>
      </div>

      {/* Controls */}
      <div className={styles.controls}>
        <div className={styles.filterGroup}>
          {(['all', 'pending', 'approved', 'hidden'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`${styles.filterBtn} ${filter === f ? styles.filterActive : ''}`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
        <div className={styles.searchBox}>
          <HiMagnifyingGlass size={18} />
          <input
            type="text"
            placeholder="Search reviews..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className={styles.searchInput}
          />
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedReviews.length > 0 && (
        <div className={styles.bulkActions}>
          <span>{selectedReviews.length} selected</span>
          <button onClick={bulkApprove} className={styles.bulkApproveBtn}>
            <HiCheck size={16} /> Approve
          </button>
          <button onClick={bulkDelete} className={styles.bulkDeleteBtn}>
            <HiTrash size={16} /> Delete
          </button>
        </div>
      )}

      {/* Reviews List */}
      {filtered.length === 0 ? (
        <div className={styles.emptyState}>
          <p>No reviews found</p>
        </div>
      ) : (
        <div className={styles.reviewsList}>
          <div className={styles.selectAllRow}>
            <label className={styles.checkbox}>
              <input
                type="checkbox"
                checked={selectedReviews.length === filtered.length && filtered.length > 0}
                onChange={toggleSelectAll}
              />
              <span>Select All</span>
            </label>
          </div>

          {filtered.map(review => (
            <div key={review.id} className={styles.reviewItem}>
              <div className={styles.reviewCheckbox}>
                <input
                  type="checkbox"
                  checked={selectedReviews.includes(review.id)}
                  onChange={() => toggleSelect(review.id)}
                />
              </div>

              <div className={styles.reviewContent}>
                <div className={styles.reviewHeader}>
                  <div className={styles.reviewerInfo}>
                    <div className={styles.reviewerAvatar}>
                      {review.reviewer_avatar ? (
                        <img src={review.reviewer_avatar} alt={review.reviewer_name} />
                      ) : (
                        <span>{review.reviewer_name.charAt(0).toUpperCase()}</span>
                      )}
                    </div>
                    <div>
                      <strong className={styles.reviewerName}>{review.reviewer_name}</strong>
                      <span className={styles.reviewerEmail}>{review.reviewer_email}</span>
                      {review.reviewer_company && (
                        <span className={styles.reviewerCompany}>{review.reviewer_company}</span>
                      )}
                      {review.reviewer_location && (
                        <span className={styles.reviewerCompany}>{review.reviewer_location}</span>
                      )}
                    </div>
                  </div>

                  <div className={styles.reviewMeta}>
                    <div className={styles.reviewStars}>
                      {[1, 2, 3, 4, 5].map(star => (
                        <HiStar
                          key={star}
                          size={14}
                          className={star <= review.rating ? styles.starFilled : styles.starEmpty}
                        />
                      ))}
                    </div>
                    <span className={`${styles.statusBadge} ${styles[`status_${review.status}`]}`}>
                      {review.status}
                    </span>
                  </div>
                </div>

                <p className={styles.reviewText}>{review.review_text}</p>

                <div className={styles.reviewFooter}>
                  <span className={styles.reviewDate}>
                    {new Date(review.created_at).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>

                  <div className={styles.actions}>
                    {review.status !== 'approved' && (
                      <button
                        onClick={() => updateStatus(review.id, 'approved')}
                        className={styles.approveBtn}
                        title="Approve"
                      >
                        <HiCheck size={16} />
                      </button>
                    )}
                    {review.status === 'approved' && (
                      <button
                        onClick={() => updateStatus(review.id, 'hidden')}
                        className={styles.hideBtn}
                        title="Hide"
                      >
                        <HiEyeSlash size={16} />
                      </button>
                    )}
                    {review.status === 'hidden' && (
                      <button
                        onClick={() => updateStatus(review.id, 'approved')}
                        className={styles.showBtn}
                        title="Show"
                      >
                        <HiEye size={16} />
                      </button>
                    )}
                    <button
                      onClick={() => startEdit(review)}
                      className={styles.editBtn}
                      title="Edit"
                    >
                      <HiPencilSquare size={16} />
                    </button>
                    <button
                      onClick={() => setConfirmDelete(review.id)}
                      className={styles.deleteBtn}
                      title="Delete"
                    >
                      <HiTrash size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Modal */}
      {editing && (
        <div className={styles.editOverlay} onClick={() => setEditing(null)}>
          <div className={styles.editModal} onClick={e => e.stopPropagation()}>
            <div className={styles.editModalHeader}>
              <h3 className={styles.editModalTitle}>Edit Review</h3>
              <button onClick={() => setEditing(null)} className={styles.editCloseBtn}>
                <HiXMark size={20} />
              </button>
            </div>

            <div className={styles.editForm}>
              <div className={styles.editRow}>
                <div className={styles.editGroup}>
                  <label className={styles.editLabel}>Name</label>
                  <input
                    type="text"
                    value={editing.reviewer_name}
                    onChange={e => setEditing({ ...editing, reviewer_name: e.target.value })}
                    className={styles.editInput}
                  />
                </div>
                <div className={styles.editGroup}>
                  <label className={styles.editLabel}>Company</label>
                  <input
                    type="text"
                    value={editing.reviewer_company}
                    onChange={e => setEditing({ ...editing, reviewer_company: e.target.value })}
                    className={styles.editInput}
                  />
                </div>
              </div>

              <div className={styles.editRow}>
                <div className={styles.editGroup}>
                  <label className={styles.editLabel}>Location</label>
                  <input
                    type="text"
                    value={editing.reviewer_location}
                    onChange={e => setEditing({ ...editing, reviewer_location: e.target.value })}
                    className={styles.editInput}
                    placeholder="e.g. Bowie, MD"
                  />
                </div>
                <div className={styles.editGroup}>
                  <label className={styles.editLabel}>Rating</label>
                  <div className={styles.editRating}>
                    {[1, 2, 3, 4, 5].map(star => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setEditing({ ...editing, rating: star })}
                        className={styles.editRatingBtn}
                      >
                        <HiStar
                          size={22}
                          className={star <= editing.rating ? styles.starFilled : styles.starEmpty}
                        />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className={styles.editGroup}>
                <label className={styles.editLabel}>Review Text</label>
                <textarea
                  value={editing.review_text}
                  onChange={e => setEditing({ ...editing, review_text: e.target.value })}
                  className={styles.editTextarea}
                  rows={6}
                />
              </div>

              <div className={styles.editActions}>
                <button
                  onClick={() => setEditing(null)}
                  className={styles.editCancelBtn}
                  disabled={saving}
                >
                  Cancel
                </button>
                <button
                  onClick={saveEdit}
                  className={styles.editSaveBtn}
                  disabled={saving}
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {confirmDelete && (
        <ConfirmDialog
          isOpen={true}
          title="Delete Review"
          message="Are you sure you want to delete this review? This cannot be undone."
          confirmText="Delete"
          onConfirm={() => deleteReview(confirmDelete)}
          onCancel={() => setConfirmDelete(null)}
        />
      )}
    </div>
  );
}
