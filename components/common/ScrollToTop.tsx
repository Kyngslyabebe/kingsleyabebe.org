'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiArrowUp } from 'react-icons/hi2';
import styles from './ScrollToTop.module.css';

export default function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      const scrolled = window.scrollY;
      const windowHeight = window.innerHeight;
      
      // Show button after scrolling down half a screen height
      if (scrolled > windowHeight * 0.5) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    // Check on mount
    toggleVisibility();

    // Add scroll listener
    window.addEventListener('scroll', toggleVisibility, { passive: true });
    
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          className={styles.scrollButton}
          onClick={scrollToTop}
          initial={{ opacity: 0, scale: 0.5, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.5, y: 20 }}
          whileHover={{ scale: 1.1, y: -4 }}
          whileTap={{ scale: 0.9 }}
          transition={{ 
            duration: 0.3,
            ease: "easeOut"
          }}
          aria-label="Scroll to top"
        >
          <motion.div
            className={styles.iconWrapper}
            animate={{ y: [0, -4, 0] }}
            transition={{ 
              duration: 1.5, 
              repeat: Infinity, 
              ease: "easeInOut",
              repeatDelay: 0.5
            }}
          >
            <HiArrowUp size={24} />
          </motion.div>
          
          {/* Animated ring */}
          <motion.div
            className={styles.ring}
            animate={{ 
              scale: [1, 1.3, 1], 
              opacity: [0.6, 0, 0.6] 
            }}
            transition={{ 
              duration: 2, 
              repeat: Infinity, 
              ease: "easeOut" 
            }}
          />
        </motion.button>
      )}
    </AnimatePresence>
  );
}