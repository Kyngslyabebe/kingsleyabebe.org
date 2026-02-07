'use client';
export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { HiCalendar, HiClock, HiTag, HiArrowRight, HiMagnifyingGlass } from 'react-icons/hi2';
import { analytics } from '@/lib/analytics/events';
import FloatingBackButton from '@/components/blog/FloatingBackButton';
import styles from './blogs.module.css';

interface Blog {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  featured_image: string;
  published_at: string;
  reading_time: number;
  author: string;
  categories: { name: string; color: string; slug?: string }[];
  tags: { name: string }[];
}

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

export default function BlogsPage() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [filteredBlogs, setFilteredBlogs] = useState<Blog[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBlogs();
    loadCategories();
  }, []);

  useEffect(() => {
    filterBlogs();
  }, [selectedCategory, searchQuery, blogs]);

  async function loadBlogs() {
    try {
      const { data: blogsData, error } = await supabase
        .from('blogs')
        .select(`
          *,
          blog_category_relations(
            blog_categories(name, color, slug)
          ),
          blog_tag_relations(
            blog_tags(name)
          )
        `)
        .eq('published', true)
        .order('published_at', { ascending: false });

      if (error) throw error;

      const formattedBlogs = blogsData?.map(blog => ({
        ...blog,
        categories: blog.blog_category_relations?.map((rel: any) => rel.blog_categories) || [],
        tags: blog.blog_tag_relations?.map((rel: any) => rel.blog_tags) || []
      })) || [];

      setBlogs(formattedBlogs);
      setFilteredBlogs(formattedBlogs);
    } catch (error) {
      console.error('Error loading blogs:', error);
    } finally {
      setLoading(false);
    }
  }

  async function loadCategories() {
    const { data } = await supabase
      .from('blog_categories')
      .select('*')
      .order('name');
    
    setCategories(data || []);
  }

  function filterBlogs() {
    let filtered = blogs;

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(blog =>
        blog.categories.some(cat => cat.name === selectedCategory)
      );
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

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  }

  function handleCategoryClick(categoryName: string) {
    setSelectedCategory(categoryName);
    analytics.navClick(`blog-category-${categoryName}`);
  }

  function handleBlogClick(slug: string) {
    analytics.navClick(`blog-${slug}`);
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
    <div className={styles.container}>
      {/* Hero Section */}
      <motion.section
        className={styles.hero}
        initial="hidden"
        animate="visible"
        variants={fadeInUp}
      >
        <motion.h1 className={styles.heroTitle} variants={fadeInUp}>
          Blog & Insights
        </motion.h1>
        <motion.p className={styles.heroSubtitle} variants={fadeInUp} transition={{ delay: 0.2 }}>
          Thoughts on web development, SaaS, and building products
        </motion.p>
      </motion.section>

      {/* Search & Filter */}
      <motion.section
        className={styles.controls}
        initial="hidden"
        animate="visible"
        variants={fadeInUp}
        transition={{ delay: 0.3 }}
      >
        <div className={styles.searchBox}>
          <HiMagnifyingGlass size={20} />
          <input
            type="text"
            placeholder="Search articles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className={styles.categoryFilters}>
          <button
            onClick={() => handleCategoryClick('all')}
            className={`${styles.categoryBtn} ${selectedCategory === 'all' ? styles.active : ''}`}
          >
            All Posts
          </button>
          {categories.map(category => (
            <button
              key={category.id}
              onClick={() => handleCategoryClick(category.name)}
              className={`${styles.categoryBtn} ${selectedCategory === category.name ? styles.active : ''}`}
              style={{ '--category-color': category.color } as any}
            >
              {category.name}
            </button>
          ))}
        </div>
      </motion.section>

      {/* Blog Grid */}
      {filteredBlogs.length === 0 ? (
        <div className={styles.emptyState}>
          <p>No articles found{searchQuery && ` for "${searchQuery}"`}</p>
        </div>
      ) : (
        <motion.div
          className={styles.blogGrid}
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
        >
          {filteredBlogs.map((blog, index) => (
            <motion.article
              key={blog.id}
              className={styles.blogCard}
              variants={fadeInUp}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -8 }}
            >
              <Link href={`/blogs/${blog.slug}`} onClick={() => handleBlogClick(blog.slug)}>
                {blog.featured_image && (
                  <div className={styles.cardImage}>
                    <img src={blog.featured_image} alt={blog.title} />
                  </div>
                )}

                <div className={styles.cardContent}>
                  {blog.categories.length > 0 && (
                    <div className={styles.cardCategories}>
                      {blog.categories.map((cat, i) => (
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

                  <h2 className={styles.cardTitle}>{blog.title}</h2>
                  
                  {blog.excerpt && (
                    <p className={styles.cardExcerpt}>{blog.excerpt}</p>
                  )}

                  <div className={styles.cardMeta}>
                    <span className={styles.metaItem}>
                      <HiCalendar size={16} />
                      {formatDate(blog.published_at)}
                    </span>
                    {blog.reading_time && (
                      <span className={styles.metaItem}>
                        <HiClock size={16} />
                        {blog.reading_time} min read
                      </span>
                    )}
                  </div>

                  {blog.tags.length > 0 && (
                    <div className={styles.cardTags}>
                      {blog.tags.slice(0, 3).map((tag, i) => (
                        <span key={i} className={styles.tag}>
                          <HiTag size={12} />
                          {tag.name}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className={styles.cardFooter}>
                    <span className={styles.readMore}>
                      Read Article <HiArrowRight size={16} />
                    </span>
                  </div>
                </div>
              </Link>
            </motion.article>
          ))}
        </motion.div>
      )}

      <FloatingBackButton backTo="/" />
    </div>
  );
}