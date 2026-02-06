'use client';

import { motion } from 'framer-motion';
import styles from './LoadingScreen.module.css';

interface LoadingScreenProps {
  name?: string;
}

export default function LoadingScreen({ name = "Portfolio" }: LoadingScreenProps) {
  return (
    <div className={styles.loadingContainer}>
      <div className={styles.loadingContent}>
        {/* Animated Logo */}
        <motion.div
          className={styles.logoWrapper}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className={styles.logo}>
            {name.split(' ').map(n => n[0]).join('') || 'KA'}
          </div>
          
          {/* Spinning Ring */}
      <div className={styles.spinnerRing} />
        </motion.div>

        {/* Loading Text */}
        <motion.div
          className={styles.loadingText}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className={styles.loadingTitle}>Loading {name}'s Portfolio</h2>
          
          {/* Animated Dots */}
          <div className={styles.dotsContainer}>
            <motion.span
              className={styles.dot}
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 1.4, repeat: Infinity, delay: 0 }}
            />
            <motion.span
              className={styles.dot}
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 1.4, repeat: Infinity, delay: 0.2 }}
            />
            <motion.span
              className={styles.dot}
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 1.4, repeat: Infinity, delay: 0.4 }}
            />
          </div>
        </motion.div>

        {/* Progress Bar */}
        <motion.div
          className={styles.progressBarContainer}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <motion.div
            className={styles.progressBar}
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: 2, ease: "easeInOut" }}
          />
        </motion.div>
      </div>

      {/* Background Gradient Animation */}
      <div className={styles.gradientBg}>
        <motion.div
          className={styles.gradientOrb1}
          animate={{
            x: [0, 100, 0],
            y: [0, -100, 0],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className={styles.gradientOrb2}
          animate={{
            x: [0, -100, 0],
            y: [0, 100, 0],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>
    </div>
  );
}