'use client';
export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { 
  HiHome, 
  HiRectangleGroup, 
  HiCodeBracket, 
  HiBriefcase, 
  HiEnvelope, 
  HiCog6Tooth,
  HiArrowRightOnRectangle,
  HiSun,
  HiMoon,
  HiPhoto,
  HiNewspaper
} from 'react-icons/hi2';
import { supabase } from '@/lib/supabase/client';
import { useTheme } from '@/components/theme/ThemeProvider';
import styles from './AdminLayout.module.css';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  async function checkAuth() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }
      setUser(user);
    } catch (error) {
      console.error('Auth error:', error);
      router.push('/login');
    } finally {
      setLoading(false);
    }
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push('/login');
  }

  const navItems = [
    { icon: HiHome, label: 'Dashboard', href: '/admin' },
    { icon: HiRectangleGroup, label: 'Projects', href: '/admin/projects' },
    { icon: HiCodeBracket, label: 'Skills', href: '/admin/skills' },
    { icon: HiBriefcase, label: 'Experience', href: '/admin/experience' },
    { icon: HiNewspaper, label: 'Blogs', href: '/admin/blogs' },
    { icon: HiPhoto, label: 'Showcase', href: '/admin/showcase' },
    { icon: HiEnvelope, label: 'Messages', href: '/admin/messages' },
    { icon: HiCog6Tooth, label: 'Settings', href: '/admin/settings' },
  ];

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner} />
      </div>
    );
  }

  return (
    <div className={styles.adminContainer}>
      {/* Compact Header */}
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.logo}>Admin</h1>
          <div className={styles.headerActions}>
            {/* Theme Toggle Button */}
            <button 
              onClick={toggleTheme}
              className={styles.themeToggle}
              title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            >
              {theme === 'light' ? <HiMoon size={18} /> : <HiSun size={18} />}
            </button>
            
           <button 
  onClick={() => window.open('/', '_blank')}
  className={styles.viewSiteBtn}
>
  View Site
</button>
            <button onClick={handleSignOut} className={styles.signOutBtn}>
              <HiArrowRightOnRectangle size={18} />
            </button>
          </div>
        </div>
      </header>

      {/* Top Nav Pills */}
      <nav className={styles.topNav}>
        <div className={styles.navScroll}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <button
                key={item.href}
                onClick={() => router.push(item.href)}
                className={`${styles.navPill} ${isActive ? styles.navPillActive : ''}`}
              >
                <Icon size={16} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Main Content */}
      <main className={styles.mainContent}>
        {children}
      </main>

      {/* Mobile Bottom Nav */}
      <nav className={styles.mobileNav}>
        {navItems.slice(0, 5).map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <button
              key={item.href}
              onClick={() => router.push(item.href)}
              className={`${styles.mobileNavItem} ${isActive ? styles.mobileNavItemActive : ''}`}
            >
              <Icon size={20} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}