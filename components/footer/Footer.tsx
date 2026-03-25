'use client';

import Link from 'next/link';
import { useSettings } from '@/lib/hooks/useSettings';
import styles from './Footer.module.css';

export default function Footer() {
  const { settings } = useSettings();
  const currentYear = new Date().getFullYear();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className={styles.footer}>
      <div className={styles.footerContent}>
        {/* Quick Links */}
        <div className={styles.footerLinks}>
          <a href="#home" onClick={scrollToTop}>Home</a>
          <a href="#about">About</a>
          {settings.show_projects && <a href="#projects">Projects</a>}
          {settings.show_skills && <a href="#skills">Skills</a>}
          {settings.show_experience && <a href="#experience">Experience</a>}
          <Link href="/blogs">Blog</Link>
          <a href="#contact">Contact</a>
        </div>

        {/* Legal Links */}
        <div className={styles.footerLegal}>
          <Link href="/privacy-policy">Privacy Policy</Link>
          <span className={styles.separator}>•</span>
          <Link href="/terms-of-service">Terms of Service</Link>
        </div>

        {/* Copyright */}
        <div className={styles.footerCopyright}>
          <p>© {currentYear} {settings.name || 'Kingsley Abebe'}. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}