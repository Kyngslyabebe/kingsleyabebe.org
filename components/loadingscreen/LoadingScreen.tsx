'use client';
export const dynamic = 'force-dynamic';

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
          transition={{ 
            duration: 0.5,
            ease: "easeOut"
          }}
        >
          <div className={styles.logo}>
            {name.split(' ').map(n => n[0]).join('') || 'KA'}
          </div>
          
          {/* Spinning Ring - Use Framer Motion instead of CSS animation */}
          <motion.div 
            className={styles.spinnerRing}
            animate={{ rotate: 360 }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "linear"
            }}
          />
        </motion.div>

        {/* Loading Text */}
        <motion.div
          className={styles.loadingText}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ 
            delay: 0.2,
            duration: 0.4
          }}
        >
          <h2 className={styles.loadingTitle}>Loading {name}'s Webpage</h2>
          
          {/* Animated Dots */}
          <div className={styles.dotsContainer}>
            {[0, 0.15, 0.3].map((delay, i) => (
              <motion.span
                key={i}
                className={styles.dot}
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ 
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay
                }}
              />
            ))}
          </div>
        </motion.div>

        {/* Progress Bar */}
        <motion.div
          className={styles.progressBarContainer}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <motion.div
            className={styles.progressBar}
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ 
              duration: 2,
              ease: "easeInOut"
            }}
          />
        </motion.div>
      </div>

      {/* Simpler background - no orbs */}
      <div className={styles.gradientBg} />
    </div>
  );
}