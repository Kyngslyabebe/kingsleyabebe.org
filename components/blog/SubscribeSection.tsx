'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiEnvelope, HiCheckCircle, HiSparkles } from 'react-icons/hi2';
import styles from './SubscribeSection.module.css';

export default function SubscribeSection() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || status === 'loading') return;

    setStatus('loading');
    setMessage('');

    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        setStatus('error');
        setMessage(data.error || 'Something went wrong. Please try again.');
      } else {
        setStatus('success');
        setMessage(data.message || 'You\'re now subscribed!');
        setEmail('');
      }
    } catch {
      setStatus('error');
      setMessage('Network error. Please try again.');
    }
  }

  return (
    <motion.section
      className={styles.section}
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Glow backdrop */}
      <div className={styles.glow} aria-hidden />

      <div className={styles.inner}>
        <AnimatePresence mode="wait">
          {status === 'success' ? (
            <motion.div
              key="success"
              className={styles.successState}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.4 }}
            >
              <div className={styles.successIcon}>
                <HiCheckCircle size={40} />
              </div>
              <h3 className={styles.successTitle}>You're in!</h3>
              <p className={styles.successMessage}>
                Check your inbox for a welcome message. I'll notify you every time I publish something new.
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {/* Header */}
              <div className={styles.header}>
                <div className={styles.badge}>
                  <HiSparkles size={13} />
                  <span>Newsletter</span>
                </div>
                <h2 className={styles.title}>Stay in the Loop</h2>
                <p className={styles.subtitle}>
                  Get notified whenever I publish — code and tech, lifestyle,
                  and everything in between that's worth writing about.
                  No spam — ever.
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className={styles.form} noValidate>
               <div className={styles.inputWrapper}>
  <div className={styles.inputField}>
    <HiEnvelope className={styles.inputIcon} size={18} />
    <input
      type="email"
      value={email}
      onChange={e => setEmail(e.target.value)}
      placeholder="your@email.com"
      className={styles.input}
      disabled={status === 'loading'}
      required
      aria-label="Email address"
    />
  </div>
                  <button
                    type="submit"
                    disabled={status === 'loading' || !email.trim()}
                    className={styles.submitBtn}
                  >
                    {status === 'loading' ? (
                      <span className={styles.spinner} />
                    ) : (
                      'Subscribe'
                    )}
                  </button>
                </div>

                <AnimatePresence>
                  {status === 'error' && (
                    <motion.p
                      className={styles.errorMsg}
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                    >
                      {message}
                    </motion.p>
                  )}
                </AnimatePresence>
              </form>

              {/* Trust line */}
              <p className={styles.trustLine}>
                Unsubscribe anytime · No spam · Only quality content
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.section>
  );
}
