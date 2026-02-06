'use client';

import { useState, useRef } from 'react';
import { supabase } from '@/lib/supabase/client';
import { HiCloudArrowUp, HiXMark, HiPhoto } from 'react-icons/hi2';
import styles from './FileUpload.module.css';

interface FileUploadProps {
  onUploadComplete: (url: string) => void;
  currentFileUrl?: string;
  accept?: string;
  folder?: string;
  maxSize?: number;
  bucket?: string; 
}

export function FileUpload({
  onUploadComplete,
  currentFileUrl,
  accept = 'image/*',
  folder = 'uploads',
  maxSize = 5, 
  bucket = 'portfolio-assets'  
}: FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function uploadFile(file: File) {
    try {
      setError('');
      setUploading(true);
      setProgress(0);

      // Validate file size
      if (file.size > maxSize * 1024 * 1024) {
        throw new Error(`File size must be less than ${maxSize}MB`);
      }

      // Create unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90));
      }, 100);

      // Upload to Supabase Storage - USE BUCKET PROP
      const { data, error: uploadError } = await supabase.storage
        .from(bucket) 
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      clearInterval(progressInterval);

      if (uploadError) throw uploadError;

      // Get public URL - USE BUCKET PROP
      const { data: { publicUrl } } = supabase.storage
        .from(bucket)  
        .getPublicUrl(fileName);

      setProgress(100);
      onUploadComplete(publicUrl);
      
      setTimeout(() => {
        setUploading(false);
        setProgress(0);
      }, 500);
    } catch (err: any) {
      console.error('Upload error:', err);
      setError(err.message || 'Failed to upload file');
      setUploading(false);
      setProgress(0);
    }
  }

  function handleDrag(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      uploadFile(e.dataTransfer.files[0]);
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      uploadFile(e.target.files[0]);
    }
  }

  function handleButtonClick() {
    fileInputRef.current?.click();
  }

  function handleRemove() {
    onUploadComplete('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }

  return (
    <div className={styles.container}>
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleChange}
        className={styles.hiddenInput}
      />

      {currentFileUrl && !uploading ? (
        <div className={styles.preview}>
          <div className={styles.previewImage}>
            <img src={currentFileUrl} alt="Preview" />
          </div>
          <button
            type="button"
            onClick={handleRemove}
            className={styles.removeBtn}
            title="Remove"
          >
            <HiXMark size={16} />
          </button>
        </div>
      ) : (
        <div
          className={`${styles.dropzone} ${dragActive ? styles.dragActive : ''} ${uploading ? styles.uploading : ''}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={handleButtonClick}
        >
          {uploading ? (
            <div className={styles.uploadingState}>
              <div className={styles.progressCircle}>
                <svg viewBox="0 0 36 36" className={styles.circularChart}>
                  <path
                    className={styles.circleBg}
                    d="M18 2.0845
                      a 15.9155 15.9155 0 0 1 0 31.831
                      a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className={styles.circle}
                    strokeDasharray={`${progress}, 100`}
                    d="M18 2.0845
                      a 15.9155 15.9155 0 0 1 0 31.831
                      a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <span className={styles.progressText}>{progress}%</span>
              </div>
              <p>Uploading...</p>
            </div>
          ) : (
            <>
              <HiCloudArrowUp size={48} className={styles.icon} />
              <p className={styles.mainText}>
                <span className={styles.highlight}>Click to upload</span> or drag and drop
              </p>
              <p className={styles.subText}>
                {accept === 'image/*' ? 'PNG, JPG, GIF, WebP' : accept} (max {maxSize}MB)
              </p>
            </>
          )}
        </div>
      )}

      {error && (
        <div className={styles.error}>
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}