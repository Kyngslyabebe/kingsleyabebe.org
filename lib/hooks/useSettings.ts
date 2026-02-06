import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';

export interface PortfolioSettings {
  // Profile
  name: string;
  title: string;
  tagline: string;
  bio: string;
  avatar: string;
  summary: string;
  
  // Contact
  email: string;
  phone: string;
  location: string;
  github: string;
  linkedin: string;
  twitter: string;
  website: string;
  
  // Professional
  years_experience: string;
  total_projects: string;
  technologies_count: string;
  clients_served: string;
  resume_url: string;
  availability: string;
  hourly_rate: string;
  
  // SEO
  meta_title: string;
  meta_description: string;
  meta_keywords: string;
  og_image: string;
  favicon: string;
  
  // Maintenance
  maintenance_mode: boolean;
  maintenance_message: string;
  maintenance_eta: string;
  
  // Advanced
  show_projects: boolean;
  show_skills: boolean;
  show_experience: boolean;
  contact_form_enabled: boolean;
  email_notifications: boolean;
  google_analytics_id: string;
  brand_color: string;
  accent_color: string;
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
  location: 'Capitol Heights, MD',
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
  meta_title: 'Kingsley Abebe - Full-Stack Software Engineer',
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
  contact_form_enabled: true,
  email_notifications: true,
  google_analytics_id: '',
  brand_color: '#4A90E2',
  accent_color: '#667eea'
};

export function useSettings() {
  const [settings, setSettings] = useState<PortfolioSettings>(defaultSettings);
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
        // Use defaults if no settings found
        setSettings(defaultSettings);
      } else if (data) {
        // Merge with defaults to handle missing fields
        setSettings({
          ...defaultSettings,
          ...data
        });
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