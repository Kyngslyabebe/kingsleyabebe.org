'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { HiSun, HiMoon } from 'react-icons/hi2';
import { useTheme } from './ThemeProvider';
import styles from './ThemeToggle.module.css';

export function ThemeToggle() {
  const { theme, toggleTheme, isToggleVisible } = useTheme();

  // Hide toggle if admin has forced a theme
  if (!isToggleVisible) {
    return null;
  }

  return (
    <motion.button
      onClick={toggleTheme}
      className={styles.themeToggle}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      aria-label="Toggle theme"
    >
      {theme === 'light' ? (
        <HiMoon size={20} />
      ) : (
        <HiSun size={20} />
      )}
    </motion.button>
  );
}