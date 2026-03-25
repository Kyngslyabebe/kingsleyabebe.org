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
  HiEye,
  HiEyeSlash,
  HiArrowUp,
  HiArrowDown
} from 'react-icons/hi2';
import styles from './showcase.module.css';

interface ShowcaseItem {
  id: string;
  desktop_image: string;
  mobile_image: string;
  title: string;
  header: string;
  subheader: string;
  order_index: number;
  active: boolean;
}

export default function ShowcasePage() {
  const { showToast } = useToast();
  const [items, setItems] = useState<ShowcaseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<ShowcaseItem | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    header: '',
    subheader: '',
    desktop_image: '',
    mobile_image: '',
    active: true
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadItems();
  }, []);

  async function loadItems() {
    try {
      const { data, error } = await supabase
        .from('hero_showcase')
        .select('*')
        .order('order_index', { ascending: true });

      if (error) throw error;
      setItems(data || []);
    } catch (error: any) {
      console.error('Error loading showcase items:', error);
      showToast('Error loading showcase items', 'error');
    } finally {
      setLoading(false);
    }
  }

  function openModal(item?: ShowcaseItem) {
    if (item) {
      setEditingItem(item);
      setFormData({
        title: item.title || '',
        header: item.header || '',
        subheader: item.subheader || '',
        desktop_image: item.desktop_image,
        mobile_image: item.mobile_image,
        active: item.active
      });
    } else {
      setEditingItem(null);
      setFormData({
        title: '',
        header: '',
        subheader: '',
        desktop_image: '',
        mobile_image: '',
        active: true
      });
    }
    setShowModal(true);
  }

  function closeModal() {
    setShowModal(false);
    setTimeout(() => {
      setEditingItem(null);
    }, 300);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    if (!formData.desktop_image || !formData.mobile_image) {
      showToast('Please upload both desktop and mobile images', 'warning');
      return;
    }

    // Check limit
    if (!editingItem && items.length >= 10) {
      showToast('Maximum 10 showcase items allowed', 'warning');
      return;
    }

    setSaving(true);

    try {
      const itemData = {
        title: formData.title,
        header: formData.header,
        subheader: formData.subheader,
        desktop_image: formData.desktop_image,
        mobile_image: formData.mobile_image,
        active: formData.active,
        order_index: editingItem ? editingItem.order_index : items.length
      };

      if (editingItem) {
        const { error } = await supabase
          .from('hero_showcase')
          .update(itemData)
          .eq('id', editingItem.id);

        if (error) throw error;
        showToast('Showcase item updated successfully!', 'success');
      } else {
        const { error } = await supabase
          .from('hero_showcase')
          .insert([itemData]);

        if (error) throw error;
        showToast('Showcase item created successfully!', 'success');
      }

      closeModal();
      loadItems();
    } catch (error: any) {
      console.error('Error saving showcase item:', error);
      showToast(error.message || 'Error saving showcase item', 'error');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleteId) return;

    try {
      const { error } = await supabase
        .from('hero_showcase')
        .delete()
        .eq('id', deleteId);

      if (error) throw error;
      showToast('Showcase item deleted successfully!', 'success');
      loadItems();
    } catch (error: any) {
      console.error('Error deleting showcase item:', error);
      showToast(error.message || 'Error deleting showcase item', 'error');
    } finally {
      setDeleteId(null);
    }
  }

 async function toggleActive(id: string, currentActive: boolean) {
  try {
    
    const newActiveState = !currentActive;
    
    const { error } = await supabase
      .from('hero_showcase')
      .update({ active: newActiveState })
      .eq('id', id);

    if (error) throw error;
    
    
    showToast(
      `Item ${newActiveState ? 'activated' : 'deactivated'}!`, 
      'success'
    );
    
    loadItems();
  } catch (error: any) {
    console.error('Error toggling active:', error);
    showToast('Error updating item', 'error');
  }
}

  async function moveItem(id: string, direction: 'up' | 'down') {
    const index = items.findIndex(item => item.id === id);
    if (index === -1) return;
    
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === items.length - 1) return;

    const newIndex = direction === 'up' ? index - 1 : index + 1;
    const newItems = [...items];
    [newItems[index], newItems[newIndex]] = [newItems[newIndex], newItems[index]];

    try {
      // Update order_index for both items
      await supabase
        .from('hero_showcase')
        .update({ order_index: newIndex })
        .eq('id', items[index].id);

      await supabase
        .from('hero_showcase')
        .update({ order_index: index })
        .eq('id', items[newIndex].id);

      loadItems();
    } catch (error: any) {
      console.error('Error reordering:', error);
      showToast('Error reordering items', 'error');
    }
  }

  if (loading) {
    return (
      <div className={styles.loadingState}>
        <div className={styles.spinner} />
        <p>Loading showcase...</p>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Hero Showcase</h1>
          <p className={styles.pageSubtitle}>Manage carousel images (Max 10 items)</p>
        </div>
        <button 
          onClick={() => openModal()} 
          className={styles.addBtn}
          disabled={items.length >= 10}
        >
          <HiPlus size={18} />
          <span>Add Showcase</span>
        </button>
      </div>

      {items.length === 0 ? (
        <div className={styles.emptyState}>
          <HiEye size={48} />
          <h3>No showcase items yet</h3>
          <p>Create your first showcase item to display in the hero section</p>
          <button onClick={() => openModal()} className={styles.addBtn}>
            <HiPlus size={18} />
            <span>Add Showcase</span>
          </button>
        </div>
      ) : (
        <div className={styles.grid}>
          {items.map((item, index) => (
            <div key={item.id} className={styles.card}>
              <div className={styles.imageRow}>
                <div className={styles.imagePreview}>
                  <span className={styles.imageLabel}>Desktop</span>
                  <img src={item.desktop_image} alt="Desktop view" />
                </div>
                <div className={styles.imagePreview}>
                  <span className={styles.imageLabel}>Mobile</span>
                  <img src={item.mobile_image} alt="Mobile view" />
                </div>
              </div>
              
              <div className={styles.cardContent}>
                <div className={styles.cardHeader}>
                  <div>
                    <h3 className={styles.cardTitle}>{item.title || 'Untitled'}</h3>
                    {item.header && <p className={styles.cardSubInfo}>{item.header}</p>}
                    {item.subheader && <p className={styles.cardSubInfoMuted}>{item.subheader}</p>}
                    <span className={styles.orderBadge}>Order: {index + 1}</span>
                  </div>
                  <div className={styles.cardActions}>
                    <button 
                      onClick={() => moveItem(item.id, 'up')}
                      className={styles.iconBtn}
                      disabled={index === 0}
                      title="Move up"
                    >
                      <HiArrowUp size={16} />
                    </button>
                    <button 
                      onClick={() => moveItem(item.id, 'down')}
                      className={styles.iconBtn}
                      disabled={index === items.length - 1}
                      title="Move down"
                    >
                      <HiArrowDown size={16} />
                    </button>
                    <button 
                      onClick={() => toggleActive(item.id, item.active)}
                      className={styles.iconBtn}
                      title={item.active ? 'Deactivate' : 'Activate'}
                    >
                      {item.active ? <HiEye size={16} /> : <HiEyeSlash size={16} />}
                    </button>
                    <button 
                      onClick={() => openModal(item)}
                      className={styles.editBtn}
                      title="Edit"
                    >
                      <HiPencil size={16} />
                    </button>
                    <button 
                      onClick={() => setDeleteId(item.id)}
                      className={styles.deleteBtn}
                      title="Delete"
                    >
                      <HiTrash size={16} />
                    </button>
                  </div>
                </div>
                {!item.active && (
                  <span className={styles.inactiveBadge}>Inactive</span>
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
              <h2>{editingItem ? 'Edit Showcase' : 'Add Showcase'}</h2>
              <button onClick={closeModal} className={styles.closeBtn}>
                <HiXMark size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.formGroup}>
                <label>Title (Optional - internal label)</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  placeholder="Internal label for this item"
                />
              </div>

              <div className={styles.formGroup}>
                <label>Header (shown on hero section)</label>
                <input
                  type="text"
                  value={formData.header}
                  onChange={(e) => setFormData({...formData, header: e.target.value})}
                  placeholder="e.g. Building InfinitBooking Platform"
                />
              </div>

              <div className={styles.formGroup}>
                <label>Subheader (shown below header)</label>
                <input
                  type="text"
                  value={formData.subheader}
                  onChange={(e) => setFormData({...formData, subheader: e.target.value})}
                  placeholder="e.g. ...a SaaS Booking Platform for Service-based Businesses"
                />
              </div>

              <div className={styles.formGroup}>
                <label>Desktop Image *</label>
                <FileUpload
                  onUploadComplete={(url) => setFormData(prev => ({ ...prev, desktop_image: url }))}
                  currentFileUrl={formData.desktop_image}
                  accept="image/*"
                  folder="showcase"
                  bucket="portfolio-assets"
                />
              </div>

              <div className={styles.formGroup}>
                <label>Mobile Image *</label>
                <FileUpload
                  onUploadComplete={(url) => setFormData(prev => ({ ...prev, mobile_image: url }))}
                  currentFileUrl={formData.mobile_image}
                  accept="image/*"
                  folder="showcase"
                  bucket="portfolio-assets" 
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={formData.active}
                    onChange={(e) => setFormData({...formData, active: e.target.checked})}
                  />
                  <span>Active (show in hero)</span>
                </label>
              </div>

              <div className={styles.formActions}>
                <button type="button" onClick={closeModal} className={styles.cancelBtn}>
                  Cancel
                </button>
                <button type="submit" disabled={saving} className={styles.saveBtn}>
                  {saving ? 'Saving...' : (editingItem ? 'Update' : 'Create')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={!!deleteId}
        title="Delete Showcase Item?"
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