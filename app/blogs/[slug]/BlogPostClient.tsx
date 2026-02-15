'use client';
export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { 
  HiCalendar, 
  HiClock, 
  HiTag, 
  HiArrowLeft,
  HiShare,
  HiEye
} from 'react-icons/hi2';
import { FaTwitter, FaLinkedin, FaFacebook } from 'react-icons/fa';
import { analytics } from '@/lib/analytics/events';
import FloatingBackButton from '@/components/blog/FloatingBackButton';
import LikeButton from '@/components/blog/LikeButton';
import Comments from '@/components/blog/Comments';
import styles from './post.module.css';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  author: string;
  featured_image: string;
  published_at: string;
  reading_time: number;
  views: number;
  categories: { name: string; color: string }[];
  tags: { name: string; slug: string }[];
}

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 }
};

interface Props {
  slug: string;
}

export default function BlogPostClient({ slug }: Props) {
  const router = useRouter();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (slug) {
      loadPost();
    }
  }, [slug]);

  async function loadPost() {
    try {
      // Fetch blog post
      const { data: postData, error } = await supabase
        .from('blogs')
        .select(`
          *,
          blog_category_relations(
            blog_categories(name, color)
          ),
          blog_tag_relations(
            blog_tags(name, slug)
          )
        `)
        .eq('slug', slug)
        .eq('published', true)
        .single();

      if (error) throw error;

      if (!postData) {
        router.push('/blogs');
        return;
      }

      const formattedPost = {
        ...postData,
        categories: postData.blog_category_relations?.map((rel: any) => rel.blog_categories) || [],
        tags: postData.blog_tag_relations?.map((rel: any) => rel.blog_tags) || []
      };

      setPost(formattedPost);

      // Track page view
      analytics.navClick(`blog-post-${slug}`);

      // Increment view count
      await supabase
        .from('blogs')
        .update({ views: (postData.views || 0) + 1 })
        .eq('id', postData.id);

      // Load related posts
      if (formattedPost.categories.length > 0) {
        const { data: related } = await supabase
          .from('blogs')
          .select('id, title, slug, excerpt, featured_image, published_at, reading_time')
          .neq('id', postData.id)
          .eq('published', true)
          .limit(3);

        setRelatedPosts(related || []);
      }
    } catch (error) {
      console.error('Error loading post:', error);
      router.push('/blogs');
    } finally {
      setLoading(false);
    }
  }

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  }

  function shareOnTwitter() {
    const url = window.location.href;
    const text = post?.title || '';
    window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`, '_blank');
    analytics.navClick('share-twitter');
  }

  function shareOnLinkedIn() {
    const url = window.location.href;
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, '_blank');
    analytics.navClick('share-linkedin');
  }

  function shareOnFacebook() {
    const url = window.location.href;
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
    analytics.navClick('share-facebook');
  }

  function copyLink() {
    navigator.clipboard.writeText(window.location.href);
    alert('Link copied to clipboard!');
    analytics.navClick('share-copy-link');
  }

  function handleRelatedClick(relatedSlug: string) {
    analytics.navClick(`related-blog-${relatedSlug}`);
  }

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner} />
        <p>Loading article...</p>
      </div>
    );
  }

  if (!post) {
    return null;
  }

  return (
    <div className={styles.container}>
      {/* Back Button */}
      <motion.div
        className={styles.backButton}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
      >
      </motion.div>

      {/* Article Header */}
      <motion.header
        className={styles.header}
        initial="hidden"
        animate="visible"
        variants={fadeInUp}
      >
        {post.categories.length > 0 && (
          <div className={styles.categories}>
            {post.categories.map((cat, i) => (
              <span
                key={i}
                className={styles.categoryBadge}
                style={{ backgroundColor: cat.color }}
              >
                {cat.name}
              </span>
            ))}
          </div>
        )}

        <h1 className={styles.title}>{post.title}</h1>

        <div className={styles.meta}>
          <div className={styles.metaLeft}>
            <span className={styles.metaItem}>
              <HiCalendar size={18} />
              {formatDate(post.published_at)}
            </span>
            {post.reading_time && (
              <span className={styles.metaItem}>
                <HiClock size={18} />
                {post.reading_time} min read
              </span>
            )}
            <span className={styles.metaItem}>
              <HiEye size={18} />
              {post.views || 0} views
            </span>
          </div>

          <div className={styles.shareButtons}>
            <button onClick={shareOnTwitter} className={styles.shareBtn} title="Share on Twitter">
              <FaTwitter size={18} />
            </button>
            <button onClick={shareOnLinkedIn} className={styles.shareBtn} title="Share on LinkedIn">
              <FaLinkedin size={18} />
            </button>
            <button onClick={shareOnFacebook} className={styles.shareBtn} title="Share on Facebook">
              <FaFacebook size={18} />
            </button>
            <button onClick={copyLink} className={styles.shareBtn} title="Copy link">
              <HiShare size={18} />
            </button>
          </div>
        </div>
      </motion.header>

      {/* Featured Image */}
      {post.featured_image && (
        <motion.div
          className={styles.featuredImage}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <img src={post.featured_image} alt={post.title} />
        </motion.div>
      )}

      {/* Article Content */}
      <motion.article
        className={styles.content}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        dangerouslySetInnerHTML={{ __html: post.content }}
      />

      {/* Tags */}
      {post.tags.length > 0 && (
        <motion.div
          className={styles.tags}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <h3>Tags</h3>
          <div className={styles.tagList}>
            {post.tags.map((tag, i) => (
              <span key={i} className={styles.tag}>
                <HiTag size={14} />
                {tag.name}
              </span>
            ))}
          </div>
        </motion.div>
      )}

      {/* Author */}
      <motion.div
        className={styles.author}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <div className={styles.authorAvatar}>
          {post.author.charAt(0)}
        </div>
        <div>
          <h4>Written by {post.author}</h4>
          <p>Full-Stack Software Engineer</p>
        </div>
      </motion.div>

      {/* Related Posts */}
      {relatedPosts.length > 0 && (
        <motion.section
          className={styles.related}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <h2>Related Articles</h2>
          <div className={styles.relatedGrid}>
            {relatedPosts.map(related => (
              <Link 
                key={related.id} 
                href={`/blogs/${related.slug}`} 
                className={styles.relatedCard}
                onClick={() => handleRelatedClick(related.slug)}
              >
                {related.featured_image && (
                  <div className={styles.relatedImage}>
                    <img src={related.featured_image} alt={related.title} />
                  </div>
                )}
                <div className={styles.relatedContent}>
                  <h3>{related.title}</h3>
                  {related.excerpt && <p>{related.excerpt}</p>}
                  <div className={styles.relatedMeta}>
                    <span>{formatDate(related.published_at)}</span>
                    {related.reading_time && <span>• {related.reading_time} min</span>}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </motion.section>
      )}

      {/* Like and Comments */}
<div style={{ marginTop: '60px' }}>
  <LikeButton blogId={post.id} initialLikes={post.likes_count || 0} />
  <Comments blogId={post.id} />
</div>

    <FloatingBackButton backTo="/blogs" />
    </div>
  );
}