'use client';
export const dynamic = 'force-dynamic';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useToast } from '@/components/admin/Toast';
import ConfirmDialog from '@/components/admin/ConfirmDialog';
import { 
  HiPlus, 
  HiPencil, 
  HiTrash, 
  HiXMark,
  HiBriefcase,
  HiMagnifyingGlass,
  HiEye,
  HiEyeSlash
} from 'react-icons/hi2';
import styles from './experience.module.css';

interface Experience {
  id: string;
  title: string;
  company: string;
  location: string;
  year: string;
  description: string;
  highlights: string[];
  visible: boolean;
}

export default function ExperiencePage() {
  const { showToast } = useToast();
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingExperience, setEditingExperience] = useState<Experience | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterVisible, setFilterVisible] = useState<'all' | 'visible' | 'hidden'>('all');
  const [formData, setFormData] = useState({
    title: '',
    company: '',
    location: '',
    year: '',
    description: '',
    highlights: ''
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadExperiences();
  }, []);

  async function loadExperiences() {
    try {
      const { data, error } = await supabase
        .from('experience')
        .select('*')
        .order('display_order', { ascending: false });

      if (error) throw error;
      setExperiences(data || []);
    } catch (error: any) {
      console.error('Error loading experience:', error);
      showToast('Error loading experience', 'error');
    } finally {
      setLoading(false);
    }
  }

  async function toggleVisibility(id: string, currentVisible: boolean) {
    try {
      const { error } = await supabase
        .from('experience')
        .update({ visible: !currentVisible })
        .eq('id', id);

      if (error) throw error;
      
      showToast(
        currentVisible ? 'Experience hidden from portfolio' : 'Experience visible on portfolio', 
        'success'
      );
      loadExperiences();
    } catch (error: any) {
      console.error('Error toggling visibility:', error);
      showToast(error.message || 'Error updating visibility', 'error');
    }
  }

  function openModal(experience?: Experience) {
    if (experience) {
      setEditingExperience(experience);
      setFormData({
        title: experience.title,
        company: experience.company || '',
        location: experience.location || '',
        year: experience.year || '',
        description: experience.description || '',
        highlights: experience.highlights?.join('\n') || ''
      });
    } else {
      setEditingExperience(null);
      setFormData({
        title: '',
        company: '',
        location: '',
        year: '',
        description: '',
        highlights: ''
      });
    }
    setShowModal(true);
  }

  function closeModal() {
    setShowModal(false);
    setEditingExperience(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    if (!formData.title || !formData.company) {
      showToast('Please fill in required fields', 'warning');
      return;
    }

    setSaving(true);

    try {
      const experienceData = {
        title: formData.title,
        company: formData.company,
        location: formData.location,
        year: formData.year,
        description: formData.description,
        highlights: formData.highlights.split('\n').map(h => h.trim()).filter(Boolean),
        visible: true // New experiences are visible by default
      };

      if (editingExperience) {
        const { error } = await supabase
          .from('experience')
          .update(experienceData)
          .eq('id', editingExperience.id);

        if (error) throw error;
        showToast('Experience updated successfully!', 'success');
      } else {
        const { error } = await supabase
          .from('experience')
          .insert([experienceData]);

        if (error) throw error;
        showToast('Experience created successfully!', 'success');
      }

      closeModal();
      loadExperiences();
    } catch (error: any) {
      console.error('Error saving experience:', error);
      showToast(error.message || 'Error saving experience', 'error');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleteId) return;

    try {
      const { error } = await supabase
        .from('experience')
        .delete()
        .eq('id', deleteId);

      if (error) throw error;
      showToast('Experience deleted successfully!', 'success');
      loadExperiences();
    } catch (error: any) {
      console.error('Error deleting experience:', error);
      showToast(error.message || 'Error deleting experience', 'error');
    } finally {
      setDeleteId(null);
    }
  }

  const filteredExperiences = experiences.filter(exp => {
    const matchesSearch = exp.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exp.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exp.location.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = 
      filterVisible === 'all' ? true :
      filterVisible === 'visible' ? exp.visible :
      !exp.visible;

    return matchesSearch && matchesFilter;
  });

  const visibleCount = experiences.filter(e => e.visible).length;
  const hiddenCount = experiences.filter(e => !e.visible).length;

  if (loading) {
    return (
      <div className={styles.loadingState}>
        <div className={styles.spinner} />
        <p>Loading experience...</p>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Experience</h1>
          <p className={styles.pageSubtitle}>
            {experiences.length} total • {visibleCount} visible • {hiddenCount} hidden
          </p>
        </div>
        <button onClick={() => openModal()} className={styles.addBtn}>
          <HiPlus size={18} />
          <span>Add Experience</span>
        </button>
      </div>

      <div className={styles.controls}>
        <div className={styles.searchBar}>
          <HiMagnifyingGlass size={20} />
          <input
            type="text"
            placeholder="Search experience..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
        </div>

        <div className={styles.filters}>
          <button 
            onClick={() => setFilterVisible('all')}
            className={`${styles.filterBtn} ${filterVisible === 'all' ? styles.filterBtnActive : ''}`}
          >
            All ({experiences.length})
          </button>
          <button 
            onClick={() => setFilterVisible('visible')}
            className={`${styles.filterBtn} ${filterVisible === 'visible' ? styles.filterBtnActive : ''}`}
          >
            Visible ({visibleCount})
          </button>
          <button 
            onClick={() => setFilterVisible('hidden')}
            className={`${styles.filterBtn} ${filterVisible === 'hidden' ? styles.filterBtnActive : ''}`}
          >
            Hidden ({hiddenCount})
          </button>
        </div>
      </div>

      {filteredExperiences.length === 0 ? (
        <div className={styles.emptyState}>
          <HiBriefcase size={48} />
          <h3>No experience found</h3>
          <p>Add your first work experience to get started</p>
          <button onClick={() => openModal()} className={styles.addBtn}>
            <HiPlus size={18} />
            <span>Add Experience</span>
          </button>
        </div>
      ) : (
        <div className={styles.timeline}>
          {filteredExperiences.map((exp) => (
            <div 
              key={exp.id} 
              className={`${styles.card} ${!exp.visible ? styles.cardHidden : ''}`}
            >
              <div className={styles.cardContent}>
                <div className={styles.cardHeader}>
                  <div>
                    <h3 className={styles.cardTitle}>
                      {exp.title}
                      {!exp.visible && (
                        <span className={styles.hiddenBadge}>Hidden</span>
                      )}
                    </h3>
                    <p className={styles.company}>{exp.company}</p>
                    {exp.location && (
                      <p className={styles.location}>{exp.location}</p>
                    )}
                    <span className={styles.year}>{exp.year}</span>
                  </div>
                  <div className={styles.cardActions}>
                    <button 
                      onClick={() => toggleVisibility(exp.id, exp.visible)}
                      className={`${styles.actionBtn} ${exp.visible ? styles.visibleBtn : styles.hiddenBtn}`}
                      title={exp.visible ? 'Hide from portfolio' : 'Show on portfolio'}
                    >
                      {exp.visible ? <HiEye size={16} /> : <HiEyeSlash size={16} />}
                    </button>
                    <button 
                      onClick={() => openModal(exp)}
                      className={styles.editBtn}
                      title="Edit"
                    >
                      <HiPencil size={16} />
                    </button>
                    <button 
                      onClick={() => setDeleteId(exp.id)}
                      className={styles.deleteBtn}
                      title="Delete"
                    >
                      <HiTrash size={16} />
                    </button>
                  </div>
                </div>

                {exp.description && (
                  <p className={styles.description}>{exp.description}</p>
                )}

                {exp.highlights && exp.highlights.length > 0 && (
                  <ul className={styles.highlights}>
                    {exp.highlights.map((highlight, idx) => (
                      <li key={idx}>{highlight}</li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className={styles.modal} onClick={closeModal}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>{editingExperience ? 'Edit Experience' : 'Add Experience'}</h2>
              <button onClick={closeModal} className={styles.closeBtn}>
                <HiXMark size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Job Title *</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    required
                    placeholder="e.g. Senior Developer"
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Company *</label>
                  <input
                    type="text"
                    value={formData.company}
                    onChange={(e) => setFormData({...formData, company: e.target.value})}
                    required
                    placeholder="Company name"
                  />
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Location</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                    placeholder="City, State"
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Year / Date Range</label>
                  <input
                    type="text"
                    value={formData.year}
                    onChange={(e) => setFormData({...formData, year: e.target.value})}
                    placeholder="2020 - 2024"
                  />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label>Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Brief description of your role and responsibilities"
                  rows={3}
                />
              </div>

              <div className={styles.formGroup}>
                <label>Key Achievements / Highlights (one per line)</label>
                <textarea
                  value={formData.highlights}
                  onChange={(e) => setFormData({...formData, highlights: e.target.value})}
                  placeholder="Led team of 5 developers&#10;Increased performance by 40%&#10;Implemented CI/CD pipeline"
                  rows={5}
                />
              </div>

              <div className={styles.formActions}>
                <button type="button" onClick={closeModal} className={styles.cancelBtn}>
                  Cancel
                </button>
                <button type="submit" disabled={saving} className={styles.saveBtn}>
                  {saving ? 'Saving...' : (editingExperience ? 'Update' : 'Create')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={!!deleteId}
        title="Delete Experience?"
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