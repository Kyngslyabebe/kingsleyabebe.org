'use client';
export const dynamic = 'force-dynamic';

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
  const [theme, setThemeState] = useState<Theme>('dark');
  const [themeMode, setThemeMode] = useState<ThemeMode>('default');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    async function initializeTheme() {
      setMounted(true);

      // Fetch admin theme preference
      const { data } = await supabase
        .from('personal_info')
        .select('theme_mode')
        .single();

      const adminThemeMode: ThemeMode = data?.theme_mode || 'default';
      setThemeMode(adminThemeMode);

      let initialTheme: Theme;

      if (adminThemeMode === 'force-dark') {
        initialTheme = 'dark';
      } else if (adminThemeMode === 'force-light') {
        initialTheme = 'light';
      } else {
        // Default mode - check localStorage or system preference
        const savedTheme = localStorage.getItem('portfolio-theme') as Theme;
        if (savedTheme) {
          initialTheme = savedTheme;
        } else {
          const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
          initialTheme = prefersDark ? 'dark' : 'light';
        }
      }

      setThemeState(initialTheme);
      document.documentElement.setAttribute('data-theme', initialTheme);
    }

    initializeTheme();
  }, []);

  const setTheme = (newTheme: Theme) => {
    // Only allow theme changes if admin hasn't forced a theme
    if (themeMode === 'default') {
      document.documentElement.setAttribute('data-theme', newTheme);
      setThemeState(newTheme);
      localStorage.setItem('portfolio-theme', newTheme);
    }
  };

  const toggleTheme = () => {
    // Only allow toggling if admin hasn't forced a theme
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