'use client';

import React from 'react';
import { HiSun, HiMoon } from 'react-icons/hi2';
import { useTheme } from './ThemeProvider';
import styles from './InlineThemeToggle.module.css';

export function InlineThemeToggle() {
  const { theme, toggleTheme, isToggleVisible } = useTheme();

  if (!isToggleVisible) return null;

  return (
    <button
      onClick={toggleTheme}
      className={styles.toggle}
      aria-label="Toggle theme"
      type="button"
    >
      <span className={`${styles.track} ${theme === 'light' ? styles.trackLight : ''}`}>
        <span className={`${styles.thumb} ${theme === 'light' ? styles.thumbLight : ''}`}>
          {theme === 'light' ? (
            <HiSun size={12} className={styles.icon} />
          ) : (
            <HiMoon size={12} className={styles.icon} />
          )}
        </span>
        <span className={styles.stars}>
          <span className={styles.star} />
          <span className={styles.star} />
          <span className={styles.star} />
        </span>
      </span>
    </button>
  );
}
