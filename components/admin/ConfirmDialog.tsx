'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { HiXMark, HiExclamationTriangle, HiInformationCircle, HiCheckCircle } from 'react-icons/hi2';
import styles from './ConfirmDialog.module.css';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
  variant?: 'danger' | 'warning' | 'info' | 'success';
  loading?: boolean;
}

export default function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  variant = 'danger',
  loading = false
}: ConfirmDialogProps) {
  
  const icons = {
    danger: HiExclamationTriangle,
    warning: HiExclamationTriangle,
    info: HiInformationCircle,
    success: HiCheckCircle
  };

  const Icon = icons[variant];

  const handleConfirm = async () => {
    await onConfirm();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onCancel();
    } else if (e.key === 'Enter' && !loading) {
      handleConfirm();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className={styles.overlay}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onCancel}
          onKeyDown={handleKeyDown}
          tabIndex={-1}
        >
          <motion.div
            className={styles.dialog}
            initial={{ scale: 0.9, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, y: 20, opacity: 0 }}
            transition={{ type: 'spring', duration: 0.3 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button 
              onClick={onCancel}
              className={styles.closeBtn}
              disabled={loading}
            >
              <HiXMark size={20} />
            </button>

            {/* Icon */}
            <div className={`${styles.iconWrapper} ${styles[`icon${variant.charAt(0).toUpperCase() + variant.slice(1)}`]}`}>
              <Icon size={32} />
            </div>

            {/* Content */}
            <div className={styles.content}>
              <h2 className={styles.title}>{title}</h2>
              <p className={styles.message}>{message}</p>
            </div>

            {/* Actions */}
            <div className={styles.actions}>
              <button 
                onClick={onCancel}
                className={styles.cancelBtn}
                disabled={loading}
              >
                {cancelText}
              </button>
              <button 
                onClick={handleConfirm}
                className={`${styles.confirmBtn} ${styles[`confirmBtn${variant.charAt(0).toUpperCase() + variant.slice(1)}`]}`}
                disabled={loading}
              >
                {loading ? 'Processing...' : confirmText}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}