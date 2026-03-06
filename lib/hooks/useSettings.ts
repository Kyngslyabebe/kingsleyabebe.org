import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';

export interface PortfolioSettings {
  name: string;
  title: string;
  tagline: string;
  bio: string;
  avatar: string;
  summary: string;
  email: string;
  phone: string;
  location: string;
  github: string;
  linkedin: string;
  twitter: string;
  website: string;
  years_experience: string;
  total_projects: string;
  technologies_count: string;
  clients_served: string;
  resume_url: string;
  availability: string;
  hourly_rate: string;
  show_years_experience: boolean;
  show_total_projects: boolean;
  show_technologies_count: boolean;
  show_clients_served: boolean;
  show_availability: boolean;
  show_hourly_rate: boolean;
  meta_title: string;
  meta_description: string;
  meta_keywords: string;
  og_image: string;
  favicon: string;
  maintenance_mode: boolean;
  maintenance_message: string;
  maintenance_eta: string;
  show_projects: boolean;
  show_skills: boolean;
  show_experience: boolean;
  show_services: boolean; // ADD THIS
  show_blog: boolean;
  contact_form_enabled: boolean;
  email_notifications: boolean;
  google_analytics_id: string;
  brand_color: string;
  accent_color: string;
  about_title: string;
  projects_title: string;
  skills_title: string;
  experience_title: string;
  contact_title: string;
  blog_title: string;
  services_title: string;
  services_subtitle: string;
  showcase_title: string;
  showcase_subtitle: string;
  hero_cta_text: string;
  hero_cta_color: string;
  reviews_title: string;
  reviews_subtitle: string;
  reviews_bg_url: string;
  reviews_bg_overlay_opacity: number;
  trend_years_experience: string;
  trend_total_projects: string;
  trend_technologies_count: string;
  trend_clients_served: string;
  trend_availability: string;
  trend_hourly_rate: string;
  hero_bg_type: 'none' | 'image' | 'video';
  hero_bg_url: string;
  hero_bg_overlay_opacity: number;
  contact_bg_type: 'none' | 'image' | 'video';
  contact_bg_url: string;
  contact_bg_overlay_opacity: number;
}

const defaultSettings: PortfolioSettings = {
  name: 'Kingsley Abebe',
  title: 'Full-Stack Software Engineer',
  tagline: 'Building scalable web applications',
  bio: '',
  avatar: '',
  summary: '',
  email: 'kingsleyabebe@hotmail.com',
  phone: '301-674-0120',
  location: 'Bowie, MD',
  github: 'https://github.com/kingsleyabebe',
  linkedin: 'https://linkedin.com/in/kingsleyabebe',
  twitter: '',
  website: 'https://kingsleyabebe.org',
  years_experience: '4',
  total_projects: '50',
  technologies_count: '25',
  clients_served: '30',
  resume_url: '',
  availability: 'available',
  hourly_rate: '',
  show_years_experience: true,
  show_total_projects: true,
  show_technologies_count: true,
  show_clients_served: true,
  show_availability: true,
  show_hourly_rate: true,
  meta_title: 'Kingsley Abebe -  Software Engineer',
  meta_description: 'Professional portfolio showcasing web development projects',
  meta_keywords: '',
  og_image: '',
  favicon: '',
  maintenance_mode: false,
  maintenance_message: '',
  maintenance_eta: '',
  show_projects: true,
  show_skills: true,
  show_experience: true,
  show_services: false, 
  show_blog: true,
  contact_form_enabled: true,
  email_notifications: true,
  google_analytics_id: '',
  brand_color: '#4A90E2',
  accent_color: '#667eea',
  about_title: 'About Me',
  projects_title: 'Projects',
  skills_title: 'Technical Skills',
  experience_title: 'Experience & Impact',
  contact_title: 'Get In Touch',
  blog_title: 'Blog',
  services_title: 'Build Your Next Project',
  services_subtitle: 'Professional web development for startups and businesses',
  showcase_title: 'Currently Building InfinitBooking Platform',
  showcase_subtitle: '',
  hero_cta_text: '',
  hero_cta_color: '',
  reviews_title: 'Client Reviews',
  reviews_subtitle: 'What people say about working with me',
  reviews_bg_url: '',
  reviews_bg_overlay_opacity: 0.7,
  trend_years_experience: '',
  trend_total_projects: '',
  trend_technologies_count: '',
  trend_clients_served: '',
  trend_availability: '',
  trend_hourly_rate: '',
  hero_bg_type: 'none',
  hero_bg_url: '',
  hero_bg_overlay_opacity: 0.6,
  contact_bg_type: 'none',
  contact_bg_url: '',
  contact_bg_overlay_opacity: 0.7,
};

const CACHE_KEY = 'portfolio_settings_cache';
const CACHE_DURATION = 1000 * 60 * 5; // 5 minutes

export function useSettings() {
  const [settings, setSettings] = useState<PortfolioSettings>(() => {
    if (typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem(CACHE_KEY);
        if (cached) {
          const { data, timestamp } = JSON.parse(cached);
          if (Date.now() - timestamp < CACHE_DURATION) {
            return data;
          }
        }
      } catch (e) {
        console.error('Cache read error:', e);
      }
    }
    return defaultSettings;
  });
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadSettings();
  }, []);

  async function loadSettings() {
    try {
      const { data, error } = await supabase
        .from('personal_info')
        .select('*')
        .single();

      if (error) {
        console.error('Error loading settings:', error);
        setSettings(defaultSettings);
      } else if (data) {
        const newSettings = {
          ...defaultSettings,
          ...data
        };
        setSettings(newSettings);
        
        if (typeof window !== 'undefined') {
          try {
            localStorage.setItem(CACHE_KEY, JSON.stringify({
              data: newSettings,
              timestamp: Date.now()
            }));
          } catch (e) {
            console.error('Cache write error:', e);
          }
        }
      }
    } catch (err) {
      console.error('Error:', err);
      setError('Failed to load settings');
      setSettings(defaultSettings);
    } finally {
      setLoading(false);
    }
  }

  return { settings, loading, error, refresh: loadSettings };
}