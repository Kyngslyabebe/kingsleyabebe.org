'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';

type Theme = 'light' | 'dark';
type ThemeMode = 'default' | 'force-dark' | 'force-light';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
  themeMode: ThemeMode;
  isToggleVisible: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Resolve local theme synchronously so we can render immediately
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('portfolio-theme') as Theme;
      if (saved === 'light' || saved === 'dark') return saved;
    }
    return 'dark';
  });
  const [themeMode, setThemeMode] = useState<ThemeMode>('default');
  const [mounted, setMounted] = useState(false);

  // Apply theme to DOM immediately on mount (no await)
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    setMounted(true);

    // Fetch admin theme preference in the background
    supabase
      .from('personal_info')
      .select('theme_mode')
      .single()
      .then(({ data }) => {
        const adminThemeMode: ThemeMode = data?.theme_mode || 'default';
        setThemeMode(adminThemeMode);

        let resolvedTheme: Theme;
        if (adminThemeMode === 'force-dark') {
          resolvedTheme = 'dark';
        } else if (adminThemeMode === 'force-light') {
          resolvedTheme = 'light';
        } else {
          return; // already using local/default theme
        }

        // Only update if admin forces a different theme
        setThemeState(resolvedTheme);
        document.documentElement.setAttribute('data-theme', resolvedTheme);
      });
  }, []);

  const setTheme = (newTheme: Theme) => {
    if (themeMode === 'default') {
      document.documentElement.setAttribute('data-theme', newTheme);
      setThemeState(newTheme);
      localStorage.setItem('portfolio-theme', newTheme);
    }
  };

  const toggleTheme = () => {
    if (themeMode === 'default') {
      setTheme(theme === 'light' ? 'dark' : 'light');
    }
  };

  const isToggleVisible = themeMode === 'default';

  if (!mounted) {
    return null;
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme, themeMode, isToggleVisible }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}