'use client';
export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useToast } from '@/components/admin/Toast';
import {
  HiPlus,
  HiPencil,
  HiTrash,
  HiEye,
  HiEyeSlash,
  HiXMark,
  HiCheckCircle
} from 'react-icons/hi2';
import { FileUpload } from '@/components/admin/FileUpload';
import styles from './services.module.css';

interface Service {
  id: string;
  title: string;
  tagline: string;
  icon: string;
  timeline: string;
  description: string;
  deliverables: string[];
  tech_stack: string[];
  cta_text: string;
  cta_link: string;
  accent_color: string;
  background_image: string;
  overlay_opacity: number;
  display_order: number;
  visible: boolean;
}

const techOptions = [
  'Next.js', 'React', 'TypeScript', 'Node.js', 'PostgreSQL', 
  'Supabase', 'Stripe', 'Firebase', 'Vercel', 'Tailwind'
];

// Icon options with their names
const iconOptions = [
  { name: 'HiBriefcase', icon: require('react-icons/hi2').HiBriefcase, label: 'Briefcase' },
  { name: 'HiRocketLaunch', icon: require('react-icons/hi2').HiRocketLaunch, label: 'Rocket' },
  { name: 'HiCodeBracket', icon: require('react-icons/hi2').HiCodeBracket, label: 'Code' },
  { name: 'HiCpuChip', icon: require('react-icons/hi2').HiCpuChip, label: 'CPU' },
  { name: 'HiLightBulb', icon: require('react-icons/hi2').HiLightBulb, label: 'Light Bulb' },
  { name: 'HiWrench', icon: require('react-icons/hi2').HiWrench, label: 'Wrench' },
  { name: 'HiSparkles', icon: require('react-icons/hi2').HiSparkles, label: 'Sparkles' },
  { name: 'HiShoppingCart', icon: require('react-icons/hi2').HiShoppingCart, label: 'Shopping' },
  { name: 'HiGlobeAlt', icon: require('react-icons/hi2').HiGlobeAlt, label: 'Globe' },
  { name: 'HiCog', icon: require('react-icons/hi2').HiCog, label: 'Settings' },
];

export default function ServicesAdmin() {
  const { showToast } = useToast();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ show: boolean; service: Service | null }>({
    show: false,
    service: null
  });

  // Form state
  const [title, setTitle] = useState('');
  const [tagline, setTagline] = useState('');
  const [icon, setIcon] = useState('HiBriefcase');
  const [timeline, setTimeline] = useState('');
  const [description, setDescription] = useState('');
  const [deliverables, setDeliverables] = useState<string[]>(['']);
  const [techStack, setTechStack] = useState<string[]>([]);
  const [ctaText, setCtaText] = useState('Get Started');
  const [ctaLink, setCtaLink] = useState('#contact');
  const [accentColor, setAccentColor] = useState('#4A90E2');
  const [backgroundImage, setBackgroundImage] = useState('');
  const [overlayOpacity, setOverlayOpacity] = useState(0.6);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    loadServices();
  }, []);

  async function loadServices() {
    try {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) throw error;
      setServices(data || []);
    } catch (error) {
      console.error('Error loading services:', error);
      showToast('Error loading services', 'error');
    } finally {
      setLoading(false);
    }
  }

  function openModal(service?: Service) {
    if (service) {
      setEditingService(service);
      setTitle(service.title);
      setTagline(service.tagline);
      setIcon(service.icon);
      setTimeline(service.timeline);
      setDescription(service.description);
      setDeliverables(service.deliverables || ['']);
      setTechStack(service.tech_stack || []);
      setCtaText(service.cta_text);
      setCtaLink(service.cta_link);
      setAccentColor(service.accent_color);
      setBackgroundImage(service.background_image || '');
      setOverlayOpacity(service.overlay_opacity ?? 0.6);
      setVisible(service.visible);
    } else {
      resetForm();
    }
    setShowModal(true);
  }

  function resetForm() {
    setEditingService(null);
    setTitle('');
    setTagline('');
    setIcon('HiBriefcase');
    setTimeline('');
    setDescription('');
    setDeliverables(['']);
    setTechStack([]);
    setCtaText('Get Started');
    setCtaLink('#contact');
    setAccentColor('#4A90E2');
    setBackgroundImage('');
    setOverlayOpacity(0.6);
    setVisible(true);
  }

  function closeModal() {
    setShowModal(false);
    resetForm();
  }

  async function handleSave() {
    if (!title || !tagline || !timeline) {
      showToast('Please fill in required fields', 'error');
      return;
    }

    const filteredDeliverables = deliverables.filter(d => d.trim() !== '');
    
    if (filteredDeliverables.length === 0) {
      showToast('Please add at least one deliverable', 'error');
      return;
    }

    const serviceData = {
      title,
      tagline,
      icon,
      timeline,
      description,
      deliverables: filteredDeliverables,
      tech_stack: techStack,
      cta_text: ctaText,
      cta_link: ctaLink,
      accent_color: accentColor,
      background_image: backgroundImage,
      overlay_opacity: overlayOpacity,
      visible,
      display_order: editingService?.display_order || services.length + 1,
      updated_at: new Date().toISOString()
    };

    try {
      if (editingService) {
        const { error } = await supabase
          .from('services')
          .update(serviceData)
          .eq('id', editingService.id);

        if (error) throw error;
        showToast('Service updated successfully!', 'success');
      } else {
        const { error } = await supabase
          .from('services')
          .insert([serviceData]);

        if (error) throw error;
        showToast('Service created successfully!', 'success');
      }

      loadServices();
      closeModal();
    } catch (error: any) {
      console.error('Error saving service:', error);
      showToast(error.message || 'Error saving service', 'error');
    }
  }

  function confirmDelete(service: Service) {
    setDeleteConfirm({ show: true, service });
  }

  async function handleDelete() {
    if (!deleteConfirm.service) return;

    try {
      const { error } = await supabase
        .from('services')
        .delete()
        .eq('id', deleteConfirm.service.id);

      if (error) throw error;
      showToast('Service deleted successfully!', 'success');
      loadServices();
    } catch (error: any) {
      console.error('Error deleting service:', error);
      showToast(error.message || 'Error deleting service', 'error');
    } finally {
      setDeleteConfirm({ show: false, service: null });
    }
  }

  async function toggleVisibility(service: Service) {
    try {
      const { error } = await supabase
        .from('services')
        .update({ visible: !service.visible })
        .eq('id', service.id);

      if (error) throw error;
      showToast('Visibility updated!', 'success');
      loadServices();
    } catch (error: any) {
      console.error('Error updating visibility:', error);
      showToast(error.message || 'Error updating visibility', 'error');
    }
  }

  function addDeliverable() {
    setDeliverables([...deliverables, '']);
  }

  function removeDeliverable(index: number) {
    setDeliverables(deliverables.filter((_, i) => i !== index));
  }

  function updateDeliverable(index: number, value: string) {
    const updated = [...deliverables];
    updated[index] = value;
    setDeliverables(updated);
  }

  function toggleTech(tech: string) {
    if (techStack.includes(tech)) {
      setTechStack(techStack.filter(t => t !== tech));
    } else {
      setTechStack([...techStack, tech]);
    }
  }

  // Get the icon component for display
  const getIconComponent = (iconName: string) => {
    const iconData = iconOptions.find(opt => opt.name === iconName);
    return iconData ? iconData.icon : iconOptions[0].icon;
  };

  if (loading) {
    return (
      <div className={styles.loadingState}>
        <div className={styles.spinner} />
        <p>Loading services...</p>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Services</h1>
          <p className={styles.pageSubtitle}>Manage your service offerings</p>
        </div>
        <button onClick={() => openModal()} className={styles.addButton}>
          <HiPlus size={18} />
          <span>Add Service</span>
        </button>
      </div>

      {services.length === 0 ? (
        <div className={styles.emptyState}>
          <p>No services yet. Create your first service!</p>
          <button onClick={() => openModal()} className={styles.emptyButton}>
            <HiPlus size={18} />
            <span>Add Service</span>
          </button>
        </div>
      ) : (
        <div className={styles.servicesGrid}>
          {services.map(service => {
            const ServiceIcon = getIconComponent(service.icon);
            return (
              <div key={service.id} className={styles.serviceCard}>
                <div className={styles.cardHeader}>
                  <ServiceIcon size={32} className={styles.cardIcon} style={{ color: service.accent_color }} />
                  <div className={styles.cardActions}>
                    <button
                      onClick={() => toggleVisibility(service)}
                      className={styles.iconButton}
                      title={service.visible ? 'Hide' : 'Show'}
                    >
                      {service.visible ? <HiEye size={18} /> : <HiEyeSlash size={18} />}
                    </button>
                    <button
                      onClick={() => openModal(service)}
                      className={styles.iconButton}
                      title="Edit"
                    >
                      <HiPencil size={18} />
                    </button>
                    <button
                      onClick={() => confirmDelete(service)}
                      className={`${styles.iconButton} ${styles.deleteButton}`}
                      title="Delete"
                    >
                      <HiTrash size={18} />
                    </button>
                  </div>
                </div>

                {service.background_image && (
                  <img src={service.background_image} alt="" className={styles.cardThumbnail} />
                )}

                <h3 className={styles.cardTitle}>{service.title}</h3>
                <p className={styles.cardTagline}>{service.tagline}</p>
                
                <div className={styles.cardMeta}>
                  <span className={styles.timeline} style={{ backgroundColor: `${service.accent_color}20`, color: service.accent_color }}>
                    {service.timeline}
                  </span>
                  <span className={styles.visibility}>
                    {service.visible ? '👁️ Visible' : '🚫 Hidden'}
                  </span>
                </div>

                <div className={styles.deliverablesList}>
                  {service.deliverables.slice(0, 3).map((item, i) => (
                    <div key={i} className={styles.deliverableItem}>
                      <HiCheckCircle size={14} style={{ color: service.accent_color }} />
                      <span>{item}</span>
                    </div>
                  ))}
                  {service.deliverables.length > 3 && (
                    <span className={styles.moreItems}>+{service.deliverables.length - 3} more</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* DELETE CONFIRMATION DIALOG */}
      {deleteConfirm.show && (
        <div className={styles.modalOverlay} onClick={() => setDeleteConfirm({ show: false, service: null })}>
          <div className={styles.confirmDialog} onClick={(e) => e.stopPropagation()}>
            <h3>Delete Service?</h3>
            <p>Are you sure you want to delete "{deleteConfirm.service?.title}"? This action cannot be undone.</p>
            <div className={styles.confirmActions}>
              <button 
                onClick={() => setDeleteConfirm({ show: false, service: null })}
                className={styles.cancelButton}
              >
                Cancel
              </button>
              <button 
                onClick={handleDelete}
                className={styles.deleteConfirmButton}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT MODAL - REST OF THE CODE REMAINS THE SAME */}
      {showModal && (
        <div className={styles.modalOverlay} onClick={closeModal}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>{editingService ? 'Edit Service' : 'New Service'}</h2>
              <button onClick={closeModal} className={styles.closeButton}>
                <HiXMark size={24} />
              </button>
            </div>

            <div className={styles.modalContent}>
              {/* Title */}
              <div className={styles.formGroup}>
                <label>Title *</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="SaaS Platform Development"
                  maxLength={60}
                />
              </div>

              {/* Tagline */}
              <div className={styles.formGroup}>
                <label>Tagline *</label>
                <input
                  type="text"
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  placeholder="Multi-tenant apps with subscriptions"
                  maxLength={80}
                />
              </div>

              <div className={styles.formRow}>
                {/* Icon Selector */}
                <div className={styles.formGroup}>
                  <label>Icon *</label>
                  <div className={styles.iconPicker}>
                    {iconOptions.map(({ name, icon: IconComp, label }) => (
                      <button
                        key={name}
                        onClick={() => setIcon(name)}
                        className={`${styles.iconOption} ${icon === name ? styles.iconSelected : ''}`}
                        title={label}
                      >
                        <IconComp size={24} />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Timeline */}
                <div className={styles.formGroup}>
                  <label>Timeline *</label>
                  <input
                    type="text"
                    value={timeline}
                    onChange={(e) => setTimeline(e.target.value)}
                    placeholder="6-8 weeks"
                  />
                </div>
              </div>

              {/* Description */}
              <div className={styles.formGroup}>
                <label>Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Full-stack SaaS platforms with user management..."
                  rows={3}
                  maxLength={200}
                />
                <small>{description.length}/200 characters</small>
              </div>

              {/* Background Image */}
              <div className={styles.formGroup}>
                <label>Background Image</label>
                <FileUpload
                  onUploadComplete={(url) => setBackgroundImage(url)}
                  currentFileUrl={backgroundImage}
                  folder="services"
                  accept="image/*"
                  maxSize={5}
                />
              </div>

              {/* Overlay Opacity - only show when background image is set */}
              {backgroundImage && (
                <div className={styles.formGroup}>
                  <label>Image Overlay Darkness — {Math.round(overlayOpacity * 100)}%</label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={overlayOpacity}
                    onChange={(e) => setOverlayOpacity(parseFloat(e.target.value))}
                    className={styles.rangeSlider}
                    title="Image overlay darkness"
                  />
                  <small>Lower = brighter image, Higher = darker overlay for text readability</small>
                </div>
              )}

              {/* Deliverables */}
              <div className={styles.formGroup}>
                <label>Deliverables *</label>
                {deliverables.map((deliverable, index) => (
                  <div key={index} className={styles.arrayInput}>
                    <input
                      type="text"
                      value={deliverable}
                      onChange={(e) => updateDeliverable(index, e.target.value)}
                      placeholder="User authentication & authorization"
                    />
                    {deliverables.length > 1 && (
                      <button
                        onClick={() => removeDeliverable(index)}
                        className={styles.removeButton}
                      >
                        <HiXMark size={18} />
                      </button>
                    )}
                  </div>
                ))}
                <button onClick={addDeliverable} className={styles.addItemButton}>
                  <HiPlus size={16} />
                  <span>Add Deliverable</span>
                </button>
              </div>

              {/* Tech Stack */}
              <div className={styles.formGroup}>
                <label>Tech Stack</label>
                <div className={styles.techGrid}>
                  {techOptions.map(tech => (
                    <button
                      key={tech}
                      onClick={() => toggleTech(tech)}
                      className={`${styles.techOption} ${techStack.includes(tech) ? styles.techSelected : ''}`}
                    >
                      {tech}
                    </button>
                  ))}
                </div>
              </div>

              <div className={styles.formRow}>
                {/* CTA Text */}
                <div className={styles.formGroup}>
                  <label>CTA Button Text</label>
                  <input
                    type="text"
                    value={ctaText}
                    onChange={(e) => setCtaText(e.target.value)}
                    placeholder="Get Started"
                  />
                </div>

                {/* CTA Link */}
                <div className={styles.formGroup}>
                  <label>CTA Link</label>
                  <input
                    type="text"
                    value={ctaLink}
                    onChange={(e) => setCtaLink(e.target.value)}
                    placeholder="#contact"
                  />
                </div>
              </div>

              <div className={styles.formRow}>
                {/* Accent Color */}
                <div className={styles.formGroup}>
                  <label>Accent Color</label>
                  <div className={styles.colorInput}>
                    <input
                      type="color"
                      value={accentColor}
                      onChange={(e) => setAccentColor(e.target.value)}
                    />
                    <input
                      type="text"
                      value={accentColor}
                      onChange={(e) => setAccentColor(e.target.value)}
                      placeholder="#4A90E2"
                    />
                  </div>
                </div>

                {/* Visibility */}
                <div className={styles.formGroup}>
                  <label>Visibility</label>
                  <label className={styles.switchLabel}>
                    <input
                      type="checkbox"
                      checked={visible}
                      onChange={(e) => setVisible(e.target.checked)}
                      className={styles.switch}
                    />
                    <span>{visible ? 'Visible' : 'Hidden'}</span>
                  </label>
                </div>
              </div>
            </div>

            <div className={styles.modalFooter}>
              <button onClick={closeModal} className={styles.cancelButton}>
                Cancel
              </button>
              <button onClick={handleSave} className={styles.saveButton}>
                {editingService ? 'Update Service' : 'Create Service'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}