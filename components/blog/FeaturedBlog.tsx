'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { HiCalendar, HiClock, HiArrowRight } from 'react-icons/hi2';
import styles from './FeaturedBlog.module.css';

interface FeaturedBlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  featured_image: string;
  published_at: string;
  reading_time: number;
  categories: { name: string; color: string }[];
}

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 }
};

export default function FeaturedBlog() {
  const [featuredPost, setFeaturedPost] = useState<FeaturedBlogPost | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFeaturedBlog();
  }, []);

  async function loadFeaturedBlog() {
    try {
      const { data, error } = await supabase
        .from('blogs')
        .select(`
          *,
          blog_category_relations(
            blog_categories(name, color)
          )
        `)
        .eq('published', true)
        .eq('is_featured', true)
        .order('published_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        const formattedPost = {
          ...data,
          categories: data.blog_category_relations?.map((rel: any) => rel.blog_categories) || []
        };
        setFeaturedPost(formattedPost);
      }
    } catch (error) {
      console.error('Error loading featured blog:', error);
    } finally {
      setLoading(false);
    }
  }

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  }

  // Don't render anything while loading or if no featured post exists
  if (loading) {
    return null;
  }

  if (!featuredPost) {
    return null;
  }

  return (
    <motion.div
      className={styles.featuredCard}
      variants={fadeInUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      whileHover={{ y: -8 }}
    >
      <Link href={`/blogs/${featuredPost.slug}`} className={styles.cardLink}>
        <div className={styles.cardGrid}>
          {/* Image Side */}
          <div className={styles.imageSection}>
            {featuredPost.featured_image && (
              <img 
                src={featuredPost.featured_image} 
                alt={featuredPost.title}
                className={styles.image}
              />
            )}
            {featuredPost.categories.length > 0 && (
              <div className={styles.categories}>
                {featuredPost.categories.map((cat, i) => (
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
          </div>

          {/* Content Side */}
          <div className={styles.contentSection}>
            <div className={styles.featuredLabel}>
              <span>⭐ Featured Article</span>
            </div>
            
            <h3 className={styles.title}>{featuredPost.title}</h3>
            
            {featuredPost.excerpt && (
              <p className={styles.excerpt}>{featuredPost.excerpt}</p>
            )}

            <div className={styles.meta}>
              <span className={styles.metaItem}>
                <HiCalendar size={16} />
                {formatDate(featuredPost.published_at)}
              </span>
              {featuredPost.reading_time && (
                <span className={styles.metaItem}>
                  <HiClock size={16} />
                  {featuredPost.reading_time} min read
                </span>
              )}
            </div>

            <div className={styles.readMore}>
              <span>Read Full Article</span>
              <HiArrowRight size={20} />
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}