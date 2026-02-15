'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { HiChatBubbleLeft, HiUser } from 'react-icons/hi2';
import styles from './Comments.module.css';

interface Comment {
  id: string;
  user_name: string;
  user_email: string;
  content: string;
  created_at: string;
  replies?: Comment[];
}

interface CommentsProps {
  blogId: string;
}

export default function Comments({ blogId }: CommentsProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  // Form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [content, setContent] = useState('');

  useEffect(() => {
    loadComments();
    
    // Load saved name/email
    const savedName = localStorage.getItem('user_name');
    const savedEmail = localStorage.getItem('user_email');
    if (savedName) setName(savedName);
    if (savedEmail) setEmail(savedEmail);
  }, [blogId]);

  async function loadComments() {
    const { data, error } = await supabase
      .from('blog_comments')
      .select('*')
      .eq('blog_id', blogId)
      .eq('approved', true)
      .is('parent_id', null)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading comments:', error);
    } else {
      setComments(data || []);
    }
    setLoading(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!name.trim() || !email.trim() || !content.trim()) {
      alert('Please fill in all fields');
      return;
    }

    if (!email.includes('@')) {
      alert('Please enter a valid email');
      return;
    }

    setSubmitting(true);

    try {
      // Save name/email for future comments
      localStorage.setItem('user_name', name);
      localStorage.setItem('user_email', email);

      const { error } = await supabase
        .from('blog_comments')
        .insert({
          blog_id: blogId,
          user_name: name.trim(),
          user_email: email.trim(),
          content: content.trim(),
          approved: false, // Needs admin approval
        });

      if (error) throw error;

      alert('Comment submitted! It will appear after approval.');
      setContent('');
    } catch (error: any) {
      alert(error.message || 'Error submitting comment');
    } finally {
      setSubmitting(false);
    }
  }

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  return (
    <div className={styles.commentsSection}>
      <h2 className={styles.title}>
        <HiChatBubbleLeft size={24} />
        Comments ({comments.length})
      </h2>

      {/* Comment Form */}
      <form onSubmit={handleSubmit} className={styles.commentForm}>
        <div className={styles.formRow}>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name *"
            required
            className={styles.input}
          />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Your email *"
            required
            className={styles.input}
          />
        </div>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write your comment..."
          required
          rows={4}
          className={styles.textarea}
        />
        <button
          type="submit"
          disabled={submitting}
          className={styles.submitButton}
        >
          {submitting ? 'Submitting...' : 'Post Comment'}
        </button>
        <p className={styles.hint}>
          Your comment will be published after moderation.
        </p>
      </form>

      {/* Comments List */}
      {loading ? (
        <div className={styles.loading}>Loading comments...</div>
      ) : comments.length === 0 ? (
        <div className={styles.empty}>
          <p>No comments yet. Be the first to comment!</p>
        </div>
      ) : (
        <div className={styles.commentsList}>
          {comments.map(comment => (
            <div key={comment.id} className={styles.comment}>
              <div className={styles.commentHeader}>
                <div className={styles.avatar}>
                  <HiUser size={20} />
                </div>
                <div className={styles.commentMeta}>
                  <span className={styles.commentAuthor}>{comment.user_name}</span>
                  <span className={styles.commentDate}>{formatDate(comment.created_at)}</span>
                </div>
              </div>
              <div className={styles.commentContent}>
                {comment.content}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}