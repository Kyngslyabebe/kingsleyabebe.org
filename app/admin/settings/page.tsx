'use client';
export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { useToast } from '@/components/admin/Toast';
import {
  HiCheckCircle
} from 'react-icons/hi2';
import { FileUpload } from '@/components/admin/FileUpload';
import styles from './settings.module.css';

type TabType = 'profile' | 'contact' | 'professional' | 'seo' | 'maintenance' | 'appearance' | 'advanced';

export default function SettingsPage() {
  const { showToast } = useToast();
  const searchParams = useSearchParams();
  const activeTab = (searchParams.get('tab') as TabType) || 'profile';
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Profile
  const [name, setName] = useState('');
  const [title, setTitle] = useState('');
  const [tagline, setTagline] = useState('');
  const [bio, setBio] = useState('');
  const [avatar, setAvatar] = useState('');
  const [summary, setSummary] = useState('');
  
  // Contact
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [github, setGithub] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [twitter, setTwitter] = useState('');
  const [website, setWebsite] = useState('');
  
  // Professional
  const [yearsExperience, setYearsExperience] = useState('');
  const [totalProjects, setTotalProjects] = useState('');
  const [technologiesCount, setTechnologiesCount] = useState('');
  const [clientsServed, setClientsServed] = useState('');
  const [resumeUrl, setResumeUrl] = useState('');
  const [availability, setAvailability] = useState('available');
  const [hourlyRate, setHourlyRate] = useState('');
  const [trendYearsExperience, setTrendYearsExperience] = useState('');
  const [trendTotalProjects, setTrendTotalProjects] = useState('');
  const [trendTechnologiesCount, setTrendTechnologiesCount] = useState('');
  const [trendClientsServed, setTrendClientsServed] = useState('');
  const [trendAvailability, setTrendAvailability] = useState('');
  const [trendHourlyRate, setTrendHourlyRate] = useState('');
  
  // SEO
  const [metaTitle, setMetaTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [metaKeywords, setMetaKeywords] = useState('');
  const [ogImage, setOgImage] = useState('');
  const [favicon, setFavicon] = useState('');
  
  // Maintenance
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [maintenanceMessage, setMaintenanceMessage] = useState('');
  const [maintenanceEta, setMaintenanceEta] = useState('');
  
  // Advanced
  const [showProjects, setShowProjects] = useState(true);
  const [showSkills, setShowSkills] = useState(true);
  const [showExperience, setShowExperience] = useState(true);
  const [contactFormEnabled, setContactFormEnabled] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [googleAnalyticsId, setGoogleAnalyticsId] = useState('');
  const [brandColor, setBrandColor] = useState('#4A90E2');
  const [accentColor, setAccentColor] = useState('#667eea');
  const [showServices, setShowServices] = useState(false);
const [servicesTitle, setServicesTitle] = useState('Build Your Next Project');
const [servicesSubtitle, setServicesSubtitle] = useState('Professional web development for startups and businesses');
const [themeMode, setThemeMode] = useState<'default' | 'force-dark' | 'force-light'>('default');

  // Personal Details Visibility Toggles
const [showYearsExperience, setShowYearsExperience] = useState(true);
const [showTotalProjects, setShowTotalProjects] = useState(true);
const [showTechnologiesCount, setShowTechnologiesCount] = useState(true);
const [showClientsServed, setShowClientsServed] = useState(true);
const [showAvailability, setShowAvailability] = useState(true);
const [showHourlyRate, setShowHourlyRate] = useState(true);

// blog post visibility toggles (for future use
const [showBlog, setShowBlog] = useState(true);

// Section Headers
const [aboutTitle, setAboutTitle] = useState('About Me');
const [projectsTitle, setProjectsTitle] = useState('Projects');
const [skillsTitle, setSkillsTitle] = useState('Technical Skills');
const [experienceTitle, setExperienceTitle] = useState('Experience & Impact');
const [contactTitle, setContactTitle] = useState('Get In Touch');
const [blogTitle, setBlogTitle] = useState('Blog');

// Appearance
const [showcaseTitle, setShowcaseTitle] = useState('Currently Building InfinitBooking Platform');
const [reviewsTitle, setReviewsTitle] = useState('Client Reviews');
const [reviewsSubtitle, setReviewsSubtitle] = useState('What people say about working with me');
const [reviewsBgUrl, setReviewsBgUrl] = useState('');
const [reviewsBgOverlayOpacity, setReviewsBgOverlayOpacity] = useState(0.7);
const [heroBgType, setHeroBgType] = useState<'none' | 'image' | 'video'>('none');
const [heroBgUrl, setHeroBgUrl] = useState('');
const [heroBgOverlayOpacity, setHeroBgOverlayOpacity] = useState(0.6);
const [contactBgType, setContactBgType] = useState<'none' | 'image' | 'video'>('none');
const [contactBgUrl, setContactBgUrl] = useState('');
const [contactBgOverlayOpacity, setContactBgOverlayOpacity] = useState(0.7);

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
        // If no row exists, we'll use defaults
        setLoading(false);
        return;
      }

      if (data) {
        // Profile
        setName(data.name || '');
        setTitle(data.title || '');
        setTagline(data.tagline || '');
        setBio(data.bio || '');
        setAvatar(data.avatar || '');
        setSummary(data.summary || '');
        
        // Contact
        setEmail(data.email || '');
        setPhone(data.phone || '');
        setLocation(data.location || '');
        setGithub(data.github || '');
        setLinkedin(data.linkedin || '');
        setTwitter(data.twitter || '');
        setWebsite(data.website || '');
        
        // Professional
        setYearsExperience(data.years_experience || '');
        setTotalProjects(data.total_projects || '');
        setTechnologiesCount(data.technologies_count || '');
        setClientsServed(data.clients_served || '');
        setResumeUrl(data.resume_url || '');
        setAvailability(data.availability || 'available');
        setHourlyRate(data.hourly_rate || '');
        setTrendYearsExperience(data.trend_years_experience || '');
        setTrendTotalProjects(data.trend_total_projects || '');
        setTrendTechnologiesCount(data.trend_technologies_count || '');
        setTrendClientsServed(data.trend_clients_served || '');
        setTrendAvailability(data.trend_availability || '');
        setTrendHourlyRate(data.trend_hourly_rate || '');

        // SEO
        setMetaTitle(data.meta_title || '');
        setMetaDescription(data.meta_description || '');
        setMetaKeywords(data.meta_keywords || '');
        setOgImage(data.og_image || '');
        setFavicon(data.favicon || '');
        
        // Maintenance
        setMaintenanceMode(data.maintenance_mode || false);
        setMaintenanceMessage(data.maintenance_message || '');
        setMaintenanceEta(data.maintenance_eta || '');
        
        // Advanced
        setShowProjects(data.show_projects !== false);
        setShowSkills(data.show_skills !== false);
        setShowExperience(data.show_experience !== false);
        setContactFormEnabled(data.contact_form_enabled !== false);
        setEmailNotifications(data.email_notifications !== false);
        setGoogleAnalyticsId(data.google_analytics_id || '');
        setBrandColor(data.brand_color || '#4A90E2');
        setAccentColor(data.accent_color || '#667eea');

       
setShowYearsExperience(data.show_years_experience !== false);
setShowTotalProjects(data.show_total_projects !== false);
setShowTechnologiesCount(data.show_technologies_count !== false);
setShowClientsServed(data.show_clients_served !== false);
setShowAvailability(data.show_availability !== false);
setShowHourlyRate(data.show_hourly_rate !== false);


// blog post visibility toggles (for future use
setShowBlog(data.show_blog ?? true);


setShowServices(data.show_services ?? false);
setServicesTitle(data.services_title || 'Build Your Next Project');
setServicesSubtitle(data.services_subtitle || 'Professional web development for startups and businesses');

// Section Headers
setAboutTitle(data.about_title || 'About Me');
setProjectsTitle(data.projects_title || 'Projects');
setSkillsTitle(data.skills_title || 'Technical Skills');
setExperienceTitle(data.experience_title || 'Experience & Impact');
setContactTitle(data.contact_title || 'Get In Touch');
setBlogTitle(data.blog_title || 'Blog');
setThemeMode(data.theme_mode || 'default');

// Appearance
setShowcaseTitle(data.showcase_title || 'Currently Building InfinitBooking Platform');
setReviewsTitle(data.reviews_title || 'Client Reviews');
setReviewsSubtitle(data.reviews_subtitle || 'What people say about working with me');
setReviewsBgUrl(data.reviews_bg_url || '');
setReviewsBgOverlayOpacity(data.reviews_bg_overlay_opacity ?? 0.7);
setHeroBgType(data.hero_bg_type || 'none');
setHeroBgUrl(data.hero_bg_url || '');
setHeroBgOverlayOpacity(data.hero_bg_overlay_opacity ?? 0.6);
setContactBgType(data.contact_bg_type || 'none');
setContactBgUrl(data.contact_bg_url || '');
setContactBgOverlayOpacity(data.contact_bg_overlay_opacity ?? 0.7);
      }


    } catch (error) {
      console.error('Error loading settings:', error);
      showToast('Error loading settings', 'error');
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    setSaving(true);

    try {
      const settingsData = {
        // Profile
        name,
        title,
        tagline,
        bio,
        avatar,
        summary,
        
        // Contact
        email,
        phone,
        location,
        github,
        linkedin,
        twitter,
        website,
        
        // Professional
        years_experience: yearsExperience,
        total_projects: totalProjects,
        technologies_count: technologiesCount,
        clients_served: clientsServed,
        resume_url: resumeUrl,
        availability,
        hourly_rate: hourlyRate,
        trend_years_experience: trendYearsExperience,
        trend_total_projects: trendTotalProjects,
        trend_technologies_count: trendTechnologiesCount,
        trend_clients_served: trendClientsServed,
        trend_availability: trendAvailability,
        trend_hourly_rate: trendHourlyRate,

        // SEO
        meta_title: metaTitle,
        meta_description: metaDescription,
        meta_keywords: metaKeywords,
        og_image: ogImage,
        favicon,
        
        // Maintenance
        maintenance_mode: maintenanceMode,
        maintenance_message: maintenanceMessage,
        maintenance_eta: maintenanceEta,
        
        // Advanced
        show_projects: showProjects,
        show_skills: showSkills,
        show_experience: showExperience,
        contact_form_enabled: contactFormEnabled,
        email_notifications: emailNotifications,
        google_analytics_id: googleAnalyticsId,
        brand_color: brandColor,
        accent_color: accentColor,


         show_years_experience: showYearsExperience,
  show_total_projects: showTotalProjects,
  show_technologies_count: showTechnologiesCount,
  show_clients_served: showClientsServed,
  show_availability: showAvailability,
  show_hourly_rate: showHourlyRate,

  //blog
  show_blog: showBlog,

  show_services: showServices,
services_title: servicesTitle,
services_subtitle: servicesSubtitle,
theme_mode: themeMode,

// Section Headers
about_title: aboutTitle,
projects_title: projectsTitle,
skills_title: skillsTitle,
experience_title: experienceTitle,
contact_title: contactTitle,
blog_title: blogTitle,

// Appearance
showcase_title: showcaseTitle,
reviews_title: reviewsTitle,
reviews_subtitle: reviewsSubtitle,
reviews_bg_url: reviewsBgUrl,
reviews_bg_overlay_opacity: reviewsBgOverlayOpacity,
hero_bg_type: heroBgType,
hero_bg_url: heroBgUrl,
hero_bg_overlay_opacity: heroBgOverlayOpacity,
contact_bg_type: contactBgType,
contact_bg_url: contactBgUrl,
contact_bg_overlay_opacity: contactBgOverlayOpacity,

        updated_at: new Date().toISOString()
      };

      // Check if record exists
      const { data: existing } = await supabase
        .from('personal_info')
        .select('id')
        .single();

      if (existing) {
        // Update existing
        const { error } = await supabase
          .from('personal_info')
          .update(settingsData)
          .eq('id', existing.id);

        if (error) throw error;
      } else {
        // Insert new
        const { error } = await supabase
          .from('personal_info')
          .insert([settingsData]);

        if (error) throw error;
      }

      showToast('Settings saved successfully!', 'success');
    } catch (error: any) {
      console.error('Error saving settings:', error);
      showToast(error.message || 'Error saving settings', 'error');
    } finally {
      setSaving(false);
    }
  }

  // Get tab title for display
  const getTabTitle = (tab: TabType) => {
    const titles = {
      profile: 'Profile Information',
      contact: 'Contact Information',
      professional: 'Professional Details',
      seo: 'SEO & Meta Tags',
      maintenance: 'Maintenance Mode',
      appearance: 'Appearance',
      advanced: 'Advanced Settings'
    };
    return titles[tab];
  };

  if (loading) {
    return (
      <div className={styles.loadingState}>
        <div className={styles.spinner} />
        <p>Loading settings...</p>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>{getTabTitle(activeTab)}</h1>
          <p className={styles.pageSubtitle}>Manage your portfolio configuration</p>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className={styles.saveBtn}
        >
          <HiCheckCircle size={18} />
          <span>{saving ? 'Saving...' : 'Save Changes'}</span>
        </button>
      </div>

      {/* Tab Content */}
      <div className={styles.tabContent}>
        
        {/* PROFILE TAB */}
        {activeTab === 'profile' && (
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Profile Information</h2>
            <p className={styles.sectionDesc}>Basic information about you</p>

            <div className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label>Full Name *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Kingsley Abebe"
                />
              </div>

              <div className={styles.formGroup}>
                <label>Professional Title *</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Full-Stack Software Engineer"
                />
              </div>

              <div className={styles.formGroup}>
                <label>Tagline</label>
                <input
                  type="text"
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  placeholder="Building scalable web applications"
                />
              </div>

              <div className={styles.formGroup}>
                <label>Avatar URL</label>
                <input
                  type="url"
                  value={avatar}
                  onChange={(e) => setAvatar(e.target.value)}
                  placeholder="https://..."
                />
              </div>

              <div className={styles.formGroupFull}>
                <label>Bio</label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell visitors about yourself..."
                  rows={4}
                />
              </div>

              <div className={styles.formGroupFull}>
                <label>Professional Summary</label>
                <textarea
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  placeholder="Detailed professional summary for about section..."
                  rows={6}
                />
              </div>
            </div>
          </div>
        )}

        {/* CONTACT TAB */}
        {activeTab === 'contact' && (
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Contact Information</h2>
            <p className={styles.sectionDesc}>How people can reach you</p>

            <div className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label>Email *</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                />
              </div>

              <div className={styles.formGroup}>
                <label>Phone</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 (555) 123-4567"
                />
              </div>

              <div className={styles.formGroup}>
                <label>Location</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="San Francisco, CA"
                />
              </div>

              <div className={styles.formGroup}>
                <label>Website</label>
                <input
                  type="url"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="https://yoursite.com"
                />
              </div>

              <div className={styles.formGroup}>
                <label>GitHub</label>
                <input
                  type="url"
                  value={github}
                  onChange={(e) => setGithub(e.target.value)}
                  placeholder="https://github.com/username"
                />
              </div>

              <div className={styles.formGroup}>
                <label>LinkedIn</label>
                <input
                  type="url"
                  value={linkedin}
                  onChange={(e) => setLinkedin(e.target.value)}
                  placeholder="https://linkedin.com/in/username"
                />
              </div>

              <div className={styles.formGroup}>
                <label>Twitter</label>
                <input
                  type="url"
                  value={twitter}
                  onChange={(e) => setTwitter(e.target.value)}
                  placeholder="https://twitter.com/username"
                />
              </div>
            </div>
          </div>
        )}

{/* PROFESSIONAL TAB */}
{activeTab === 'professional' && (
  <div className={styles.section}>
    <h2 className={styles.sectionTitle}>Professional Details</h2>
    <p className={styles.sectionDesc}>Stats and career information - toggle visibility for each field</p>

    <div className={styles.statsContainer}>
      {/* Years of Experience */}
      <div className={styles.statCard}>
        <label className={styles.statToggle}>
          <input
            type="checkbox"
            checked={showYearsExperience}
            onChange={(e) => setShowYearsExperience(e.target.checked)}
          />
          <span>Show Years of Experience</span>
        </label>
        {showYearsExperience && (
          <div className={styles.statInputRow}>
            <div className={styles.statInput}>
              <input
                type="number"
                value={yearsExperience}
                onChange={(e) => setYearsExperience(e.target.value)}
                placeholder="5"
              />
            </div>
            <div className={styles.statInput}>
              <input
                type="text"
                value={trendYearsExperience}
                onChange={(e) => setTrendYearsExperience(e.target.value)}
                placeholder="Trend e.g. +20%"
              />
            </div>
          </div>
        )}
      </div>

      {/* Total Projects */}
      <div className={styles.statCard}>
        <label className={styles.statToggle}>
          <input
            type="checkbox"
            checked={showTotalProjects}
            onChange={(e) => setShowTotalProjects(e.target.checked)}
          />
          <span>Show Total Projects</span>
        </label>
        {showTotalProjects && (
          <div className={styles.statInputRow}>
            <div className={styles.statInput}>
              <input
                type="number"
                value={totalProjects}
                onChange={(e) => setTotalProjects(e.target.value)}
                placeholder="50"
              />
            </div>
            <div className={styles.statInput}>
              <input
                type="text"
                value={trendTotalProjects}
                onChange={(e) => setTrendTotalProjects(e.target.value)}
                placeholder="Trend e.g. +15%"
              />
            </div>
          </div>
        )}
      </div>

      {/* Technologies Count */}
      <div className={styles.statCard}>
        <label className={styles.statToggle}>
          <input
            type="checkbox"
            checked={showTechnologiesCount}
            onChange={(e) => setShowTechnologiesCount(e.target.checked)}
          />
          <span>Show Technologies Count</span>
        </label>
        {showTechnologiesCount && (
          <div className={styles.statInputRow}>
            <div className={styles.statInput}>
              <input
                type="number"
                value={technologiesCount}
                onChange={(e) => setTechnologiesCount(e.target.value)}
                placeholder="25"
              />
            </div>
            <div className={styles.statInput}>
              <input
                type="text"
                value={trendTechnologiesCount}
                onChange={(e) => setTrendTechnologiesCount(e.target.value)}
                placeholder="Trend e.g. +10%"
              />
            </div>
          </div>
        )}
      </div>

      {/* Clients Served */}
      <div className={styles.statCard}>
        <label className={styles.statToggle}>
          <input
            type="checkbox"
            checked={showClientsServed}
            onChange={(e) => setShowClientsServed(e.target.checked)}
          />
          <span>Show Clients Served</span>
        </label>
        {showClientsServed && (
          <div className={styles.statInputRow}>
            <div className={styles.statInput}>
              <input
                type="number"
                value={clientsServed}
                onChange={(e) => setClientsServed(e.target.value)}
                placeholder="30"
              />
            </div>
            <div className={styles.statInput}>
              <input
                type="text"
                value={trendClientsServed}
                onChange={(e) => setTrendClientsServed(e.target.value)}
                placeholder="Trend e.g. +25%"
              />
            </div>
          </div>
        )}
      </div>

      {/* Availability Status */}
      <div className={styles.statCard}>
        <label className={styles.statToggle}>
          <input
            type="checkbox"
            checked={showAvailability}
            onChange={(e) => setShowAvailability(e.target.checked)}
          />
          <span>Show Availability Status</span>
        </label>
        {showAvailability && (
          <div className={styles.statInputRow}>
            <div className={styles.statInput}>
              <select
                title="Availability status"
                value={availability}
                onChange={(e) => setAvailability(e.target.value)}
              >
                <option value="available">Available for Work</option>
                <option value="busy">Currently Busy</option>
                <option value="not-looking">Not Looking</option>
              </select>
            </div>
            <div className={styles.statInput}>
              <input
                type="text"
                value={trendAvailability}
                onChange={(e) => setTrendAvailability(e.target.value)}
                placeholder="Trend e.g. Open"
              />
            </div>
          </div>
        )}
      </div>

      {/* Hourly Rate */}
      <div className={styles.statCard}>
        <label className={styles.statToggle}>
          <input
            type="checkbox"
            checked={showHourlyRate}
            onChange={(e) => setShowHourlyRate(e.target.checked)}
          />
          <span>Show Hourly Rate (USD)</span>
        </label>
        {showHourlyRate && (
          <div className={styles.statInputRow}>
            <div className={styles.statInput}>
              <input
                type="number"
                value={hourlyRate}
                onChange={(e) => setHourlyRate(e.target.value)}
                placeholder="150"
              />
            </div>
            <div className={styles.statInput}>
              <input
                type="text"
                value={trendHourlyRate}
                onChange={(e) => setTrendHourlyRate(e.target.value)}
                placeholder="Trend e.g. +10%"
              />
            </div>
          </div>
        )}
      </div>

      {/* Resume URL - Always Visible */}
      <div className={styles.resumeField}>
        <label>Resume URL</label>
        <input
          type="url"
          value={resumeUrl}
          onChange={(e) => setResumeUrl(e.target.value)}
          placeholder="https://drive.google.com/..."
          style={{
            width: '100%',
            padding: '10px 12px',
            borderRadius: '6px',
            fontSize: '14px',
            background: 'rgba(26, 47, 66, 0.6)',
            border: '1px solid rgba(74, 144, 226, 0.2)',
            color: '#FFFFFF'
          }}
        />
        {resumeUrl && (
          <a 
            href={resumeUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className={styles.previewLink}
          >
            Preview Resume →
          </a>
        )}
      </div>
    </div>
  </div>
)}
        {/* SEO TAB */}
        {activeTab === 'seo' && (
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>SEO & Meta Tags</h2>
            <p className={styles.sectionDesc}>Optimize for search engines</p>

            <div className={styles.formGrid}>
              <div className={styles.formGroupFull}>
                <label>Meta Title</label>
                <input
                  type="text"
                  value={metaTitle}
                  onChange={(e) => setMetaTitle(e.target.value)}
                  placeholder="Kingsley Abebe - Full-Stack Software Engineer"
                  maxLength={60}
                />
                <small>{metaTitle.length}/60 characters</small>
              </div>

              <div className={styles.formGroupFull}>
                <label>Meta Description</label>
                <textarea
                  value={metaDescription}
                  onChange={(e) => setMetaDescription(e.target.value)}
                  placeholder="Professional portfolio showcasing web development projects..."
                  rows={3}
                  maxLength={160}
                />
                <small>{metaDescription.length}/160 characters</small>
              </div>

              <div className={styles.formGroupFull}>
                <label>Keywords (comma separated)</label>
                <input
                  type="text"
                  value={metaKeywords}
                  onChange={(e) => setMetaKeywords(e.target.value)}
                  placeholder="web developer, react, typescript, full-stack"
                />
              </div>

              <div className={styles.formGroup}>
                <label>OG Image URL</label>
                <input
                  type="url"
                  value={ogImage}
                  onChange={(e) => setOgImage(e.target.value)}
                  placeholder="https://..."
                />
              </div>

              <div className={styles.formGroup}>
                <label>Favicon URL</label>
                <input
                  type="url"
                  value={favicon}
                  onChange={(e) => setFavicon(e.target.value)}
                  placeholder="https://..."
                />
              </div>
            </div>
          </div>
        )}

        {/* MAINTENANCE TAB */}
        {activeTab === 'maintenance' && (
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Maintenance Mode</h2>
            <p className={styles.sectionDesc}>Temporarily take your portfolio offline</p>

            <div className={styles.maintenanceAlert}>
              <div className={styles.alertIcon}>🚧</div>
              <div>
                <h3>Maintenance Mode Control</h3>
                <p>When enabled, visitors will see a maintenance page. You can still access the admin dashboard.</p>
              </div>
            </div>

            <div className={styles.formGrid}>
              <div className={styles.formGroupFull}>
                <label className={styles.switchLabel}>
                  <input
                    type="checkbox"
                    checked={maintenanceMode}
                    onChange={(e) => setMaintenanceMode(e.target.checked)}
                    className={styles.switch}
                  />
                  <span>Enable Maintenance Mode</span>
                </label>
              </div>

              {maintenanceMode && (
                <>
                  <div className={styles.formGroupFull}>
                    <label>Maintenance Message</label>
                    <textarea
                      value={maintenanceMessage}
                      onChange={(e) => setMaintenanceMessage(e.target.value)}
                      placeholder="We're currently upgrading our systems. Please check back soon!"
                      rows={4}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label>Estimated Return Time</label>
                    <input
                      type="text"
                      value={maintenanceEta}
                      onChange={(e) => setMaintenanceEta(e.target.value)}
                      placeholder="2 hours"
                    />
                  </div>
                </>
              )}
            </div>
          </div>
        )}

{/* APPEARANCE TAB */}
{activeTab === 'appearance' && (
  <div className={styles.section}>
    <h2 className={styles.sectionTitle}>Appearance</h2>
    <p className={styles.sectionDesc}>Customize background media for your hero and contact sections</p>

    {/* Showcase Title */}
    <div className={styles.subsection}>
      <h3 className={styles.subsectionTitle}>Showcase Title</h3>
      <p className={styles.subsectionDesc}>The title displayed above your project showcase in the hero section</p>
      <div className={styles.formGroup}>
        <label>Title</label>
        <input
          type="text"
          value={showcaseTitle}
          onChange={(e) => setShowcaseTitle(e.target.value)}
          className={styles.input}
          placeholder="Currently Building InfinitBooking Platform"
        />
      </div>
    </div>

    {/* Reviews Page Headers */}
    <div className={styles.subsection}>
      <h3 className={styles.subsectionTitle}>Reviews Page</h3>
      <p className={styles.subsectionDesc}>Customize the heading and subheading on the reviews page</p>
      <div className={styles.formGroup}>
        <label>Title</label>
        <input
          type="text"
          value={reviewsTitle}
          onChange={(e) => setReviewsTitle(e.target.value)}
          className={styles.input}
          placeholder="Client Reviews"
        />
      </div>
      <div className={styles.formGroup}>
        <label>Subtitle</label>
        <input
          type="text"
          value={reviewsSubtitle}
          onChange={(e) => setReviewsSubtitle(e.target.value)}
          className={styles.input}
          placeholder="What people say about working with me"
        />
      </div>
      <div className={styles.formGroup}>
        <label>Background Image</label>
        <FileUpload
          onUploadComplete={(url) => setReviewsBgUrl(url)}
          currentFileUrl={reviewsBgUrl}
          accept="image/*"
          folder="backgrounds"
          maxSize={10}
        />
      </div>
      {reviewsBgUrl && (
        <div className={styles.formGroup}>
          <label>Overlay Darkness — {Math.round(reviewsBgOverlayOpacity * 100)}%</label>
          <input
            type="range"
            min="0"
            max="100"
            value={Math.round(reviewsBgOverlayOpacity * 100)}
            onChange={(e) => setReviewsBgOverlayOpacity(Number(e.target.value) / 100)}
            className={styles.rangeInput}
            title="Reviews overlay opacity"
          />
          <small>Higher values make the overlay darker, keeping text readable</small>
        </div>
      )}
    </div>

    {/* Hero Background */}
    <div className={styles.subsection}>
      <h3 className={styles.subsectionTitle}>Hero Background</h3>
      <p className={styles.subsectionDesc}>Add a background image or video behind your hero section</p>

      <div className={styles.formGroup}>
        <label>Background Type</label>
        <select
          value={heroBgType}
          onChange={(e) => {
            setHeroBgType(e.target.value as 'none' | 'image' | 'video');
            if (e.target.value === 'none') setHeroBgUrl('');
          }}
          className={styles.select}
          title="Hero background type"
        >
          <option value="none">None — Solid color only</option>
          <option value="image">Image</option>
          <option value="video">Video</option>
        </select>
      </div>

      {heroBgType !== 'none' && (
        <>
          <div className={styles.formGroup}>
            <label>{heroBgType === 'image' ? 'Background Image' : 'Background Video'}</label>
            <FileUpload
              onUploadComplete={(url) => setHeroBgUrl(url)}
              currentFileUrl={heroBgUrl}
              accept={heroBgType === 'image' ? 'image/*' : 'video/mp4,video/webm'}
              folder="backgrounds"
              maxSize={heroBgType === 'image' ? 10 : 50}
            />
          </div>

          <div className={styles.formGroup}>
            <label>Overlay Darkness — {Math.round(heroBgOverlayOpacity * 100)}%</label>
            <input
              type="range"
              min="0"
              max="100"
              value={Math.round(heroBgOverlayOpacity * 100)}
              onChange={(e) => setHeroBgOverlayOpacity(Number(e.target.value) / 100)}
              className={styles.rangeInput}
              title="Hero overlay opacity"
            />
            <small>Higher values make the overlay darker, keeping text readable</small>
          </div>
        </>
      )}
    </div>

    {/* Contact Background */}
    <div className={styles.subsection}>
      <h3 className={styles.subsectionTitle}>Contact Section Background</h3>
      <p className={styles.subsectionDesc}>Add a background image or video behind your contact section</p>

      <div className={styles.formGroup}>
        <label>Background Type</label>
        <select
          value={contactBgType}
          onChange={(e) => {
            setContactBgType(e.target.value as 'none' | 'image' | 'video');
            if (e.target.value === 'none') setContactBgUrl('');
          }}
          className={styles.select}
          title="Contact background type"
        >
          <option value="none">None — Solid color only</option>
          <option value="image">Image</option>
          <option value="video">Video</option>
        </select>
      </div>

      {contactBgType !== 'none' && (
        <>
          <div className={styles.formGroup}>
            <label>{contactBgType === 'image' ? 'Background Image' : 'Background Video'}</label>
            <FileUpload
              onUploadComplete={(url) => setContactBgUrl(url)}
              currentFileUrl={contactBgUrl}
              accept={contactBgType === 'image' ? 'image/*' : 'video/mp4,video/webm'}
              folder="backgrounds"
              maxSize={contactBgType === 'image' ? 10 : 50}
            />
          </div>

          <div className={styles.formGroup}>
            <label>Overlay Darkness — {Math.round(contactBgOverlayOpacity * 100)}%</label>
            <input
              type="range"
              min="0"
              max="100"
              value={Math.round(contactBgOverlayOpacity * 100)}
              onChange={(e) => setContactBgOverlayOpacity(Number(e.target.value) / 100)}
              className={styles.rangeInput}
              title="Contact overlay opacity"
            />
            <small>Higher values make the overlay darker, keeping text readable</small>
          </div>
        </>
      )}
    </div>
  </div>
)}

{/* ADVANCED TAB */}
{activeTab === 'advanced' && (
  <div className={styles.section}>
    <h2 className={styles.sectionTitle}>Advanced Settings</h2>
    <p className={styles.sectionDesc}>Visibility, tracking, and customization</p>

    {/* Section Visibility */}
    <div className={styles.subsection}>
      <h3 className={styles.subsectionTitle}>Section Visibility</h3>
      <div className={styles.checkboxGroup}>
        <label className={styles.switchLabel}>
          <input
            type="checkbox"
            checked={showProjects}
            onChange={(e) => setShowProjects(e.target.checked)}
            className={styles.switch}
          />
          <span>Show Projects Section</span>
        </label>
        
        <label className={styles.switchLabel}>
          <input
            type="checkbox"
            checked={showSkills}
            onChange={(e) => setShowSkills(e.target.checked)}
            className={styles.switch}
          />
          <span>Show Skills Section</span>
        </label>
        
        <label className={styles.switchLabel}>
          <input
            type="checkbox"
            checked={showExperience}
            onChange={(e) => setShowExperience(e.target.checked)}
            className={styles.switch}
          />
          <span>Show Experience Section</span>
        </label>

        <label className={styles.switchLabel}>
          <input
            type="checkbox"
            checked={showServices}
            onChange={(e) => setShowServices(e.target.checked)}
            className={styles.switch}
          />
          <span>Show Services Section</span>
        </label>

         {/* ADD THIS - Services Configuration */}
        {showServices && (
          <div className={styles.nestedConfig}>
            <div className={styles.formGroup}>
              <label>Services Section Title</label>
              <input
                type="text"
                value={servicesTitle}
                onChange={(e) => setServicesTitle(e.target.value)}
                placeholder="Build Your Next Project"
                maxLength={100}
              />
            </div>

            <div className={styles.formGroup}>
              <label>Services Section Subtitle</label>
              <input
                type="text"
                value={servicesSubtitle}
                onChange={(e) => setServicesSubtitle(e.target.value)}
                placeholder="Professional web development for startups and businesses"
                maxLength={200}
              />
            </div>
          </div>
        )}



        
        <label className={styles.switchLabel}>
          <input
            type="checkbox"
            checked={showBlog}
            onChange={(e) => setShowBlog(e.target.checked)}
            className={styles.switch}
          />
          <span>Show Blog Section</span>
        </label>
        
        <label className={styles.switchLabel}>
          <input
            type="checkbox"
            checked={contactFormEnabled}
            onChange={(e) => setContactFormEnabled(e.target.checked)}
            className={styles.switch}
          />
          <span>Enable Contact Form</span>
        </label>
      </div>
    </div>

    {/* Section Headers */}
    <div className={styles.subsection}>
      <h3 className={styles.subsectionTitle}>Section Headers</h3>
      <div className={styles.formRow}>
        <div className={styles.formGroup}>
          <label>About Section</label>
          <input type="text" value={aboutTitle} onChange={(e) => setAboutTitle(e.target.value)} placeholder="About Me" maxLength={50} />
        </div>
        <div className={styles.formGroup}>
          <label>Projects Section</label>
          <input type="text" value={projectsTitle} onChange={(e) => setProjectsTitle(e.target.value)} placeholder="Projects" maxLength={50} />
        </div>
      </div>
      <div className={styles.formRow}>
        <div className={styles.formGroup}>
          <label>Skills Section</label>
          <input type="text" value={skillsTitle} onChange={(e) => setSkillsTitle(e.target.value)} placeholder="Technical Skills" maxLength={50} />
        </div>
        <div className={styles.formGroup}>
          <label>Experience Section</label>
          <input type="text" value={experienceTitle} onChange={(e) => setExperienceTitle(e.target.value)} placeholder="Experience & Impact" maxLength={50} />
        </div>
      </div>
      <div className={styles.formRow}>
        <div className={styles.formGroup}>
          <label>Contact Section</label>
          <input type="text" value={contactTitle} onChange={(e) => setContactTitle(e.target.value)} placeholder="Get In Touch" maxLength={50} />
        </div>
        <div className={styles.formGroup}>
          <label>Blog Section</label>
          <input type="text" value={blogTitle} onChange={(e) => setBlogTitle(e.target.value)} placeholder="Blog" maxLength={50} />
        </div>
      </div>
    </div>

    {/* Notifications */}
    <div className={styles.subsection}>
      <h3 className={styles.subsectionTitle}>Email Notifications</h3>
      <label className={styles.switchLabel}>
        <input
          type="checkbox"
          checked={emailNotifications}
          onChange={(e) => setEmailNotifications(e.target.checked)}
          className={styles.switch}
        />
        <span>Receive email on new contact messages</span>
      </label>
    </div>

    {/* Analytics */}
    <div className={styles.subsection}>
      <h3 className={styles.subsectionTitle}>Analytics & Tracking</h3>
      <div className={styles.formGroup}>
        <label>Google Analytics ID</label>
        <input
          type="text"
          value={googleAnalyticsId}
          onChange={(e) => setGoogleAnalyticsId(e.target.value)}
          placeholder="G-XXXXXXXXXX"
        />
        <small>Track visitor behavior and site performance</small>
      </div>
    </div>

    {/* Theme Mode Control */}
    <div className={styles.subsection}>
      <h3 className={styles.subsectionTitle}>Theme Control</h3>
      <p className={styles.subsectionDesc}>Control how visitors experience your site theme</p>
      <div className={styles.formGroup}>
        <label htmlFor="theme-mode-select">Theme Mode</label>
        <select
          id="theme-mode-select"
          value={themeMode}
          onChange={(e) => setThemeMode(e.target.value as 'default' | 'force-dark' | 'force-light')}
          className={styles.select}
        >
          <option value="default">Default - Users can toggle theme</option>
          <option value="force-dark">Force Dark Mode - Toggle hidden</option>
          <option value="force-light">Force Light Mode - Toggle hidden</option>
        </select>
        <small className={styles.helpText}>
          {themeMode === 'default' && 'Visitors will see the theme toggle and can switch between light/dark mode.'}
          {themeMode === 'force-dark' && 'Site will be locked to dark mode. The theme toggle will be hidden.'}
          {themeMode === 'force-light' && 'Site will be locked to light mode. The theme toggle will be hidden.'}
        </small>
      </div>
    </div>

    {/* Theme Colors */}
    <div className={styles.subsection}>
      <h3 className={styles.subsectionTitle}>Brand Colors</h3>
      <div className={styles.formGrid}>
        <div className={styles.formGroup}>
          <label>Primary Brand Color</label>
          <div className={styles.colorInputWrapper}>
            <input
              type="color"
              value={brandColor}
              onChange={(e) => setBrandColor(e.target.value)}
              className={styles.colorInput}
            />
            <input
              type="text"
              value={brandColor}
              onChange={(e) => setBrandColor(e.target.value)}
              placeholder="#4A90E2"
            />
          </div>
        </div>

        <div className={styles.formGroup}>
          <label>Accent Color</label>
          <div className={styles.colorInputWrapper}>
            <input
              type="color"
              value={accentColor}
              onChange={(e) => setAccentColor(e.target.value)}
              className={styles.colorInput}
            />
            <input
              type="text"
              value={accentColor}
              onChange={(e) => setAccentColor(e.target.value)}
              placeholder="#667eea"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
)}

      </div>

      {/* Floating Save Button */}
      <div className={styles.floatingSave}>
        <button 
          onClick={handleSave} 
          disabled={saving}
          className={styles.saveBtn}
        >
          <HiCheckCircle size={18} />
          <span>{saving ? 'Saving...' : 'Save All Changes'}</span>
        </button>
      </div>
    </div>
  );
}