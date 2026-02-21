'use client';
export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  HiArrowRightOnRectangle,
  HiSun,
  HiMoon,
  HiBars3
} from 'react-icons/hi2';
import { supabase } from '@/lib/supabase/client';
import { useTheme } from '@/components/theme/ThemeProvider';
import Sidebar from './Sidebar';
import styles from './AdminLayout.module.css';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    checkAuth();
    // Load sidebar collapsed state
    const savedCollapsed = localStorage.getItem('admin-sidebar-collapsed');
    if (savedCollapsed !== null) {
      setSidebarCollapsed(JSON.parse(savedCollapsed));
    }
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

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner} />
      </div>
    );
  }

  return (
    <div className={styles.adminContainer}>
      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onCollapsedChange={setSidebarCollapsed}
      />

      {/* Main Wrapper */}
      <div className={`${styles.mainWrapper} ${sidebarCollapsed ? styles.mainWrapperCollapsed : ''}`}>
        {/* Header */}
        <header className={styles.header}>
          <div className={styles.headerContent}>
            {/* Mobile Menu Button */}
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className={styles.mobileMenuBtn}
              title="Open menu"
            >
              <HiBars3 size={24} />
            </button>

            <h1 className={styles.logo}>Admin</h1>

            <div className={styles.headerActions}>
              {/* Theme Toggle Button */}
              <button
                type="button"
                onClick={toggleTheme}
                className={styles.themeToggle}
                title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
              >
                {theme === 'light' ? <HiMoon size={18} /> : <HiSun size={18} />}
              </button>

              <button
                type="button"
                onClick={() => window.open('/', '_blank')}
                className={styles.viewSiteBtn}
              >
                View Site
              </button>
              <button type="button" onClick={handleSignOut} className={styles.signOutBtn} title="Sign out">
                <HiArrowRightOnRectangle size={18} />
              </button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className={styles.mainContent}>
          {children}
        </main>
      </div>
    </div>
  );
}