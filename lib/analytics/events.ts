// Track custom events
export const trackEvent = (
  action: string,
  category: string,
  label?: string,
  value?: number
) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    });
  }
};

// Predefined event trackers
export const analytics = {
  // Contact form events
  contactFormSubmit: (name: string) => {
    trackEvent('submit', 'contact_form', name);
  },

  // Project events
  projectView: (projectName: string) => {
    trackEvent('view', 'project', projectName);
  },

  projectDemoClick: (projectName: string) => {
    trackEvent('click', 'project_demo', projectName);
  },

  projectGithubClick: (projectName: string) => {
    trackEvent('click', 'project_github', projectName);
  },

  // Resume download
  resumeDownload: () => {
    trackEvent('download', 'resume', 'pdf');
  },

  // Social links
  socialClick: (platform: string) => {
    trackEvent('click', 'social', platform);
  },

  // Navigation
  navClick: (section: string) => {
    trackEvent('click', 'navigation', section);
  },

  // Skills interaction
  skillHover: (skillName: string) => {
    trackEvent('hover', 'skill', skillName);
  },

  // Experience interaction
  experienceExpand: (jobTitle: string) => {
    trackEvent('expand', 'experience', jobTitle);
  },

  // Theme toggle
  themeToggle: (theme: 'light' | 'dark') => {
    trackEvent('toggle', 'theme', theme);
  },
};