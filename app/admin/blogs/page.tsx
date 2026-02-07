'use client';
export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useToast } from '@/components/admin/Toast';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  HiPlus, 
  HiPencil, 
  HiTrash, 
  HiEye,
  HiEyeSlash,
  HiMagnifyingGlass,
  HiStar,
  HiCalendar
} from 'react-icons/hi2';
import styles from './blogs.module.css';

interface Blog {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  published: boolean;
  is_featured: boolean;
  published_at: string;
  views: number;
  created_at: string;
}

export default function AdminBlogsPage() {
  const { showToast } = useToast();
  const router = useRouter();
  
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [filteredBlogs, setFilteredBlogs] = useState<Blog[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'published' | 'draft'>('all');
  const [loading, setLoading] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    loadBlogs();
  }, []);

  useEffect(() => {
    filterBlogs();
  }, [searchQuery, filterStatus, blogs]);

  async function loadBlogs() {
    try {
      const { data, error } = await supabase
        .from('blogs')
        .select('id, title, slug, excerpt, published, is_featured, published_at, views, created_at')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBlogs(data || []);
    } catch (error: any) {
      showToast(error.message || 'Error loading blogs', 'error');
    } finally {
      setLoading(false);
    }
  }

  function filterBlogs() {
    let filtered = [...blogs];

    // Filter by status
    if (filterStatus === 'published') {
      filtered = filtered.filter(blog => blog.published);
    } else if (filterStatus === 'draft') {
      filtered = filtered.filter(blog => !blog.published);
    }

    // Filter by search
    if (searchQuery) {
      filtered = filtered.filter(blog =>
        blog.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        blog.excerpt?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredBlogs(filtered);
  }

 async function handleDelete(id: string, title: string) {
  if (deleteConfirm !== id) {
    setDeleteConfirm(id);
    showToast('Click delete again to confirm', 'warning');
    setTimeout(() => setDeleteConfirm(null), 3000);
    return;
  }

  try {
    // Delete category relations first
    await supabase
      .from('blog_category_relations')
      .delete()
      .eq('blog_id', id);

    // Delete tag relations
    await supabase
      .from('blog_tag_relations')
      .delete()
      .eq('blog_id', id);

    // Delete the blog
    const { error } = await supabase
      .from('blogs')
      .delete()
      .eq('id', id);

    if (error) throw error;

    showToast(`"${title}" deleted successfully`, 'success');
    setBlogs(blogs.filter(blog => blog.id !== id));
    setDeleteConfirm(null);
  } catch (error: any) {
    showToast(error.message || 'Error deleting blog', 'error');
  }
}

  async function toggleFeatured(id: string, currentStatus: boolean) {
    try {
      // If setting as featured, unfeatured all others first
      if (!currentStatus) {
        await supabase
          .from('blogs')
          .update({ is_featured: false })
          .neq('id', id);
      }

      const { error } = await supabase
        .from('blogs')
        .update({ is_featured: !currentStatus })
        .eq('id', id);

      if (error) throw error;

      showToast(
        !currentStatus ? 'Set as featured blog' : 'Removed from featured',
        'success'
      );
      loadBlogs();
    } catch (error: any) {
      showToast(error.message || 'Error updating blog', 'error');
    }
  }

  async function togglePublished(id: string, currentStatus: boolean) {
    try {
      const updateData: any = { published: !currentStatus };
      
      // Set published_at when publishing
      if (!currentStatus) {
        updateData.published_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('blogs')
        .update(updateData)
        .eq('id', id);

      if (error) throw error;

      showToast(
        !currentStatus ? 'Blog published successfully' : 'Blog unpublished',
        'success'
      );
      loadBlogs();
    } catch (error: any) {
      showToast(error.message || 'Error updating blog', 'error');
    }
  }

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  }

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner} />
        <p>Loading blogs...</p>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Blog Posts</h1>
          <p className={styles.subtitle}>
            {blogs.length} total • {blogs.filter(b => b.published).length} published • {blogs.filter(b => !b.published).length} drafts
          </p>
        </div>
        <Link href="/admin/blogs/create" className={styles.createBtn}>
          <HiPlus size={20} />
          <span>New Blog Post</span>
        </Link>
      </div>

      {/* Filters */}
      <div className={styles.controls}>
        <div className={styles.searchBox}>
          <HiMagnifyingGlass size={20} />
          <input
            type="text"
            placeholder="Search blogs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className={styles.filterButtons}>
          <button
            onClick={() => setFilterStatus('all')}
            className={`${styles.filterBtn} ${filterStatus === 'all' ? styles.active : ''}`}
          >
            All ({blogs.length})
          </button>
          <button
            onClick={() => setFilterStatus('published')}
            className={`${styles.filterBtn} ${filterStatus === 'published' ? styles.active : ''}`}
          >
            Published ({blogs.filter(b => b.published).length})
          </button>
          <button
            onClick={() => setFilterStatus('draft')}
            className={`${styles.filterBtn} ${filterStatus === 'draft' ? styles.active : ''}`}
          >
            Drafts ({blogs.filter(b => !b.published).length})
          </button>
        </div>
      </div>

      {/* Blog List */}
      {filteredBlogs.length === 0 ? (
        <div className={styles.empty}>
          <p>No blog posts found</p>
          <Link href="/admin/blogs/create" className={styles.emptyBtn}>
            Create Your First Blog Post
          </Link>
        </div>
      ) : (
        <div className={styles.blogList}>
          {filteredBlogs.map(blog => (
            <div key={blog.id} className={styles.blogCard}>
              <div className={styles.blogContent}>
                <div className={styles.blogHeader}>
                  <h3 className={styles.blogTitle}>{blog.title}</h3>
                  <div className={styles.badges}>
                    {blog.is_featured && (
                      <span className={styles.featuredBadge}>
                        <HiStar size={14} />
                        Featured
                      </span>
                    )}
                    <span className={`${styles.statusBadge} ${blog.published ? styles.published : styles.draft}`}>
                      {blog.published ? 'Published' : 'Draft'}
                    </span>
                  </div>
                </div>

                {blog.excerpt && (
                  <p className={styles.blogExcerpt}>{blog.excerpt}</p>
                )}

                <div className={styles.blogMeta}>
                  <span>
                    <HiCalendar size={16} />
                    {formatDate(blog.published_at || blog.created_at)}
                  </span>
                  <span>
                    <HiEye size={16} />
                    {blog.views || 0} views
                  </span>
                  <span className={styles.slug}>/{blog.slug}</span>
                </div>
              </div>

              <div className={styles.blogActions}>
                <button
                  onClick={() => router.push(`/admin/blogs/${blog.id}`)}
                  className={styles.actionBtn}
                  title="Edit"
                >
                  <HiPencil size={18} />
                </button>

                <button
                  onClick={() => toggleFeatured(blog.id, blog.is_featured)}
                  className={`${styles.actionBtn} ${blog.is_featured ? styles.featured : ''}`}
                  title={blog.is_featured ? 'Remove from featured' : 'Set as featured'}
                >
                  <HiStar size={18} />
                </button>

                <button
                  onClick={() => togglePublished(blog.id, blog.published)}
                  className={styles.actionBtn}
                  title={blog.published ? 'Unpublish' : 'Publish'}
                >
                  {blog.published ? <HiEyeSlash size={18} /> : <HiEye size={18} />}
                </button>

                <button
  onClick={(e) => {
    e.stopPropagation();
    handleDelete(blog.id, blog.title);
  }}
  className={`${styles.actionBtn} ${styles.delete} ${deleteConfirm === blog.id ? styles.confirm : ''}`}
  title={deleteConfirm === blog.id ? 'Click again to confirm delete' : 'Delete blog'}
>
  <HiTrash size={18} />
</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}