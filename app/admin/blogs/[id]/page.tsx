'use client';
export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useToast } from '@/components/admin/Toast';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import {
  HiArrowLeft,
  HiCheck,
  HiPhoto,
  HiXMark,
  HiPlus,
  HiTrash
} from 'react-icons/hi2';

import styles from '../create/create.module.css';
import ConfirmDialog from '@/components/admin/ConfirmDialog';


import RichTextEditor from '@/components/admin/RichTextEditor';

interface Category {
  id: string;
  name: string;
  slug: string;
  color: string;
}

interface Tag {
  id: string;
  name: string;
  slug: string;
}

export default function EditBlogPage() {
  const { showToast } = useToast();
  const router = useRouter();
  const params = useParams();
  const blogId = params?.id as string;

  // Form state
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [author, setAuthor] = useState('Kingsley Abebe');
  const [featuredImage, setFeaturedImage] = useState('');
  const [published, setPublished] = useState(false);
  const [isFeatured, setIsFeatured] = useState(false);
  const [readingTime, setReadingTime] = useState(5);
  
  // SEO state
  const [seoTitle, setSeoTitle] = useState('');
  const [seoDescription, setSeoDescription] = useState('');
  const [seoKeywords, setSeoKeywords] = useState('');

  // Categories and tags
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  // New category/tag
  const [newCategory, setNewCategory] = useState('');
  const [newCategoryColor, setNewCategoryColor] = useState('#4A90E2');
  const [newTag, setNewTag] = useState('');

  // UI state
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [showTagForm, setShowTagForm] = useState(false);

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

  async function handleDeleteTag(tag: Tag) {
    openConfirm({
      title: 'Delete Tag',
      message: `Delete "#${tag.name}"? It will be removed from all blog posts.`,
      confirmText: 'Delete',
      variant: 'danger',
      onConfirm: async () => {
        const { error } = await supabase
          .from('blog_tags')
          .delete()
          .eq('id', tag.id);

        if (error) {
          showToast(error.message || 'Error deleting tag', 'error');
        } else {
          setTags(prev => prev.filter(t => t.id !== tag.id));
          setSelectedTags(prev => prev.filter(id => id !== tag.id));
          showToast(`"#${tag.name}" deleted`, 'success');
        }
      },
    });
  }

  async function handleDeleteCategory(cat: Category) {
    openConfirm({
      title: 'Delete Category',
      message: `Delete "${cat.name}"? It will be removed from all blog posts.`,
      confirmText: 'Delete',
      variant: 'danger',
      onConfirm: async () => {
        const { error } = await supabase
          .from('blog_categories')
          .delete()
          .eq('id', cat.id);

        if (error) {
          showToast(error.message || 'Error deleting category', 'error');
        } else {
          setCategories(prev => prev.filter(c => c.id !== cat.id));
          setSelectedCategories(prev => prev.filter(id => id !== cat.id));
          showToast(`"${cat.name}" deleted`, 'success');
        }
      },
    });
  }

  useEffect(() => {
    loadBlog();
    loadCategories();
    loadTags();
  }, [blogId]);

  // Auto-calculate reading time
  useEffect(() => {
    const words = content.replace(/<[^>]*>/g, '').split(/\s+/).length;
    const minutes = Math.max(1, Math.ceil(words / 200));
    setReadingTime(minutes);
  }, [content]);

  async function loadBlog() {
    try {
      const { data: blog, error } = await supabase
        .from('blogs')
        .select(`
          *,
          blog_category_relations(category_id),
          blog_tag_relations(tag_id)
        `)
        .eq('id', blogId)
        .single();

      if (error) throw error;

      if (!blog) {
        showToast('Blog not found', 'error');
        router.push('/admin/blogs');
        return;
      }

      setTitle(blog.title);
      setSlug(blog.slug);
      setExcerpt(blog.excerpt || '');
      setContent(blog.content);
      setAuthor(blog.author || 'Kingsley Abebe');
      setFeaturedImage(blog.featured_image || '');
      setPublished(blog.published);
      setIsFeatured(blog.is_featured);
      setReadingTime(blog.reading_time || 5);
      setSeoTitle(blog.seo_title || '');
      setSeoDescription(blog.seo_description || '');
      setSeoKeywords(blog.seo_keywords || '');

      // Set selected categories and tags
      setSelectedCategories(blog.blog_category_relations?.map((rel: any) => rel.category_id) || []);
      setSelectedTags(blog.blog_tag_relations?.map((rel: any) => rel.tag_id) || []);

    } catch (error: any) {
      showToast(error.message || 'Error loading blog', 'error');
      router.push('/admin/blogs');
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

  async function loadTags() {
    const { data } = await supabase
      .from('blog_tags')
      .select('*')
      .order('name');
    setTags(data || []);
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('Please upload an image file', 'error');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showToast('Image size must be less than 5MB', 'error');
      return;
    }

    setUploading(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `blog-images/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('public-assets')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('public-assets')
        .getPublicUrl(filePath);

      setFeaturedImage(publicUrl);
      showToast('Image uploaded successfully', 'success');
    } catch (error: any) {
      showToast(error.message || 'Error uploading image', 'error');
    } finally {
      setUploading(false);
    }
  }

  async function handleAddCategory() {
    if (!newCategory.trim()) return;

    try {
      const categorySlug = newCategory
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');

      const { data, error } = await supabase
        .from('blog_categories')
        .insert({
          name: newCategory.trim(),
          slug: categorySlug,
          color: newCategoryColor
        })
        .select()
        .single();

      if (error) throw error;

      setCategories([...categories, data]);
      setSelectedCategories([...selectedCategories, data.id]);
      setNewCategory('');
      setNewCategoryColor('#4A90E2');
      setShowCategoryForm(false);
      showToast('Category created', 'success');
    } catch (error: any) {
      showToast(error.message || 'Error creating category', 'error');
    }
  }

  async function handleAddTag() {
    if (!newTag.trim()) return;

    try {
      const tagSlug = newTag
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');

      const { data, error } = await supabase
        .from('blog_tags')
        .insert({
          name: newTag.trim(),
          slug: tagSlug
        })
        .select()
        .single();

      if (error) throw error;

      setTags([...tags, data]);
      setSelectedTags([...selectedTags, data.id]);
      setNewTag('');
      setShowTagForm(false);
      showToast('Tag created', 'success');
    } catch (error: any) {
      showToast(error.message || 'Error creating tag', 'error');
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!title.trim()) {
      showToast('Title is required', 'error');
      return;
    }

    if (!slug.trim()) {
      showToast('Slug is required', 'error');
      return;
    }

    if (!content.trim()) {
      showToast('Content is required', 'error');
      return;
    }

    setSaving(true);

    try {
      // Update blog post
      const updateData: any = {
        title: title.trim(),
        slug: slug.trim(),
        excerpt: excerpt.trim() || null,
        content: content,
        author: author.trim(),
        featured_image: featuredImage || null,
        published: published,
        is_featured: isFeatured,
        reading_time: readingTime,
        seo_title: seoTitle.trim() || null,
        seo_description: seoDescription.trim() || null,
        seo_keywords: seoKeywords.trim() || null,
        updated_at: new Date().toISOString()
      };

      // Set published_at when first publishing
      if (published) {
        const { data: currentBlog } = await supabase
          .from('blogs')
          .select('published_at')
          .eq('id', blogId)
          .single();

        if (!currentBlog?.published_at) {
          updateData.published_at = new Date().toISOString();
        }
      }

      const { error: blogError } = await supabase
        .from('blogs')
        .update(updateData)
        .eq('id', blogId);

      if (blogError) throw blogError;

      // Delete existing category relations
      await supabase
        .from('blog_category_relations')
        .delete()
        .eq('blog_id', blogId);

      // Add new category relations
      if (selectedCategories.length > 0) {
        const categoryRelations = selectedCategories.map(catId => ({
          blog_id: blogId,
          category_id: catId
        }));

        const { error: catError } = await supabase
          .from('blog_category_relations')
          .insert(categoryRelations);

        if (catError) throw catError;
      }

      // Delete existing tag relations
      await supabase
        .from('blog_tag_relations')
        .delete()
        .eq('blog_id', blogId);

      // Add new tag relations
      if (selectedTags.length > 0) {
        const tagRelations = selectedTags.map(tagId => ({
          blog_id: blogId,
          tag_id: tagId
        }));

        const { error: tagError } = await supabase
          .from('blog_tag_relations')
          .insert(tagRelations);

        if (tagError) throw tagError;
      }

      showToast('Blog updated successfully!', 'success');
      router.push('/admin/blogs');
    } catch (error: any) {
      showToast(error.message || 'Error updating blog', 'error');
    } finally {
      setSaving(false);
    }
  }



  if (loading) {
    return (
      <div className={styles.page}>
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <div className={styles.spinner} />
          <p>Loading blog...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.header}>
        <Link href="/admin/blogs" className={styles.backBtn}>
          <HiArrowLeft size={20} />
          <span>Back to Blogs</span>
        </Link>
        <h1 className={styles.title}>Edit Blog Post</h1>
      </div>

      <form onSubmit={handleSubmit} className={styles.form}>
        {/* Same form structure as create page */}
        <div className={styles.formGrid}>
          {/* Main Content - identical to create page */}
          <div className={styles.mainContent}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Title *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter blog post title..."
                className={styles.input}
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Slug *</label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="blog-post-url"
                className={styles.input}
                required
              />
              <p className={styles.hint}>URL: /blogs/{slug || 'blog-post-url'}</p>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Excerpt</label>
              <textarea
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                placeholder="Brief summary of the blog post..."
                className={styles.textarea}
                rows={3}
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Content *</label>
             <RichTextEditor
  value={content}
  onChange={setContent}
  placeholder="Write your blog post content..."
/>
              <p className={styles.hint}>
                Estimated reading time: {readingTime} min
              </p>
            </div>

            <div className={styles.seoSection}>
              <h3 className={styles.sectionTitle}>SEO Settings</h3>

              <div className={styles.formGroup}>
                <label className={styles.label}>Meta Title</label>
                <input
                  type="text"
                  value={seoTitle}
                  onChange={(e) => setSeoTitle(e.target.value)}
                  placeholder="SEO title (defaults to blog title)"
                  className={styles.input}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Meta Description</label>
                <textarea
                  value={seoDescription}
                  onChange={(e) => setSeoDescription(e.target.value)}
                  placeholder="SEO description (defaults to excerpt)"
                  className={styles.textarea}
                  rows={2}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Keywords</label>
                <input
                  type="text"
                  value={seoKeywords}
                  onChange={(e) => setSeoKeywords(e.target.value)}
                  placeholder="keyword1, keyword2, keyword3"
                  className={styles.input}
                />
              </div>
            </div>
          </div>

          {/* Sidebar - identical to create page */}
          <div className={styles.sidebar}>
            <div className={styles.card}>
              <h3 className={styles.cardTitle}>Publish Settings</h3>

              <div className={styles.formGroup}>
                <label className={styles.label}>Author</label>
                <input
                  type="text"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  className={styles.input}
                />
              </div>

              <div className={styles.toggleGroup}>
                <label className={styles.toggleLabel}>
                  <input
                    type="checkbox"
                    checked={published}
                    onChange={(e) => setPublished(e.target.checked)}
                    className={styles.checkbox}
                  />
                  <span>Publish immediately</span>
                </label>

                <label className={styles.toggleLabel}>
                  <input
                    type="checkbox"
                    checked={isFeatured}
                    onChange={(e) => setIsFeatured(e.target.checked)}
                    className={styles.checkbox}
                  />
                  <span>Feature on homepage</span>
                </label>
              </div>
            </div>

          <div className={styles.card}>
  <h3 className={styles.cardTitle}>Featured Image</h3>

  {featuredImage ? (
    <div className={styles.imagePreview}>
      <img src={featuredImage} alt="Featured" />
      <button
        type="button"
        onClick={() => setFeaturedImage('')}
        className={styles.removeImage}
      >
        <HiXMark size={20} />
      </button>
    </div>
  ) : (
    <>
      <label className={styles.uploadBtn}>
        <input
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className={styles.fileInput}
          disabled={uploading}
        />
        <HiPhoto size={24} />
        <span>{uploading ? 'Uploading...' : 'Upload Image'}</span>
      </label>

      <div className={styles.divider}>
        <span>OR</span>
      </div>

      <div className={styles.formGroup}>
        <input
          type="url"
          value={featuredImage}
          onChange={(e) => setFeaturedImage(e.target.value)}
          placeholder="Paste image URL (https://...)"
          className={styles.input}
        />
      </div>
    </>
  )}
</div>

            <div className={styles.card}>
              <h3 className={styles.cardTitle}>Categories</h3>

              <div className={styles.checkboxList}>
                {categories.map(cat => (
                  <div key={cat.id} className={styles.categoryRow}>
                    <label className={styles.checkboxLabel}>
                      <input
                        type="checkbox"
                        checked={selectedCategories.includes(cat.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedCategories([...selectedCategories, cat.id]);
                          } else {
                            setSelectedCategories(selectedCategories.filter(id => id !== cat.id));
                          }
                        }}
                        className={styles.checkbox}
                      />
                      <span className={styles.categoryDot} ref={el => { if (el) el.style.setProperty('--dot-bg', cat.color); }} />
                      <span>{cat.name}</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => handleDeleteCategory(cat)}
                      className={styles.deleteCategoryBtn}
                      title={`Delete ${cat.name}`}
                    >
                      <HiTrash size={13} />
                    </button>
                  </div>
                ))}
              </div>

              {showCategoryForm ? (
                <div className={styles.addForm}>
                  <input
                    type="text"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    placeholder="Category name"
                    className={styles.input}
                  />
                  <input
                    type="color"
                    value={newCategoryColor}
                    onChange={(e) => setNewCategoryColor(e.target.value)}
                    className={styles.colorPicker}
                  />
                  <div className={styles.addFormButtons}>
                    <button
                      type="button"
                      onClick={handleAddCategory}
                      className={styles.addBtn}
                    >
                      <HiCheck size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowCategoryForm(false);
                        setNewCategory('');
                      }}
                      className={styles.cancelBtn}
                    >
                      <HiXMark size={16} />
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowCategoryForm(true)}
                  className={styles.newBtn}
                >
                  <HiPlus size={16} />
                  <span>New Category</span>
                </button>
              )}
            </div>

            <div className={styles.card}>
              <h3 className={styles.cardTitle}>Tags</h3>

              <div className={styles.checkboxList}>
                {tags.map(tag => (
                  <div key={tag.id} className={styles.categoryRow}>
                    <label className={styles.checkboxLabel}>
                      <input
                        type="checkbox"
                        checked={selectedTags.includes(tag.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedTags([...selectedTags, tag.id]);
                          } else {
                            setSelectedTags(selectedTags.filter(id => id !== tag.id));
                          }
                        }}
                        className={styles.checkbox}
                      />
                      <span>{tag.name}</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => handleDeleteTag(tag)}
                      className={styles.deleteCategoryBtn}
                      title={`Delete ${tag.name}`}
                    >
                      <HiTrash size={13} />
                    </button>
                  </div>
                ))}
              </div>

              {showTagForm ? (
                <div className={styles.addForm}>
                  <input
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="Tag name"
                    className={styles.input}
                  />
                  <div className={styles.addFormButtons}>
                    <button
                      type="button"
                      onClick={handleAddTag}
                      className={styles.addBtn}
                    >
                      <HiCheck size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowTagForm(false);
                        setNewTag('');
                      }}
                      className={styles.cancelBtn}
                    >
                      <HiXMark size={16} />
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowTagForm(true)}
                  className={styles.newBtn}
                >
                  <HiPlus size={16} />
                  <span>New Tag</span>
                </button>
              )}
            </div>
          </div>
        </div>

        <div className={styles.footer}>
          <button
            type="submit"
            disabled={saving}
            className={styles.submitBtn}
          >
            {saving ? 'Saving...' : 'Update Blog'}
          </button>
        </div>
      </form>

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