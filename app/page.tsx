'use client';
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
import HeroShowcase from '@/components/hero/HeroShowcase';
import { ThemeToggle } from '@/components/theme/ThemeToggle';
import { useSettings } from '@/lib/hooks/useSettings';
import Footer from '@/components/footer/Footer';
import LoadingScreen from '@/components/loadingscreen/LoadingScreen';
import FeaturedBlog from '@/components/blog/FeaturedBlog';
import ReadMoreText from '@/components/common/ReadMoreText';
import Link from 'next/link';


import { analytics } from '@/lib/analytics/events';

import React, { useState, useEffect } from 'react';
import { motion, useScroll } from 'framer-motion';
import { HiHome, HiUser, HiRectangleGroup, HiCodeBracket, HiEnvelope, HiArrowDown, HiRocketLaunch, HiCpuChip, HiBriefcase, HiXMark, HiChevronDown, HiArrowRight } from 'react-icons/hi2';
import { FaGithub, FaLinkedin, FaEnvelope as FaEmail, FaExternalLinkAlt } from 'react-icons/fa';
import { SiReact, SiNextdotjs, SiTypescript, SiNodedotjs, SiPostgresql, SiMongodb, SiAmazonwebservices, SiDocker, SiStripe, SiTailwindcss } from 'react-icons/si';
import { supabase } from '@/lib/supabase/client';
import './globals.css';
import styles from './page.module.css';


// Skill icons mapping
const skillIcons: any = {
  'Next.js': SiNextdotjs,
  'React': SiReact,
  'TypeScript': SiTypescript,
  'Node.js': SiNodedotjs,
  'PostgreSQL': SiPostgresql,
  'MongoDB': SiMongodb,
  'AWS': SiAmazonwebservices,
  'Stripe': SiStripe,
  'Tailwind CSS': SiTailwindcss,
  'Docker': SiDocker
};

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1 }
};

export default function Portfolio() {
  const { settings, loading: settingsLoading } = useSettings();
  
  const [projects, setProjects] = useState<any[]>([]);
  const [skills, setSkills] = useState<any[]>([]);
  const [experience, setExperience] = useState<any[]>([]);
  
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [activeSection, setActiveSection] = useState('home');
  const [scrolled, setScrolled] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [formStatus, setFormStatus] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [expandedExperience, setExpandedExperience] = useState<number | null>(0);
  const [loading, setLoading] = useState(true);

  // Scroll progress
  const { scrollYProgress } = useScroll();

  useEffect(() => {
    loadPortfolioData();
  }, [settings]);

  async function loadPortfolioData() {
    try {
      // Load projects if visible
      if (settings.show_projects) {
        const { data: projectsData } = await supabase
          .from('projects')
          .select('*')
          .eq('visible', true)
          .order('created_at', { ascending: false });
        setProjects(projectsData || []);
      }

      // Load skills if visible
      if (settings.show_skills) {
        const { data: skillsData } = await supabase
          .from('skills')
          .select('*')
          .order('level', { ascending: false });
        setSkills(skillsData || []);
      }

      // Load experience if visible
      if (settings.show_experience) {
        const { data: experienceData } = await supabase
          .from('experience')
          .select('*')
          .order('display_order', { ascending: false });
        setExperience(experienceData || []);
      }
    } catch (error) {
      console.error('Error loading portfolio data:', error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
      
      const sections = ['home', 'about', 'projects', 'skills', 'experience', 'contact'];
      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const rect = element.getBoundingClientRect();
          if (rect.top <= 150 && rect.bottom >= 150) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (sectionId: string) => {
    analytics.navClick(sectionId);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!settings.contact_form_enabled) {
      setFormStatus('Contact form is currently disabled');
      return;
    }
    
    if (!formData.name || !formData.email || !formData.message) {
      setFormStatus('Please fill in all fields');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setFormStatus('Please enter a valid email address');
      return;
    }

    setIsSubmitting(true);
    setFormStatus('Sending...');

    // Track form submission attempt
    analytics.contactFormSubmit(formData.name);

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setFormStatus('Message sent successfully! Check your email for confirmation.');
        setFormData({ name: '', email: '', message: '' });
        setTimeout(() => setFormStatus(''), 5000);
      } else {
        setFormStatus('Failed to send message. Please try again.');
      }
    } catch (error) {
      setFormStatus('An error occurred. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const downloadResume = () => {
    analytics.resumeDownload();
    if (settings.resume_url) {
      window.open(settings.resume_url, '_blank');
    }
  };

  const toggleExperience = (index: number) => {
    if (expandedExperience !== index && experience[index]) {
      analytics.experienceExpand(experience[index].title);
    }
    setExpandedExperience(expandedExperience === index ? null : index);
  };

  const handleProjectClick = (project: any) => {
    analytics.projectView(project.title);
    setSelectedProject(project);
  };

  const handleSocialClick = (platform: string, url: string) => {
    analytics.socialClick(platform);
  };

 if (settingsLoading || loading) {
  return <LoadingScreen name={settings?.name || "Kingsley"} />;
}

  const navSections = ['home', 'about'];
  if (settings.show_projects) navSections.push('projects');
  if (settings.show_skills) navSections.push('skills');
  if (settings.show_experience) navSections.push('experience');
  navSections.push('contact');

  return (
    <div className={styles.container}>
      <ThemeToggle />

     

{/* Mobile Logo - Shows only on mobile */}
<div className={styles.mobileLogo}>
  {settings.name.split(' ').map(n => n[0]).join('')}
</div>

<motion.div 
  className={styles.progressBar}
  style={{ scaleX: scrollYProgress }}
/>

      <motion.div 
        className={styles.progressBar}
        style={{ scaleX: scrollYProgress }}
      />
      

      {/* Desktop Navigation */}
      <nav className={`${styles.desktopNav} ${scrolled ? styles.desktopNavScrolled : ''}`}>
        <div className={styles.navLogo}>
          {settings.name.split(' ').map(n => n[0]).join('')}
        </div>
        <div className={styles.navLinks}>
          {navSections.map((section) => (
            <button
              key={section}
              onClick={() => scrollToSection(section)}
              className={`${styles.navLink} ${activeSection === section ? styles.navLinkActive : ''}`}
            >
              {section.charAt(0).toUpperCase() + section.slice(1)}
            </button>
          ))}
        </div>
      </nav>

{/* Hero Section - Side by Side on Desktop, Stacked on Mobile */}
<section id="home" className={styles.hero}>
  <div className={styles.heroGrid}>
    {/* LEFT: Info Section */}
    <motion.div 
      className={styles.heroInfo}
      initial={{ opacity: 0, x: -30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.8 }}
    >
      <motion.p
        className={styles.heroSubtitle}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        {settings.title}
      </motion.p>

      <motion.h1
        className={styles.heroTitle}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        {settings.name}
      </motion.h1>

      {settings.tagline && (
        <motion.p
          className={styles.heroTagline}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          {settings.tagline}
        </motion.p>
      )}

      <motion.p
        className={styles.heroDescription}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        {settings.bio || settings.summary}
      </motion.p>

      {/* Desktop CTA - Hidden on Mobile */}
      <motion.div
        className={`${styles.heroCTA} ${styles.ctaDesktop}`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
      >
        {settings.show_projects && (
          <button onClick={() => scrollToSection('projects')} className={styles.ctaPrimary}>
            View Projects
          </button>
        )}
        {settings.resume_url && (
          <button onClick={downloadResume} className={styles.ctaSecondary}>
            Download Resume
          </button>
        )}
      </motion.div>
    </motion.div>

    {/* RIGHT: Showcase Carousel */}
    <motion.div
      className={styles.heroShowcase}
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.8, delay: 0.3 }}
    >
      <HeroShowcase />
    </motion.div>
  </div>

 
</section>

{/* About Section */}
<motion.section
  id="about"
  className={styles.section}
  initial="hidden"
  whileInView="visible"
  viewport={{ once: true, margin: "-100px" }}
  variants={fadeInUp}
  transition={{ duration: 0.6 }}
>
  <div className={styles.sectionContent}>
    <h2 className={styles.sectionTitle}>About Me</h2>
    
    <div className={styles.aboutTextWrapper}>
  <ReadMoreText 
    text={settings.summary || settings.bio || ''} 
    desktopLines={15}  
    mobileLines={12}
  />
</div>
    
    <motion.div
      className={styles.statsGrid}
      variants={staggerContainer}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
    >
      {settings.years_experience && (
        <motion.div className={styles.statCard} variants={scaleIn} transition={{ duration: 0.5 }}>
          <HiRocketLaunch size={36} style={{ color: settings.brand_color || '#4A90E2', marginBottom: '12px' }} />
          <h3 className={styles.statNumber}>
            <Counter from={0} to={parseInt(settings.years_experience) || 0} />+
          </h3>
          <p className={styles.statLabel}>Years Experience</p>
        </motion.div>
      )}

      {settings.total_projects && (
        <motion.div className={styles.statCard} variants={scaleIn} transition={{ duration: 0.5, delay: 0.1 }}>
          <HiCodeBracket size={36} style={{ color: settings.brand_color || '#4A90E2', marginBottom: '12px' }} />
          <h3 className={styles.statNumber}>
            <Counter from={0} to={parseInt(settings.total_projects) || 0} />+
          </h3>
          <p className={styles.statLabel}>Projects Built</p>
        </motion.div>
      )}

      {settings.technologies_count && (
        <motion.div className={styles.statCard} variants={scaleIn} transition={{ duration: 0.5, delay: 0.2 }}>
          <HiCpuChip size={36} style={{ color: settings.brand_color || '#4A90E2', marginBottom: '12px' }} />
          <h3 className={styles.statNumber}>
            <Counter from={0} to={parseInt(settings.technologies_count) || 0} />+
          </h3>
          <p className={styles.statLabel}>Technologies</p>
        </motion.div>
      )}
    </motion.div>
  </div>
</motion.section>

      {/* Projects Section */}
      {settings.show_projects && projects.length > 0 && (
        <motion.section
          id="projects"
          className={styles.section}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeInUp}
          transition={{ duration: 0.6 }}
        >
          <div className={styles.sectionContent}>
            <h2 className={styles.sectionTitle}>Projects</h2>
            <motion.div className={styles.projectsGrid} variants={staggerContainer}>
              {projects.map((project, index) => (
                <motion.div
                  key={project.id}
                  className={styles.projectCard}
                  variants={fadeInUp}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ y: -8, boxShadow: `0 12px 40px ${settings.brand_color}40` }}
                  onClick={() => handleProjectClick(project)}
                >
                  {project.image && (
                    <div className={styles.projectImageWrapper}>
                      <img src={project.image} alt={project.title} className={styles.projectImage} />
                      <div className={styles.projectOverlay}>
                        <FaExternalLinkAlt size={20} style={{ color: '#FFFFFF' }} />
                      </div>
                    </div>
                  )}
                  <div className={styles.projectContent}>
                    <p className={styles.projectCategory}>{project.category}</p>
                    <h3 className={styles.projectTitle}>{project.title}</h3>
                    <p className={styles.projectDescription}>{project.description}</p>
                    <div className={styles.projectMeta}>
                      <span className={styles.projectStatus}>{project.status}</span>
                      <span className={styles.projectYear}>{project.year}</span>
                    </div>
                    {project.tags && project.tags.length > 0 && (
                      <div className={styles.projectTags}>
                        {project.tags.map((tag: string) => (
                          <span key={tag} className={styles.projectTag}>{tag}</span>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </motion.section>
      )}

      {/* Skills Section */}
      {settings.show_skills && skills.length > 0 && (
        <motion.section
          id="skills"
          className={styles.section}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeInUp}
          transition={{ duration: 0.6 }}
        >
          <div className={styles.sectionContent}>
            <h2 className={styles.sectionTitle}>Technical Skills</h2>
            <motion.div className={styles.skillsGrid} variants={staggerContainer}>
              {skills.map((skill, index) => {
                const IconComponent = skillIcons[skill.name] || HiCodeBracket;
                return (
                  <motion.div
                    key={skill.id}
                    className={styles.skillCard}
                    variants={fadeInUp}
                    transition={{ duration: 0.5, delay: index * 0.05 }}
                    onMouseEnter={() => analytics.skillHover(skill.name)}
                  >
                    <div className={styles.skillHeader}>
                      <IconComponent size={28} style={{ color: skill.color }} />
                      <span className={styles.skillName}>{skill.name}</span>
                    </div>
                    <div className={styles.skillBarContainer}>
                      <motion.div
                        className={styles.skillBar}
                        style={{ background: `linear-gradient(90deg, ${skill.color}, ${settings.brand_color || '#4A90E2'})` }}
                        initial={{ width: 0 }}
                        whileInView={{ width: `${skill.level}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 1.5, delay: index * 0.1 }}
                      />
                    </div>
                    <span className={styles.skillLevel}>{skill.level}%</span>
                  </motion.div>
                );
              })}
            </motion.div>
          </div>
        </motion.section>
      )}

      {/* Experience Section */}
      {settings.show_experience && experience.length > 0 && (
        <motion.section
          id="experience"
          className={styles.section}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeInUp}
          transition={{ duration: 0.6 }}
        >
          <div className={styles.sectionContent}>
            <h2 className={styles.sectionTitle}>Experience & Impact</h2>
            <motion.div className={styles.experienceContainer} variants={staggerContainer}>
              {experience.map((exp, index) => (
                <motion.div
                  key={exp.id}
                  className={`${styles.experienceCard} ${expandedExperience === index ? styles.experienceCardExpanded : ''}`}
                  variants={fadeInUp}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <div className={styles.experienceHeader} onClick={() => toggleExperience(index)}>
                    <div className={styles.experienceHeaderLeft}>
                      <div className={styles.experienceIcon}>
                        <HiBriefcase size={20} style={{ color: settings.brand_color || '#4A90E2' }} />
                      </div>
                      <div>
                        <h3 className={styles.experienceTitle}>{exp.title}</h3>
                        <p className={styles.experienceCompany}>{exp.company} • {exp.location}</p>
                        <p className={styles.experienceYear}>{exp.year}</p>
                      </div>
                    </div>
                    <motion.div
                      animate={{ rotate: expandedExperience === index ? 180 : 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <HiChevronDown size={24} style={{ color: settings.brand_color || '#4A90E2' }} />
                    </motion.div>
                  </div>

                  <motion.div
                    initial={false}
                    animate={{
                      height: expandedExperience === index ? 'auto' : 0,
                      opacity: expandedExperience === index ? 1 : 0
                    }}
                    transition={{ duration: 0.3 }}
                    style={{ overflow: 'hidden' }}
                  >
                    <div style={{ padding: '0 20px 20px' }}>
                      <p className={styles.experienceDescription}>{exp.description}</p>
                      {exp.highlights && exp.highlights.length > 0 && (
                        <ul className={styles.experienceHighlights}>
                          {exp.highlights.map((highlight: string, idx: number) => (
                            <li key={idx} className={styles.experienceHighlight}>• {highlight}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </motion.div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </motion.section>
      )}

      {/* Contact Section */}
      <motion.section
        id="contact"
        className={styles.section}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={fadeInUp}
        transition={{ duration: 0.6 }}
      >
        <div className={styles.sectionContent}>
          <h2 className={styles.sectionTitle}>Get In Touch</h2>
          <div className={styles.contactContainer}>
            {settings.contact_form_enabled ? (
              <form onSubmit={handleFormSubmit} className={styles.contactForm}>
                <input
                  type="text"
                  name="name"
                  placeholder="Your Name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={styles.input}
                  disabled={isSubmitting}
                />
                <input
                  type="email"
                  name="email"
                  placeholder="Your Email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={styles.input}
                  disabled={isSubmitting}
                />
                <textarea
                  name="message"
                  placeholder="Your Message"
                  value={formData.message}
                  onChange={handleInputChange}
                  className={`${styles.input} ${styles.textarea}`}
                  rows={5}
                  disabled={isSubmitting}
                />
                <button 
                  type="submit" 
                  className={styles.submitButton}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Sending...' : 'Send Message'}
                </button>
                {formStatus && (
                  <p className={styles.formStatus} style={{ color: formStatus.includes('success') ? settings.brand_color || '#4A90E2' : '#E74C3C' }}>
                    {formStatus}
                  </p>
                )}
              </form>
            ) : (
              <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                <p>Contact form is currently disabled. Please reach out directly:</p>
              </div>
            )}
            
            <div className={styles.contactInfo}>
              <h3 className={styles.contactInfoTitle}>Connect With Me</h3>
              <div className={styles.contactDetails}>
                {settings.email && (
                  <p className={styles.contactDetail}>
                    <strong>Email:</strong> {settings.email}
                  </p>
                )}
                {settings.phone && (
                  <p className={styles.contactDetail}>
                    <strong>Phone:</strong> {settings.phone}
                  </p>
                )}
                {settings.location && (
                  <p className={styles.contactDetail}>
                    <strong>Location:</strong> {settings.location}
                  </p>
                )}
              </div>
              <div className={styles.socialLinks}>
                {settings.github && (
                  <a 
                    href={settings.github} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className={styles.socialLink}
                    onClick={() => handleSocialClick('github', settings.github)}
                  >
                    <FaGithub size={20} />
                    <span>GitHub</span>
                  </a>
                )}
                {settings.linkedin && (
                  <a 
                    href={settings.linkedin} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className={styles.socialLink}
                    onClick={() => handleSocialClick('linkedin', settings.linkedin)}
                  >
                    <FaLinkedin size={20} />
                    <span>LinkedIn</span>
                  </a>
                )}
                {settings.email && (
                  <a 
                    href={`mailto:${settings.email}`} 
                    className={styles.socialLink}
                    onClick={() => handleSocialClick('email', settings.email)}
                  >
                    <FaEmail size={20} />
                    <span>Email</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Mobile Bottom Navigation */}
      <nav className={styles.mobileNav}>
        {[
          { id: 'home', icon: HiHome },
          { id: 'about', icon: HiUser },
          ...(settings.show_projects ? [{ id: 'projects', icon: HiRectangleGroup }] : []),
          ...(settings.show_skills ? [{ id: 'skills', icon: HiCodeBracket }] : []),
          { id: 'contact', icon: HiEnvelope }
        ].map(({ id, icon: Icon }) => (
          <button
            key={id}
            onClick={() => scrollToSection(id)}
            className={`${styles.mobileNavItem} ${activeSection === id ? styles.mobileNavItemActive : ''}`}
          >
            <Icon size={22} />
          </button>
        ))}
      </nav>

{/* Project Modal */}
      {selectedProject && (
        <motion.div
          className={styles.modalOverlay}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setSelectedProject(null)}
        >
          <motion.div
            className={styles.modal}
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            onClick={(e) => e.stopPropagation()}
          >
            <button onClick={() => setSelectedProject(null)} className={styles.modalClose}>
              <HiXMark size={24} />
            </button>
            
            {selectedProject.image && (
              <img src={selectedProject.image} alt={selectedProject.title} className={styles.modalImage} />
            )}
            
            <div className={styles.modalContent}>
              <div className={styles.modalHeader}>
                <div>
                  <p className={styles.modalCategory}>{selectedProject.category}</p>
                  <h2 className={styles.modalTitle}>{selectedProject.title}</h2>
                </div>
                <div className={styles.modalMeta}>
                  <span className={styles.modalStatus}>{selectedProject.status}</span>
                  <span className={styles.modalYear}>{selectedProject.year}</span>
                </div>
              </div>
              
              <p className={styles.modalDescription}>{selectedProject.long_description}</p>
              
              {selectedProject.features && selectedProject.features.length > 0 && (
                <div className={styles.modalSection}>
                  <h3 className={styles.modalSectionTitle}>Key Features</h3>
                  <ul className={styles.featureList}>
                    {selectedProject.features.map((feature: string, index: number) => (
                      <li key={index} className={styles.featureItem}>• {feature}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {selectedProject.tags && selectedProject.tags.length > 0 && (
                <div className={styles.modalSection}>
                  <h3 className={styles.modalSectionTitle}>Technologies</h3>
                  <div className={styles.modalTags}>
                    {selectedProject.tags.map((tag: string) => (
                      <span key={tag} className={styles.modalTag}>{tag}</span>
                    ))}
                  </div>
                </div>
              )}
              
              <div className={styles.modalActions}>
                {selectedProject.demo && (
                  <a 
                    href={selectedProject.demo} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className={styles.modalButton}
                    onClick={() => analytics.projectDemoClick(selectedProject.title)}
                  >
                    <FaExternalLinkAlt size={16} />
                    <span>Live Demo</span>
                  </a>
                )}
                {selectedProject.github && (
                  <a 
                    href={selectedProject.github} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className={`${styles.modalButton} ${styles.modalButtonSecondary}`}
                    onClick={() => analytics.projectGithubClick(selectedProject.title)}
                  >
                    <FaGithub size={16} />
                    <span>View Code</span>
                  </a>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}


{/* Featured Blog Section */}
{settings.show_projects && (
  <motion.section
    id="featured-blog"
    className={styles.section}
    initial="hidden"
    whileInView="visible"
    viewport={{ once: true, margin: "-100px" }}
    variants={fadeInUp}
    transition={{ duration: 0.6 }}
  >
    <div className={styles.sectionContent}>
      <h2 className={styles.sectionTitle}> Blog </h2>
      <FeaturedBlog />
    </div>
  </motion.section>
)}

      {/* Footer  */}
      <Footer />
    </div>
  );
}


// Counter Component
function Counter({ from, to }: { from: number; to: number }) {
  const [count, setCount] = useState(from);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    if (hasAnimated || to === 0) return;
    
    const duration = 2000;
    const steps = 60;
    const increment = (to - from) / steps;
    let current = from;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      current += increment;
      if (step >= steps) {
        setCount(to);
        clearInterval(timer);
        setHasAnimated(true);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [from, to, hasAnimated]);

  return <>{count}</>;
}