'use client';

import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase/client';
import { HiChatBubbleLeft, HiChevronDown, HiChevronUp } from 'react-icons/hi2';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './Comments.module.css';

interface Comment {
  id: string;
  user_name: string;
  content: string;
  created_at: string;
}

interface CommentsProps {
  blogId: string;
}

function timeAgo(dateString: string): string {
  const seconds = Math.floor((Date.now() - new Date(dateString).getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function getInitials(name: string): string {
  return name.trim().split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

function avatarColorIndex(name: string): number {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return Math.abs(hash) % 8;
}

export default function Comments({ blogId }: CommentsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [name, setName] = useState('');
  const [content, setContent] = useState('');
  const [error, setError] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    loadComments();
    const savedName = localStorage.getItem('user_name');
    if (savedName) setName(savedName);
  }, [blogId]);

  async function loadComments() {
    const { data, error: fetchError } = await supabase
      .from('blog_comments')
      .select('id, user_name, content, created_at')
      .eq('blog_id', blogId)
      .eq('approved', true)
      .is('parent_id', null)
      .order('created_at', { ascending: false });

    if (!fetchError) setComments(data || []);
    setLoading(false);
  }

  function handleTriggerClick() {
    setIsOpen(prev => !prev);
    if (!isOpen) {
      setTimeout(() => textareaRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 400);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (!name.trim()) { setError('Please enter your name.'); return; }
    if (!content.trim()) { setError('Please write a comment.'); return; }
    if (content.trim().length < 5) { setError('Comment is too short.'); return; }

    setSubmitting(true);

    try {
      localStorage.setItem('user_name', name.trim());

      const visitorId = localStorage.getItem('visitor_id') || 'anon';

      const { error: insertError } = await supabase
        .from('blog_comments')
        .insert({
          blog_id: blogId,
          user_name: name.trim(),
          user_email: `anon_${visitorId}`,
          content: content.trim(),
          approved: false,
        });

      if (insertError) throw insertError;

      setContent('');
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 5000);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Something went wrong. Please try again.';
      setError(message);
    } finally {
      setSubmitting(false);
    }
  }

  const count = comments.length;

  return (
    <div className={styles.wrapper}>
      {/* Trigger bubble */}
      <button
        type="button"
        className={`${styles.trigger} ${isOpen ? styles.triggerOpen : ''}`}
        onClick={handleTriggerClick}
      >
        <HiChatBubbleLeft size={20} className={styles.triggerIcon} />
        <span className={styles.triggerText}>
          {loading ? 'Comments' : `${count} ${count === 1 ? 'Comment' : 'Comments'}`}
        </span>
        <span className={styles.triggerChevron}>
          {isOpen ? <HiChevronUp size={16} /> : <HiChevronDown size={16} />}
        </span>
      </button>

      {/* Dropdown panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className={styles.panelMotion}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
          >
            <div className={styles.panelInner}>

              {/* Comment Form */}
              <div className={styles.formSection}>
                <h3 className={styles.formTitle}>Leave a Comment</h3>

                {submitted ? (
                  <div className={styles.successBanner}>
                    <span>✓</span> Thanks! Your comment is pending review and will appear shortly.
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className={styles.commentForm}>
                    <input
                      type="text"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      placeholder="Your name"
                      className={styles.input}
                      maxLength={60}
                    />
                    <textarea
                      ref={textareaRef}
                      value={content}
                      onChange={e => setContent(e.target.value)}
                      placeholder="Share your thoughts..."
                      rows={4}
                      className={styles.textarea}
                      maxLength={1000}
                    />
                    {error && <p className={styles.errorMsg}>{error}</p>}
                    <div className={styles.formFooter}>
                      <span className={styles.charCount}>{content.length}/1000</span>
                      <button
                        type="submit"
                        disabled={submitting}
                        className={styles.submitButton}
                      >
                        {submitting ? <span className={styles.submitSpinner} /> : 'Post Comment'}
                      </button>
                    </div>
                    <p className={styles.hint}>Comments are reviewed before publishing.</p>
                  </form>
                )}
              </div>

              {/* Divider */}
              <div className={styles.divider} />

              {/* Comments List */}
              {loading ? (
                <div className={styles.loadingState}>
                  {[1, 2, 3].map(i => (
                    <div key={i} className={styles.skeleton}>
                      <div className={styles.skeletonAvatar} />
                      <div className={styles.skeletonLines}>
                        <div className={`${styles.skeletonLine} ${styles.skeletonLineShort}`} />
                        <div className={`${styles.skeletonLine} ${styles.skeletonLineLong}`} />
                        <div className={`${styles.skeletonLine} ${styles.skeletonLineMid}`} />
                      </div>
                    </div>
                  ))}
                </div>
              ) : count === 0 ? (
                <div className={styles.emptyState}>
                  <HiChatBubbleLeft size={40} className={styles.emptyIcon} />
                  <p>No comments yet. Be the first!</p>
                </div>
              ) : (
                <div className={styles.commentsList}>
                  {comments.map((comment, index) => (
                    <motion.div
                      key={comment.id}
                      className={styles.comment}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <div className={`${styles.avatar} ${styles[`avatarColor${avatarColorIndex(comment.user_name)}`]}`}>
                        {getInitials(comment.user_name)}
                      </div>
                      <div className={styles.commentBody}>
                        <div className={styles.commentHeader}>
                          <span className={styles.commentAuthor}>{comment.user_name}</span>
                          <span className={styles.commentDate}>{timeAgo(comment.created_at)}</span>
                        </div>
                        <p className={styles.commentContent}>{comment.content}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
