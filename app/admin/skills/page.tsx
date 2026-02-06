'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useToast } from '@/components/admin/Toast';
import ConfirmDialog from '@/components/admin/ConfirmDialog';
import { 
  HiPlus, 
  HiPencil, 
  HiTrash, 
  HiXMark,
  HiCodeBracket,
  HiMagnifyingGlass
} from 'react-icons/hi2';
import styles from './skills.module.css';

interface Skill {
  id: string;
  name: string;
  level: number;
  color: string;
  category: string;
}

export default function SkillsPage() {
  const { showToast } = useToast();
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingSkill, setEditingSkill] = useState<Skill | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    level: 50,
    color: '#4A90E2',
    category: 'Frontend'
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSkills();
  }, []);

  async function loadSkills() {
    try {
      const { data, error } = await supabase
        .from('skills')
        .select('*')
        .order('level', { ascending: false });

      if (error) throw error;
      setSkills(data || []);
    } catch (error: any) {
      console.error('Error loading skills:', error);
      showToast('Error loading skills', 'error');
    } finally {
      setLoading(false);
    }
  }

  function openModal(skill?: Skill) {
    if (skill) {
      setEditingSkill(skill);
      setFormData({
        name: skill.name,
        level: skill.level || 50,
        color: skill.color || '#4A90E2',
        category: skill.category || 'Frontend'
      });
    } else {
      setEditingSkill(null);
      setFormData({
        name: '',
        level: 50,
        color: '#4A90E2',
        category: 'Frontend'
      });
    }
    setShowModal(true);
  }

  function closeModal() {
    setShowModal(false);
    setEditingSkill(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    if (!formData.name) {
      showToast('Please enter a skill name', 'warning');
      return;
    }

    setSaving(true);

    try {
      const skillData = {
        name: formData.name,
        level: formData.level,
        color: formData.color,
        category: formData.category
      };

      if (editingSkill) {
        const { error } = await supabase
          .from('skills')
          .update(skillData)
          .eq('id', editingSkill.id);

        if (error) throw error;
        showToast('Skill updated successfully!', 'success');
      } else {
        const { error } = await supabase
          .from('skills')
          .insert([skillData]);

        if (error) throw error;
        showToast('Skill created successfully!', 'success');
      }

      closeModal();
      loadSkills();
    } catch (error: any) {
      console.error('Error saving skill:', error);
      showToast(error.message || 'Error saving skill', 'error');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleteId) return;

    try {
      const { error } = await supabase
        .from('skills')
        .delete()
        .eq('id', deleteId);

      if (error) throw error;
      showToast('Skill deleted successfully!', 'success');
      loadSkills();
    } catch (error: any) {
      console.error('Error deleting skill:', error);
      showToast(error.message || 'Error deleting skill', 'error');
    } finally {
      setDeleteId(null);
    }
  }

  const filteredSkills = skills.filter(skill =>
    skill.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    skill.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className={styles.loadingState}>
        <div className={styles.spinner} />
        <p>Loading skills...</p>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Skills</h1>
          <p className={styles.pageSubtitle}>Manage your technical skills</p>
        </div>
        <button onClick={() => openModal()} className={styles.addBtn}>
          <HiPlus size={18} />
          <span>Add Skill</span>
        </button>
      </div>

      <div className={styles.searchBar}>
        <HiMagnifyingGlass size={20} />
        <input
          type="text"
          placeholder="Search skills..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={styles.searchInput}
        />
      </div>

      {filteredSkills.length === 0 ? (
        <div className={styles.emptyState}>
          <HiCodeBracket size={48} />
          <h3>No skills found</h3>
          <p>Add your first skill to get started</p>
          <button onClick={() => openModal()} className={styles.addBtn}>
            <HiPlus size={18} />
            <span>Add Skill</span>
          </button>
        </div>
      ) : (
        <div className={styles.grid}>
          {filteredSkills.map((skill) => (
            <div key={skill.id} className={styles.card}>
              <div className={styles.cardContent}>
                <div className={styles.cardHeader}>
                  <div>
                    <span className={styles.category}>{skill.category}</span>
                    <h3 className={styles.cardTitle}>{skill.name}</h3>
                  </div>
                  <div className={styles.cardActions}>
                    <button 
                      onClick={() => openModal(skill)}
                      className={styles.editBtn}
                      title="Edit"
                    >
                      <HiPencil size={16} />
                    </button>
                    <button 
                      onClick={() => setDeleteId(skill.id)}
                      className={styles.deleteBtn}
                      title="Delete"
                    >
                      <HiTrash size={16} />
                    </button>
                  </div>
                </div>
                
                {/* Level Bar */}
                <div className={styles.levelContainer}>
                  <div className={styles.levelBar}>
                    <div 
                      className={styles.levelFill}
                      style={{
                        width: `${skill.level}%`,
                        background: skill.color
                      }}
                    />
                  </div>
                  <span className={styles.levelText}>{skill.level}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className={styles.modal} onClick={closeModal}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>{editingSkill ? 'Edit Skill' : 'Add Skill'}</h2>
              <button onClick={closeModal} className={styles.closeBtn}>
                <HiXMark size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.formGroup}>
                <label>Skill Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                  placeholder="e.g. React, TypeScript, Node.js"
                />
              </div>

              <div className={styles.formGroup}>
                <label>Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                >
                  <option>Frontend</option>
                  <option>Backend</option>
                  <option>Database</option>
                  <option>DevOps</option>
                  <option>Tools</option>
                  <option>Other</option>
                </select>
              </div>

              <div className={styles.formGroup}>
                <label>Level ({formData.level}%)</label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={formData.level}
                  onChange={(e) => setFormData({...formData, level: parseInt(e.target.value)})}
                  className={styles.rangeInput}
                />
                <div className={styles.rangeLabels}>
                  <span>Beginner</span>
                  <span>Expert</span>
                </div>
              </div>

              <div className={styles.formGroup}>
                <label>Color</label>
                <div className={styles.colorInputWrapper}>
                  <input
                    type="color"
                    value={formData.color}
                    onChange={(e) => setFormData({...formData, color: e.target.value})}
                    className={styles.colorInput}
                  />
                  <input
                    type="text"
                    value={formData.color}
                    onChange={(e) => setFormData({...formData, color: e.target.value})}
                    placeholder="#4A90E2"
                    className={styles.colorTextInput}
                  />
                </div>
              </div>

              <div className={styles.formActions}>
                <button type="button" onClick={closeModal} className={styles.cancelBtn}>
                  Cancel
                </button>
                <button type="submit" disabled={saving} className={styles.saveBtn}>
                  {saving ? 'Saving...' : (editingSkill ? 'Update' : 'Create')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={!!deleteId}
        title="Delete Skill?"
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