'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useToast } from '@/components/admin/Toast';
import ConfirmDialog from '@/components/admin/ConfirmDialog';
import { 
  HiCheck, 
  HiTrash, 
  HiEye,
  HiXMark,
  HiMagnifyingGlass,
  HiCheckCircle,
  HiExclamationCircle,
  HiChevronDown,
  HiChevronUp
} from 'react-icons/hi2';
import styles from './comments.module.css';

interface Comment {
  id: string;
  blog_id: string;
  user_name: string;
  user_email: string;
  content: string;
  approved: boolean;
  created_at: string;
  blogs: {
    title: string;
    slug: string;
  };
}

interface BlogFilter {
  id: string;
  title: string;
  comments_count: number;
}

export default function CommentsAdmin() {
  const { showToast } = useToast();
  const [comments, setComments] = useState<Comment[]>([]);
  const [blogs, setBlogs] = useState<BlogFilter[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [filter, setFilter] = useState<'pending' | 'approved' | 'all'>('pending');
  const [selectedBlog, setSelectedBlog] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest'>('newest');
  
  // Bulk actions
  const [selectedComments, setSelectedComments] = useState<string[]>([]);
  const [expandedComments, setExpandedComments] = useState<string[]>([]);
  
  // Stats
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0
  });

  // Confirm dialog
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => Promise<void>;
    variant: 'danger' | 'warning' | 'info' | 'success';
    confirmText: string;
    loading: boolean;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: async () => {},
    variant: 'danger',
    confirmText: 'Delete',
    loading: false,
  });

  function openConfirm(config: {
    title: string;
    message: string;
    onConfirm: () => Promise<void>;
    variant?: 'danger' | 'warning' | 'info' | 'success';
    confirmText?: string;
  }) {
    setConfirmDialog({
      isOpen: true,
      title: config.title,
      message: config.message,
      onConfirm: config.onConfirm,
      variant: config.variant || 'danger',
      confirmText: config.confirmText || 'Confirm',
      loading: false,
    });
  }

  function closeConfirm() {
    setConfirmDialog(prev => ({ ...prev, isOpen: false, loading: false }));
  }

  async function handleConfirm() {
    setConfirmDialog(prev => ({ ...prev, loading: true }));
    await confirmDialog.onConfirm();
    closeConfirm();
  }

  useEffect(() => {
    loadBlogs();
    loadStats();
  }, []);

  useEffect(() => {
    loadComments();
  }, [filter, selectedBlog, sortBy]);

  async function loadBlogs() {
    const { data } = await supabase
      .from('blogs')
      .select('id, title, comments_count')
      .order('title');
    
    setBlogs(data || []);
  }

  async function loadStats() {
    const { count: total } = await supabase
      .from('blog_comments')
      .select('*', { count: 'exact', head: true });

    const { count: pending } = await supabase
      .from('blog_comments')
      .select('*', { count: 'exact', head: true })
      .eq('approved', false);

    const { count: approved } = await supabase
      .from('blog_comments')
      .select('*', { count: 'exact', head: true })
      .eq('approved', true);

    setStats({
      total: total || 0,
      pending: pending || 0,
      approved: approved || 0
    });
  }

  async function loadComments() {
    setLoading(true);
    
    let query = supabase
      .from('blog_comments')
      .select(`
        *,
        blogs(title, slug)
      `);

    // Apply filters
    if (filter === 'pending') {
      query = query.eq('approved', false);
    } else if (filter === 'approved') {
      query = query.eq('approved', true);
    }

    if (selectedBlog !== 'all') {
      query = query.eq('blog_id', selectedBlog);
    }

    // Apply sorting
    if (sortBy === 'newest') {
      query = query.order('created_at', { ascending: false });
    } else {
      query = query.order('created_at', { ascending: true });
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error:', error);
      showToast('Error loading comments', 'error');
    } else {
      setComments(data || []);
    }
    setLoading(false);
  }

  async function approveComment(id: string) {
    const { error } = await supabase
      .from('blog_comments')
      .update({ approved: true })
      .eq('id', id);

    if (error) {
      showToast('Error approving comment', 'error');
    } else {
      showToast('Comment approved!', 'success');
      loadComments();
      loadStats();
    }
  }

  async function unapproveComment(id: string) {
    const { error } = await supabase
      .from('blog_comments')
      .update({ approved: false })
      .eq('id', id);

    if (error) {
      showToast('Error unapproving comment', 'error');
    } else {
      showToast('Comment unapproved', 'success');
      loadComments();
      loadStats();
    }
  }

  async function deleteComment(id: string) {
    openConfirm({
      title: 'Delete Comment',
      message: 'Delete this comment? This action cannot be undone.',
      confirmText: 'Delete',
      variant: 'danger',
      onConfirm: async () => {
        const { error } = await supabase
          .from('blog_comments')
          .delete()
          .eq('id', id);

        if (error) {
          showToast('Error deleting comment', 'error');
        } else {
          showToast('Comment deleted', 'success');
          loadComments();
          loadStats();
        }
      },
    });
  }

  // Bulk Actions
  function toggleSelectAll() {
    if (selectedComments.length === filteredComments.length) {
      setSelectedComments([]);
    } else {
      setSelectedComments(filteredComments.map(c => c.id));
    }
  }

  function toggleSelectComment(id: string) {
    if (selectedComments.includes(id)) {
      setSelectedComments(selectedComments.filter(cid => cid !== id));
    } else {
      setSelectedComments([...selectedComments, id]);
    }
  }

  async function bulkApprove() {
    if (selectedComments.length === 0) return;
    const count = selectedComments.length;
    openConfirm({
      title: 'Approve Comments',
      message: `Approve ${count} comment${count > 1 ? 's' : ''}? They will be visible to the public.`,
      confirmText: 'Approve',
      variant: 'success',
      onConfirm: async () => {
        const { error } = await supabase
          .from('blog_comments')
          .update({ approved: true })
          .in('id', selectedComments);

        if (error) {
          showToast('Error approving comments', 'error');
        } else {
          showToast(`${count} comment${count > 1 ? 's' : ''} approved!`, 'success');
          setSelectedComments([]);
          loadComments();
          loadStats();
        }
      },
    });
  }

  async function bulkDelete() {
    if (selectedComments.length === 0) return;
    const count = selectedComments.length;
    openConfirm({
      title: 'Delete Comments',
      message: `Delete ${count} comment${count > 1 ? 's' : ''}? This action cannot be undone.`,
      confirmText: 'Delete All',
      variant: 'danger',
      onConfirm: async () => {
        const { error } = await supabase
          .from('blog_comments')
          .delete()
          .in('id', selectedComments);

        if (error) {
          showToast('Error deleting comments', 'error');
        } else {
          showToast(`${count} comment${count > 1 ? 's' : ''} deleted`, 'success');
          setSelectedComments([]);
          loadComments();
          loadStats();
        }
      },
    });
  }

  // Search filtering
  const filteredComments = comments.filter(comment => {
    if (!searchQuery) return true;
    const search = searchQuery.toLowerCase();
    return (
      comment.user_name.toLowerCase().includes(search) ||
      comment.user_email.toLowerCase().includes(search) ||
      comment.content.toLowerCase().includes(search) ||
      comment.blogs?.title.toLowerCase().includes(search)
    );
  });

  function toggleExpandComment(id: string) {
    if (expandedComments.includes(id)) {
      setExpandedComments(expandedComments.filter(cid => cid !== id));
    } else {
      setExpandedComments([...expandedComments, id]);
    }
  }

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  if (loading) {
    return (
      <div className={styles.loadingState}>
        <div className={styles.spinner} />
        <p>Loading comments...</p>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      {/* Header with Stats */}
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Comment Moderation</h1>
          <p className={styles.pageSubtitle}>Manage and moderate blog comments</p>
        </div>
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
        </div>
      </div>

      {/* Filters and Search */}
      <div className={styles.controls}>
        <div className={styles.controlsRow}>
          {/* Status Filter */}
          <div className={styles.filterGroup}>
            <label>Status:</label>
            <div className={styles.buttonGroup}>
              <button
                onClick={() => setFilter('pending')}
                className={`${styles.filterBtn} ${filter === 'pending' ? styles.active : ''}`}
              >
                <HiExclamationCircle size={16} />
                Pending ({stats.pending})
              </button>
              <button
                onClick={() => setFilter('approved')}
                className={`${styles.filterBtn} ${filter === 'approved' ? styles.active : ''}`}
              >
                <HiCheckCircle size={16} />
                Approved ({stats.approved})
              </button>
              <button
                onClick={() => setFilter('all')}
                className={`${styles.filterBtn} ${filter === 'all' ? styles.active : ''}`}
              >
                All ({stats.total})
              </button>
            </div>
          </div>

          {/* Blog Post Filter */}
          <div className={styles.filterGroup}>
            <label>Blog Post:</label>
            <select
              value={selectedBlog}
              onChange={(e) => setSelectedBlog(e.target.value)}
              className={styles.select}
            >
              <option value="all">All Posts</option>
              {blogs.map(blog => (
                <option key={blog.id} value={blog.id}>
                  {blog.title} ({blog.comments_count || 0})
                </option>
              ))}
            </select>
          </div>

          {/* Sort */}
          <div className={styles.filterGroup}>
            <label>Sort:</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'newest' | 'oldest')}
              className={styles.select}
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
            </select>
          </div>
        </div>

        {/* Search */}
        <div className={styles.searchBox}>
          <HiMagnifyingGlass size={20} />
          <input
            type="text"
            placeholder="Search comments, names, emails..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className={styles.clearSearch}>
              <HiXMark size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedComments.length > 0 && (
        <div className={styles.bulkActions}>
          <span>{selectedComments.length} selected</span>
          <div className={styles.bulkButtons}>
            <button onClick={bulkApprove} className={styles.bulkApproveBtn}>
              <HiCheck size={16} />
              Approve Selected
            </button>
            <button onClick={bulkDelete} className={styles.bulkDeleteBtn}>
              <HiTrash size={16} />
              Delete Selected
            </button>
            <button onClick={() => setSelectedComments([])} className={styles.bulkCancelBtn}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Comments List */}
      {filteredComments.length === 0 ? (
        <div className={styles.emptyState}>
          <HiCheckCircle size={48} />
          <p>No comments found</p>
          {searchQuery && <p className={styles.emptyHint}>Try adjusting your search or filters</p>}
        </div>
      ) : (
        <div className={styles.commentsList}>
          {/* Select All */}
          <div className={styles.selectAll}>
            <label className={styles.checkbox}>
              <input
                type="checkbox"
                checked={selectedComments.length === filteredComments.length}
                onChange={toggleSelectAll}
              />
              <span>Select All ({filteredComments.length})</span>
            </label>
          </div>

          {/* Comments */}
          {filteredComments.map(comment => {
            const isExpanded = expandedComments.includes(comment.id);
            const isLongComment = comment.content.length > 200;
            const displayContent = isExpanded || !isLongComment 
              ? comment.content 
              : `${comment.content.substring(0, 200)}...`;

            return (
              <div 
                key={comment.id} 
                className={`${styles.comment} ${selectedComments.includes(comment.id) ? styles.selected : ''}`}
              >
                <div className={styles.commentCheckbox}>
                  <input
                    type="checkbox"
                    checked={selectedComments.includes(comment.id)}
                    onChange={() => toggleSelectComment(comment.id)}
                  />
                </div>

                <div className={styles.commentContent}>
                  <div className={styles.commentHeader}>
                    <div className={styles.commentMeta}>
                      <strong className={styles.userName}>{comment.user_name}</strong>
                      <span className={styles.email}>{comment.user_email}</span>
                      <span className={styles.date}>{formatDate(comment.created_at)}</span>
                      <span className={`${styles.badge} ${comment.approved ? styles.badgeApproved : styles.badgePending}`}>
                        {comment.approved ? 'Approved' : 'Pending'}
                      </span>
                    </div>
                    <div className={styles.actions}>
                      {comment.approved ? (
                        <button
                          onClick={() => unapproveComment(comment.id)}
                          className={styles.unapproveBtn}
                          title="Unapprove"
                        >
                          <HiXMark size={18} />
                        </button>
                      ) : (
                        <button
                          onClick={() => approveComment(comment.id)}
                          className={styles.approveBtn}
                          title="Approve"
                        >
                          <HiCheck size={18} />
                        </button>
                      )}
                      <button
                        onClick={() => window.open(`/blogs/${comment.blogs?.slug}`, '_blank')}
                        className={styles.viewBtn}
                        title="View blog post"
                      >
                        <HiEye size={18} />
                      </button>
                      <button
                        onClick={() => deleteComment(comment.id)}
                        className={styles.deleteBtn}
                        title="Delete"
                      >
                        <HiTrash size={18} />
                      </button>
                    </div>
                  </div>

                  <p className={styles.content}>{displayContent}</p>

                  {isLongComment && (
                    <button
                      onClick={() => toggleExpandComment(comment.id)}
                      className={styles.expandBtn}
                    >
                      {isExpanded ? (
                        <>
                          <HiChevronUp size={16} />
                          Show Less
                        </>
                      ) : (
                        <>
                          <HiChevronDown size={16} />
                          Show More
                        </>
                      )}
                    </button>
                  )}

                  <div className={styles.blogLink}>
                    On: <strong>{comment.blogs?.title}</strong>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        confirmText={confirmDialog.confirmText}
        onConfirm={handleConfirm}
        onCancel={closeConfirm}
        variant={confirmDialog.variant}
        loading={confirmDialog.loading}
      />
    </div>
  );
}