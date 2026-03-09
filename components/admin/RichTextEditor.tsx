'use client';

import { useState, useRef, useCallback } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import { common, createLowlight } from 'lowlight';
import { supabase } from '@/lib/supabase/client';
import {
  HiBold,
  HiItalic,
  HiListBullet,
  HiCodeBracket,
  HiLink,
  HiPhoto,
  HiArrowUpTray,
  HiGlobeAlt,
  HiXMark
} from 'react-icons/hi2';
import styles from './RichTextEditor.module.css';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function RichTextEditor({ value, onChange, placeholder }: RichTextEditorProps) {
  const lowlight = createLowlight(common);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Modal state
  const [showImageModal, setShowImageModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'upload' | 'url'>('upload');
  const [imageUrl, setImageUrl] = useState('');
  const [altText, setAltText] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [dragOverEditor, setDragOverEditor] = useState(false);

  // Upload image to Supabase
  const uploadImage = useCallback(async (file: File): Promise<string> => {
    if (!file.type.startsWith('image/')) {
      throw new Error('Please upload an image file');
    }
    if (file.size > 5 * 1024 * 1024) {
      throw new Error('Image size must be less than 5MB');
    }

    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `blog-images/${fileName}`;

    setUploadProgress(30);

    const { error: uploadError } = await supabase.storage
      .from('public-assets')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    setUploadProgress(80);

    const { data: { publicUrl } } = supabase.storage
      .from('public-assets')
      .getPublicUrl(filePath);

    setUploadProgress(100);
    return publicUrl;
  }, []);

  // Insert image into editor
  const insertImage = useCallback((src: string, alt: string) => {
    if (!editor) return;
    editor.chain().focus().setImage({ src, alt: alt || 'Blog image' }).run();
  }, []);

  // Handle file selection from modal
  const handleFileUpload = useCallback(async (file: File) => {
    setUploading(true);
    setUploadProgress(0);
    setAltText(file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '));
    try {
      const url = await uploadImage(file);
      setImageUrl(url);
      setActiveTab('upload');
    } catch (err: any) {
      alert(err.message || 'Upload failed');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  }, [uploadImage]);

  // Handle drop on modal drop zone
  const handleModalDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      handleFileUpload(file);
    }
  }, [handleFileUpload]);

  // Insert and close modal
  const handleInsertFromModal = useCallback(() => {
    if (!imageUrl) return;
    insertImage(imageUrl, altText);
    setShowImageModal(false);
    setImageUrl('');
    setAltText('');
    setActiveTab('upload');
  }, [imageUrl, altText, insertImage]);

  // Insert from URL tab
  const handleInsertFromUrl = useCallback(() => {
    if (!imageUrl.trim()) return;
    try {
      const parsed = new URL(imageUrl.trim());
      if (!['http:', 'https:'].includes(parsed.protocol)) {
        alert('Please enter a valid image URL starting with http:// or https://');
        return;
      }
    } catch {
      alert('Please enter a valid image URL');
      return;
    }
    insertImage(imageUrl.trim(), altText);
    setShowImageModal(false);
    setImageUrl('');
    setAltText('');
    setActiveTab('upload');
  }, [imageUrl, altText, insertImage]);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        codeBlock: false,
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'editor-link',
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'editor-image',
        },
        allowBase64: false,
      }),
      CodeBlockLowlight.configure({
        lowlight,
      }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl focus:outline-none',
      },
      // Handle drop on editor
      handleDrop: (view, event, _slice, moved) => {
        if (moved) return false; // Let TipTap handle internal moves

        const file = event.dataTransfer?.files?.[0];
        if (!file || !file.type.startsWith('image/')) return false;

        event.preventDefault();
        setDragOverEditor(false);

        // Upload and insert at drop position
        (async () => {
          setUploading(true);
          setUploadProgress(0);
          try {
            const url = await uploadImage(file);
            const alt = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');

            // Get position from drop coordinates
            const pos = view.posAtCoords({ left: event.clientX, top: event.clientY });
            if (pos) {
              const { tr } = view.state;
              const node = view.state.schema.nodes.image.create({ src: url, alt });
              tr.insert(pos.pos, node);
              view.dispatch(tr);
            } else {
              // Fallback: insert at end
              const { tr } = view.state;
              const node = view.state.schema.nodes.image.create({ src: url, alt });
              tr.insert(tr.doc.content.size, node);
              view.dispatch(tr);
            }
          } catch (err: any) {
            alert(err.message || 'Upload failed');
          } finally {
            setUploading(false);
            setUploadProgress(0);
          }
        })();

        return true;
      },
      // Handle paste images
      handlePaste: (view, event) => {
        const items = event.clipboardData?.items;
        if (!items) return false;

        for (const item of Array.from(items)) {
          if (item.type.startsWith('image/')) {
            event.preventDefault();
            const file = item.getAsFile();
            if (!file) return false;

            (async () => {
              setUploading(true);
              setUploadProgress(0);
              try {
                const url = await uploadImage(file);
                const alt = 'Pasted image';
                view.dispatch(
                  view.state.tr.replaceSelectionWith(
                    view.state.schema.nodes.image.create({ src: url, alt })
                  )
                );
              } catch (err: any) {
                alert(err.message || 'Upload failed');
              } finally {
                setUploading(false);
                setUploadProgress(0);
              }
            })();

            return true;
          }
        }

        return false;
      },
    },
  });

  if (!editor) {
    return null;
  }

  const isValidUrl = (url: string): boolean => {
    try {
      const parsed = new URL(url);
      return ['http:', 'https:', 'mailto:'].includes(parsed.protocol);
    } catch {
      return false;
    }
  };

  const addLink = () => {
    const url = window.prompt('Enter URL');
    if (url) {
      if (!isValidUrl(url)) {
        alert('Please enter a valid URL starting with http:// or https://');
        return;
      }
      editor.chain().focus().setLink({ href: url }).run();
    }
  };

  return (
    <div className={styles.editor}>
      <div className={styles.toolbar}>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={editor.isActive('bold') ? styles.active : ''}
          title="Bold"
        >
          <HiBold size={18} />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={editor.isActive('italic') ? styles.active : ''}
          title="Italic"
        >
          <HiItalic size={18} />
        </button>

        <div className={styles.divider} />

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={editor.isActive('heading', { level: 2 }) ? styles.active : ''}
          title="Heading 2"
        >
          H2
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={editor.isActive('heading', { level: 3 }) ? styles.active : ''}
          title="Heading 3"
        >
          H3
        </button>

        <div className={styles.divider} />

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={editor.isActive('bulletList') ? styles.active : ''}
          title="Bullet List"
        >
          <HiListBullet size={18} />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={editor.isActive('orderedList') ? styles.active : ''}
          title="Numbered List"
        >
          <span style={{ fontSize: '14px', fontWeight: 'bold' }}>1.</span>
        </button>

        <div className={styles.divider} />

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={editor.isActive('blockquote') ? styles.active : ''}
          title="Quote"
        >
          <span style={{ fontSize: '16px', fontWeight: 'bold' }}>&ldquo;</span>
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          className={editor.isActive('codeBlock') ? styles.active : ''}
          title="Code Block"
        >
          <HiCodeBracket size={18} />
        </button>

        <div className={styles.divider} />

        <button
          type="button"
          onClick={addLink}
          className={editor.isActive('link') ? styles.active : ''}
          title="Add Link"
        >
          <HiLink size={18} />
        </button>

        <button
          type="button"
          onClick={() => setShowImageModal(true)}
          title="Insert Image"
          className={styles.imageBtn}
        >
          <HiPhoto size={18} />
        </button>
      </div>

      {/* Editor Content with drag overlay */}
      <div
        className={styles.contentWrapper}
        onDragEnter={(e) => {
          e.preventDefault();
          if (e.dataTransfer.types.includes('Files')) {
            setDragOverEditor(true);
          }
        }}
        onDragOver={(e) => {
          e.preventDefault();
          if (e.dataTransfer.types.includes('Files')) {
            setDragOverEditor(true);
          }
        }}
        onDragLeave={(e) => {
          if (e.currentTarget === e.target || !e.currentTarget.contains(e.relatedTarget as Node)) {
            setDragOverEditor(false);
          }
        }}
        onDrop={() => setDragOverEditor(false)}
      >
        <EditorContent editor={editor} className={styles.content} />

        {/* Drag overlay */}
        {dragOverEditor && (
          <div className={styles.dragOverlay}>
            <div className={styles.dragOverlayContent}>
              <HiArrowUpTray size={32} />
              <span>Drop image here</span>
            </div>
          </div>
        )}

        {/* Upload progress bar */}
        {uploading && (
          <div className={styles.uploadBar}>
            <div className={styles.uploadBarProgress} style={{ width: `${uploadProgress}%` }} />
            <span className={styles.uploadBarText}>Uploading image...</span>
          </div>
        )}
      </div>

      {/* Image Upload Modal */}
      {showImageModal && (
        <div className={styles.modalOverlay} onClick={() => setShowImageModal(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>Insert Image</h3>
              <button
                type="button"
                onClick={() => {
                  setShowImageModal(false);
                  setImageUrl('');
                  setAltText('');
                }}
                className={styles.modalClose}
              >
                <HiXMark size={20} />
              </button>
            </div>

            {/* Tabs */}
            <div className={styles.tabs}>
              <button
                type="button"
                className={`${styles.tab} ${activeTab === 'upload' ? styles.tabActive : ''}`}
                onClick={() => setActiveTab('upload')}
              >
                <HiArrowUpTray size={16} />
                Upload
              </button>
              <button
                type="button"
                className={`${styles.tab} ${activeTab === 'url' ? styles.tabActive : ''}`}
                onClick={() => setActiveTab('url')}
              >
                <HiGlobeAlt size={16} />
                URL
              </button>
            </div>

            {/* Tab Content */}
            <div className={styles.modalBody}>
              {activeTab === 'upload' && (
                <>
                  {/* Drop Zone */}
                  {!imageUrl && (
                    <div
                      className={`${styles.dropZone} ${isDraggingOver ? styles.dropZoneActive : ''}`}
                      onDragOver={(e) => { e.preventDefault(); setIsDraggingOver(true); }}
                      onDragLeave={() => setIsDraggingOver(false)}
                      onDrop={handleModalDrop}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className={styles.fileInput}
                        title="Choose image file"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleFileUpload(file);
                          e.target.value = '';
                        }}
                      />
                      {uploading ? (
                        <div className={styles.uploadingState}>
                          <div className={styles.progressRing}>
                            <div className={styles.progressSpinner} />
                          </div>
                          <span>Uploading...</span>
                        </div>
                      ) : (
                        <>
                          <div className={styles.dropZoneIcon}>
                            <HiArrowUpTray size={28} />
                          </div>
                          <span className={styles.dropZoneText}>
                            Drag & drop an image here
                          </span>
                          <span className={styles.dropZoneHint}>
                            or click to browse — max 5MB
                          </span>
                        </>
                      )}
                    </div>
                  )}

                  {/* Preview after upload */}
                  {imageUrl && activeTab === 'upload' && (
                    <div className={styles.uploadPreview}>
                      <img src={imageUrl} alt={altText || 'Preview'} />
                      <button
                        type="button"
                        className={styles.removePreview}
                        title="Remove image"
                        onClick={() => { setImageUrl(''); setAltText(''); }}
                      >
                        <HiXMark size={16} />
                      </button>
                    </div>
                  )}
                </>
              )}

              {activeTab === 'url' && (
                <div className={styles.urlForm}>
                  <label className={styles.modalLabel}>Image URL</label>
                  <input
                    type="url"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://example.com/image.jpg"
                    className={styles.modalInput}
                    autoFocus
                  />
                  {imageUrl && isValidUrl(imageUrl) && imageUrl.startsWith('http') && (
                    <div className={styles.urlPreview}>
                      <img
                        src={imageUrl}
                        alt="Preview"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                        onLoad={(e) => { (e.target as HTMLImageElement).style.display = 'block'; }}
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Alt Text — always visible when there's an image */}
              {(imageUrl || activeTab === 'url') && (
                <div className={styles.altTextGroup}>
                  <label className={styles.modalLabel}>Alt Text <span className={styles.optional}>(accessibility)</span></label>
                  <input
                    type="text"
                    value={altText}
                    onChange={(e) => setAltText(e.target.value)}
                    placeholder="Describe the image..."
                    className={styles.modalInput}
                  />
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className={styles.modalFooter}>
              <button
                type="button"
                className={styles.modalCancelBtn}
                onClick={() => {
                  setShowImageModal(false);
                  setImageUrl('');
                  setAltText('');
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                className={styles.modalInsertBtn}
                disabled={!imageUrl || uploading}
                onClick={activeTab === 'upload' ? handleInsertFromModal : handleInsertFromUrl}
              >
                <HiPhoto size={16} />
                Insert Image
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
