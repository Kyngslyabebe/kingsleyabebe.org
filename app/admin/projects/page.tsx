'use client';
export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useToast } from '@/components/admin/Toast';
import ConfirmDialog from '@/components/admin/ConfirmDialog';
import { FileUpload } from '@/components/admin/FileUpload';
import { 
  HiPlus, 
  HiPencil, 
  HiTrash, 
  HiXMark,
  HiPhoto,
  HiEye,
  HiEyeSlash,
  HiMagnifyingGlass
} from 'react-icons/hi2';
import styles from './projects.module.css';

interface Project {
  id: string;
  title: string;
  description: string;
  long_description: string;
  category: string;
  status: string;
  year: string;
  image: string;
  demo: string;
  github: string;
  tags: string[];
  features: string[];
  visible: boolean;
}

export default function ProjectsPage() {
  const { showToast } = useToast();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    long_description: '',
    category: 'Web Development',
    status: 'Active',
    year: new Date().getFullYear().toString(),
    image: '',
    demo: '',
    github: '',
    tags: '',
    features: '',
    visible: true
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadProjects();
  }, []);

  async function loadProjects() {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProjects(data || []);
    } catch (error: any) {
      console.error('Error loading projects:', error);
      showToast('Error loading projects', 'error');
    } finally {
      setLoading(false);
    }
  }

  function openModal(project?: Project) {
    if (project) {
      setEditingProject(project);
      setFormData({
        title: project.title,
        description: project.description || '',
        long_description: project.long_description || '',
        category: project.category || 'Web Development',
        status: project.status || 'Active',
        year: project.year || new Date().getFullYear().toString(),
        image: project.image || '',
        demo: project.demo || '',
        github: project.github || '',
        tags: project.tags?.join(', ') || '',
        features: project.features?.join('\n') || '',
        visible: project.visible !== false
      });
    } else {
      setEditingProject(null);
      setFormData({
        title: '',
        description: '',
        long_description: '',
        category: 'Web Development',
        status: 'Active',
        year: new Date().getFullYear().toString(),
        image: '',
        demo: '',
        github: '',
        tags: '',
        features: '',
        visible: true
      });
    }
    setShowModal(true);
  }

  function closeModal() {
    setShowModal(false);
    setTimeout(() => {
      setEditingProject(null);
    }, 300);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    if (!formData.title || !formData.description) {
      showToast('Please fill in required fields', 'warning');
      return;
    }

    setSaving(true);

    try {
      const projectData = {
        title: formData.title,
        description: formData.description,
        long_description: formData.long_description,
        category: formData.category,
        status: formData.status,
        year: formData.year,
        image: formData.image,
        demo: formData.demo,
        github: formData.github,
        tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
        features: formData.features.split('\n').map(f => f.trim()).filter(Boolean),
        visible: formData.visible
      };

      if (editingProject) {
        const { error } = await supabase
          .from('projects')
          .update(projectData)
          .eq('id', editingProject.id);

        if (error) throw error;
        showToast('Project updated successfully!', 'success');
      } else {
        const { error } = await supabase
          .from('projects')
          .insert([projectData]);

        if (error) throw error;
        showToast('Project created successfully!', 'success');
      }

      closeModal();
      loadProjects();
    } catch (error: any) {
      console.error('Error saving project:', error);
      showToast(error.message || 'Error saving project', 'error');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleteId) return;

    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', deleteId);

      if (error) throw error;
      showToast('Project deleted successfully!', 'success');
      loadProjects();
    } catch (error: any) {
      console.error('Error deleting project:', error);
      showToast(error.message || 'Error deleting project', 'error');
    } finally {
      setDeleteId(null);
    }
  }

  async function toggleVisibility(id: string, currentVisibility: boolean) {
    try {
      const { error } = await supabase
        .from('projects')
        .update({ visible: !currentVisibility })
        .eq('id', id);

      if (error) throw error;
      showToast(`Project ${!currentVisibility ? 'shown' : 'hidden'}!`, 'success');
      loadProjects();
    } catch (error: any) {
      console.error('Error toggling visibility:', error);
      showToast('Error updating project', 'error');
    }
  }

  const filteredProjects = projects.filter(project =>
    project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) {
    return (
      <div className={styles.loadingState}>
        <div className={styles.spinner} />
        <p>Loading projects...</p>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Projects</h1>
          <p className={styles.pageSubtitle}>Manage your portfolio projects</p>
        </div>
        <button onClick={() => openModal()} className={styles.addBtn}>
          <HiPlus size={18} />
          <span>Add Project</span>
        </button>
      </div>

      <div className={styles.searchBar}>
        <HiMagnifyingGlass size={20} />
        <input
          type="text"
          placeholder="Search projects..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={styles.searchInput}
        />
      </div>

      {filteredProjects.length === 0 ? (
        <div className={styles.emptyState}>
          <HiPhoto size={48} />
          <h3>No projects found</h3>
          <p>Create your first project to get started</p>
          <button onClick={() => openModal()} className={styles.addBtn}>
            <HiPlus size={18} />
            <span>Add Project</span>
          </button>
        </div>
      ) : (
        <div className={styles.grid}>
          {filteredProjects.map((project) => (
            <div key={project.id} className={styles.card}>
              {project.image && (
                <div className={styles.projectImage}>
                  <img src={project.image} alt={project.title} />
                  {project.visible === false && (
                    <div className={styles.hiddenBadge}>
                      <HiEyeSlash size={14} />
                      <span>Hidden</span>
                    </div>
                  )}
                </div>
              )}
              <div className={styles.cardContent}>
                <div className={styles.cardHeader}>
                  <div>
                    <span className={styles.category}>{project.category}</span>
                    <h3 className={styles.cardTitle}>{project.title}</h3>
                  </div>
                  <div className={styles.cardActions}>
                    <button 
                      onClick={() => toggleVisibility(project.id, project.visible !== false)}
                      className={styles.iconBtn}
                      title={project.visible !== false ? 'Hide' : 'Show'}
                    >
                      {project.visible !== false ? <HiEye size={16} /> : <HiEyeSlash size={16} />}
                    </button>
                    <button 
                      onClick={() => openModal(project)}
                      className={styles.editBtn}
                      title="Edit"
                    >
                      <HiPencil size={16} />
                    </button>
                    <button 
                      onClick={() => setDeleteId(project.id)}
                      className={styles.deleteBtn}
                      title="Delete"
                    >
                      <HiTrash size={16} />
                    </button>
                  </div>
                </div>
                <p className={styles.description}>{project.description}</p>
                <div className={styles.meta}>
                  <span className={styles.status}>{project.status}</span>
                  <span className={styles.year}>{project.year}</span>
                </div>
                {project.tags && project.tags.length > 0 && (
                  <div className={styles.tags}>
                    {project.tags.slice(0, 3).map((tag, idx) => (
                      <span key={idx} className={styles.tag}>{tag}</span>
                    ))}
                    {project.tags.length > 3 && (
                      <span className={styles.tag}>+{project.tags.length - 3}</span>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className={`${styles.modal} ${showModal ? styles.modalOpen : ''}`} onClick={closeModal}>
          <div className={`${styles.modalContent} ${showModal ? styles.modalContentOpen : ''}`} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>{editingProject ? 'Edit Project' : 'Add Project'}</h2>
              <button onClick={closeModal} className={styles.closeBtn}>
                <HiXMark size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Title *</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    required
                    placeholder="Project title"
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                  >
                    <option>Web Development</option>
                    <option>Mobile App</option>
                    <option>SaaS Platform</option>
                    <option>API Service</option>
                    <option>E-Commerce</option>
                    <option>Other</option>
                  </select>
                </div>
              </div>

              <div className={styles.formGroup}>
                <label>Short Description *</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  required
                  placeholder="Brief description (shown on cards)"
                  rows={2}
                />
              </div>

              <div className={styles.formGroup}>
                <label>Long Description</label>
                <textarea
                  value={formData.long_description}
                  onChange={(e) => setFormData({...formData, long_description: e.target.value})}
                  placeholder="Detailed description (shown in modal)"
                  rows={4}
                />
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                  >
                    <option>Live</option>
                    <option>In Development</option>
                    <option>Complete</option>
                    <option>Archived</option>
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label>Year</label>
                  <input
                    type="text"
                    value={formData.year}
                    onChange={(e) => setFormData({...formData, year: e.target.value})}
                    placeholder="2024"
                  />
                </div>
              </div>

              {/* Image Upload Section */}
              <div className={styles.formGroup}>
                <label>Project Image</label>
                <FileUpload
                  onUploadComplete={(url) => {
                    setFormData(prev => ({ ...prev, image: url }));
                  }}
                  currentFileUrl={formData.image}
                  accept="image/*"
                  folder="projects"
                />
                
                <div className={styles.orDivider}>
                  <span>or paste URL</span>
                </div>
                
                <input
                  type="url"
                  value={formData.image}
                  onChange={(e) => setFormData({...formData, image: e.target.value})}
                  placeholder="https://example.com/image.jpg"
                  className={styles.urlInput}
                />
                
                {formData.image && (
                  <div className={styles.imagePreview}>
                    <img src={formData.image} alt="Preview" />
                  </div>
                )}
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Demo URL</label>
                  <input
                    type="url"
                    value={formData.demo}
                    onChange={(e) => setFormData({...formData, demo: e.target.value})}
                    placeholder="https://demo.com"
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>GitHub URL</label>
                  <input
                    type="url"
                    value={formData.github}
                    onChange={(e) => setFormData({...formData, github: e.target.value})}
                    placeholder="https://github.com/..."
                  />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label>Tags (comma separated)</label>
                <input
                  type="text"
                  value={formData.tags}
                  onChange={(e) => setFormData({...formData, tags: e.target.value})}
                  placeholder="React, TypeScript, Next.js, Supabase"
                />
              </div>

              <div className={styles.formGroup}>
                <label>Features (one per line)</label>
                <textarea
                  value={formData.features}
                  onChange={(e) => setFormData({...formData, features: e.target.value})}
                  placeholder="Multi-tenant architecture&#10;Stripe Connect integration&#10;Real-time booking system"
                  rows={5}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={formData.visible}
                    onChange={(e) => setFormData({...formData, visible: e.target.checked})}
                  />
                  <span>Visible on portfolio</span>
                </label>
              </div>

              <div className={styles.formActions}>
                <button type="button" onClick={closeModal} className={styles.cancelBtn}>
                  Cancel
                </button>
                <button type="submit" disabled={saving} className={styles.saveBtn}>
                  {saving ? 'Saving...' : (editingProject ? 'Update Project' : 'Create Project')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={!!deleteId}
        title="Delete Project?"
        message="This action cannot be undone. Are you sure?"
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}