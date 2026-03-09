'use client';
export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useToast } from '@/components/admin/Toast';
import { HiPencil, HiEye, HiClock } from 'react-icons/hi2';
import styles from './legal.module.css';

interface LegalDocument {
  id: string;
  document_type: string;
  title: string;
  content: string;
  is_active: boolean;
  last_updated: string;
}

export default function LegalManagementPage() {
  const { showToast } = useToast();
  const [documents, setDocuments] = useState<LegalDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingDoc, setEditingDoc] = useState<LegalDocument | null>(null);
  const [editContent, setEditContent] = useState('');
  const [editTitle, setEditTitle] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadDocuments();
  }, []);

  async function loadDocuments() {
    try {
      const { data, error } = await supabase
        .from('legal_documents')
        .select('*')
        .order('document_type');

      if (error) throw error;
      setDocuments(data || []);
    } catch (error: any) {
      showToast(error.message || 'Error loading documents', 'error');
    } finally {
      setLoading(false);
    }
  }

  function handleEdit(doc: LegalDocument) {
    setEditingDoc(doc);
    setEditTitle(doc.title);
    setEditContent(doc.content);
  }

  function handleCancel() {
    setEditingDoc(null);
    setEditTitle('');
    setEditContent('');
  }

  async function handleSave() {
    if (!editingDoc) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('legal_documents')
        .update({
          title: editTitle,
          content: editContent,
        })
        .eq('id', editingDoc.id);

      if (error) throw error;

      showToast('Document updated successfully!', 'success');
      setEditingDoc(null);
      loadDocuments();
    } catch (error: any) {
      showToast(error.message || 'Error saving document', 'error');
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(doc: LegalDocument) {
    try {
      const { error } = await supabase
        .from('legal_documents')
        .update({ is_active: !doc.is_active })
        .eq('id', doc.id);

      if (error) throw error;

      showToast(`Document ${!doc.is_active ? 'activated' : 'deactivated'}!`, 'success');
      loadDocuments();
    } catch (error: any) {
      showToast(error.message || 'Error updating status', 'error');
    }
  }

  function viewDocument(type: string) {
    const url = type === 'privacy-policy' ? '/privacy-policy' : '/terms-of-service';
    window.open(url, '_blank', 'noopener,noreferrer');
  }

  if (loading) {
    return (
      <div className={styles.loadingState}>
        <div className={styles.spinner} />
        <p>Loading legal documents...</p>
      </div>
    );
  }

  if (editingDoc) {
    return (
      <div className={styles.page}>
        <div className={styles.editHeader}>
          <div>
            <h1 className={styles.pageTitle}>Edit {editingDoc.title}</h1>
            <p className={styles.pageSubtitle}>
              Last updated: {new Date(editingDoc.last_updated).toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric'
              })}
            </p>
          </div>
          <div className={styles.editActions}>
            <button onClick={handleCancel} className={styles.cancelBtn} disabled={saving}>
              Cancel
            </button>
            <button onClick={handleSave} className={styles.saveBtn} disabled={saving}>
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>

        <div className={styles.editForm}>
          <div className={styles.formGroup}>
            <label>Document Title</label>
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              className={styles.input}
              placeholder="e.g., Privacy Policy"
            />
          </div>

          <div className={styles.formGroup}>
            <label>Content</label>
            <p className={styles.helpText}>
              Use markdown formatting. Supports **bold**, *italic*, # headings, - lists, etc.
            </p>
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className={styles.textarea}
              rows={25}
              placeholder="Enter your legal document content here..."
            />
          </div>

          <div className={styles.charCount}>
            {editContent.length.toLocaleString()} characters
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Legal Documents</h1>
          <p className={styles.pageSubtitle}>Manage your privacy policy and terms of service</p>
        </div>
      </div>

      <div className={styles.documentsGrid}>
        {documents.map((doc) => (
          <div key={doc.id} className={styles.docCard}>
            <div className={styles.docHeader}>
              <div>
                <h3 className={styles.docTitle}>{doc.title}</h3>
                <p className={styles.docType}>
                  {doc.document_type.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </p>
              </div>
              <div className={styles.statusBadge} data-active={doc.is_active}>
                {doc.is_active ? 'Active' : 'Inactive'}
              </div>
            </div>

            <div className={styles.docMeta}>
              <div className={styles.metaItem}>
                <HiClock size={16} />
                <span>Updated: {new Date(doc.last_updated).toLocaleDateString()}</span>
              </div>
              <div className={styles.metaItem}>
                <span>{doc.content.length.toLocaleString()} characters</span>
              </div>
            </div>

            <div className={styles.docActions}>
              <button
                onClick={() => handleEdit(doc)}
                className={styles.actionBtn}
                title="Edit document"
              >
                <HiPencil size={18} />
                <span>Edit</span>
              </button>
              <button
                onClick={() => viewDocument(doc.document_type)}
                className={styles.actionBtn}
                title="View live page"
              >
                <HiEye size={18} />
                <span>View</span>
              </button>
              <label className={styles.toggleSwitch}>
                <input
                  type="checkbox"
                  checked={doc.is_active}
                  onChange={() => toggleActive(doc)}
                />
                <span className={styles.toggleSlider} />
              </label>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
