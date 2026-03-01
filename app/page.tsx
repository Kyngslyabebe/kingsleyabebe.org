'use client';
export const dynamic = 'force-dynamic';

import HeroShowcase from '@/components/hero/HeroShowcase';
import { ThemeToggle } from '@/components/theme/ThemeToggle';
import { useSettings } from '@/lib/hooks/useSettings';
import Footer from '@/components/footer/Footer';
import LoadingScreen from '@/components/loadingscreen/LoadingScreen';
import FeaturedBlog from '@/components/blog/FeaturedBlog';
import ReadMoreText from '@/components/common/ReadMoreText';
import Services from '@/components/services/Services';
import ScrollToTop from '@/components/common/ScrollToTop';
import ReviewStrip from '@/components/reviews/ReviewStrip';
import Link from 'next/link';
import Image from 'next/image';
import { analytics } from '@/lib/analytics/events';

import React, { useState, useEffect, useRef } from 'react';
import { motion, useScroll } from 'framer-motion';
import { HiHome, HiUser, HiRectangleGroup, HiClock, HiCodeBracket, HiEnvelope, HiArrowDown, HiRocketLaunch, HiCpuChip, HiBriefcase, HiXMark, HiChevronDown, HiArrowRight, HiUserGroup, HiCurrencyDollar } from 'react-icons/hi2';
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

  // Smooth video loop: darken overlay at loop point to mask the restart
  const heroVideoRef = useRef<HTMLVideoElement>(null);
  const heroOverlayRef = useRef<HTMLDivElement>(null);
  const contactVideoRef = useRef<HTMLVideoElement>(null);
  const contactOverlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const pairs = [
      { video: heroVideoRef.current, overlay: heroOverlayRef.current, base: settings.hero_bg_overlay_opacity },
      { video: contactVideoRef.current, overlay: contactOverlayRef.current, base: settings.contact_bg_overlay_opacity },
    ];

    const rafIds: number[] = [];

    pairs.forEach(({ video, overlay, base }, i) => {
      if (!video || !overlay) return;
      const MASK = 0.4; // seconds to mask transition

      const tick = () => {
        if (video.duration && video.duration > MASK * 2) {
          const timeLeft = video.duration - video.currentTime;
          if (timeLeft < MASK) {
            // Ramp overlay to fully opaque near the end
            const progress = 1 - (timeLeft / MASK);
            overlay.style.opacity = String(base + (1 - base) * progress);
          } else if (video.currentTime < MASK) {
            // Ramp overlay back to normal after restart
            const progress = video.currentTime / MASK;
            overlay.style.opacity = String(base + (1 - base) * (1 - progress));
          } else {
            overlay.style.opacity = String(base);
          }
        }
        rafIds[i] = requestAnimationFrame(tick);
      };

      rafIds[i] = requestAnimationFrame(tick);
    });

    return () => rafIds.forEach(id => cancelAnimationFrame(id));
  }, [settings.hero_bg_type, settings.contact_bg_type, settings.hero_bg_overlay_opacity, settings.contact_bg_overlay_opacity]);

  // Scroll progress
  const { scrollYProgress } = useScroll();

  useEffect(() => {
    if (!settingsLoading) {
      loadPortfolioData();
    }
  }, [settingsLoading, settings]);

  async function loadPortfolioData() {
    try {
      // Load all data in parallel for better performance
      const [projectsResult, skillsResult, experienceResult] = await Promise.all([
        settings.show_projects
          ? supabase
              .from('projects')
              .select('*')
              .eq('visible', true)
              .order('created_at', { ascending: false })
          : Promise.resolve({ data: null, error: null }),
        
        settings.show_skills
          ? supabase
              .from('skills')
              .select('*')
              .eq('visible', true)
              .order('level', { ascending: false })
          : Promise.resolve({ data: null, error: null }),
        
        settings.show_experience
          ? supabase
              .from('experience')
              .select('*')
              .eq('visible', true)
              .order('display_order', { ascending: false })
          : Promise.resolve({ data: null, error: null })
      ]);

      setProjects(projectsResult.data || []);
      setSkills(skillsResult.data || []);
      setExperience(experienceResult.data || []);
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
  if (settings.show_services) navSections.push('services'); 
  navSections.push('contact');

  return (
    <div className={styles.container}>
      <ThemeToggle />

      <div className={styles.mobileLogo}>
        {settings.avatar ? (
          <Image src={settings.avatar} alt={settings.name} width={40} height={40} priority />
        ) : (
          settings.name.split(' ').map(n => n[0]).join('')
        )}
      </div>

      <motion.div 
        className={styles.progressBar}
        style={{ scaleX: scrollYProgress }}
      />

      <nav className={`${styles.desktopNav} ${scrolled ? styles.desktopNavScrolled : ''}`}>
        <div className={styles.navLogo}>
          {settings.avatar ? (
            <Image src={settings.avatar} alt={settings.name} className={styles.navAvatar} width={40} height={40} priority />
          ) : (
            settings.name.split(' ').map(n => n[0]).join('')
          )}
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

      <section id="home" className={styles.hero}>
        {/* Background Media */}
        {settings.hero_bg_type !== 'none' && settings.hero_bg_url && (
          <div className={styles.bgMedia}>
            {settings.hero_bg_type === 'image' ? (
              <img src={settings.hero_bg_url} alt="" className={styles.bgImage} />
            ) : (
              <video
                ref={heroVideoRef}
                src={settings.hero_bg_url}
                className={styles.bgVideo}
                autoPlay
                muted
                loop
                playsInline
              />
            )}
            <div
              ref={heroOverlayRef}
              className={styles.bgOverlay}
              style={{ opacity: settings.hero_bg_overlay_opacity }}
            />
          </div>
        )}
        <div className={styles.heroGrid}>
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

            {((settings.show_projects && projects.length > 0) || settings.resume_url) && (
              <motion.div
                className={`${styles.heroCTA} ${styles.ctaDesktop}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
              >
                {settings.show_projects && projects.length > 0 && (
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
            )}

            <ReviewStrip />
          </motion.div>

          <motion.div
            className={styles.heroShowcase}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <HeroShowcase showcaseTitle={settings.showcase_title} />
          </motion.div>
        </div>
      </section>

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

          <div className={styles.aboutContent}>
            {settings.avatar && (
              <motion.div
                className={styles.aboutImageWrapper}
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              >
                <Image
                  src={settings.avatar}
                  alt={settings.name}
                  className={styles.aboutImage}
                  width={400}
                  height={400}
                />
              </motion.div>
            )}

            <div className={styles.aboutTextWrapper}>
              <ReadMoreText
                text={settings.summary || settings.bio || ''}
                desktopLines={15}
                mobileLines={12}
              />
            </div>
          </div>
        </div>
      </motion.section>

      {(
        (settings.show_years_experience && settings.years_experience) ||
        (settings.show_total_projects && settings.total_projects) ||
        (settings.show_technologies_count && settings.technologies_count) ||
        (settings.show_clients_served && settings.clients_served) ||
        (settings.show_availability && settings.availability) ||
        (settings.show_hourly_rate && settings.hourly_rate)
      ) && (
        <motion.section
          className={styles.section}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <div className={styles.sectionContent}>
            <motion.div
              className={styles.statsGrid}
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              {settings.show_years_experience && settings.years_experience && (
                <motion.div className={styles.statCard} variants={scaleIn} transition={{ duration: 0.5 }}>
                  <HiRocketLaunch size={28} style={{ color: settings.brand_color || '#4A90E2' }} />
                  <h3 className={styles.statNumber}>
                    <Counter from={0} to={parseInt(settings.years_experience) || 0} />+
                  </h3>
                  <p className={styles.statLabel}>Years Experience</p>
                </motion.div>
              )}

              {settings.show_total_projects && settings.total_projects && (
                <motion.div className={styles.statCard} variants={scaleIn} transition={{ duration: 0.5, delay: 0.1 }}>
                  <HiCodeBracket size={28} style={{ color: settings.brand_color || '#4A90E2' }} />
                  <h3 className={styles.statNumber}>
                    <Counter from={0} to={parseInt(settings.total_projects) || 0} />+
                  </h3>
                  <p className={styles.statLabel}>Projects Built</p>
                </motion.div>
              )}

              {settings.show_technologies_count && settings.technologies_count && (
                <motion.div className={styles.statCard} variants={scaleIn} transition={{ duration: 0.5, delay: 0.2 }}>
                  <HiCpuChip size={28} style={{ color: settings.brand_color || '#4A90E2' }} />
                  <h3 className={styles.statNumber}>
                    <Counter from={0} to={parseInt(settings.technologies_count) || 0} />+
                  </h3>
                  <p className={styles.statLabel}>Technologies</p>
                </motion.div>
              )}

              {settings.show_clients_served && settings.clients_served && (
                <motion.div className={styles.statCard} variants={scaleIn} transition={{ duration: 0.5, delay: 0.3 }}>
                  <HiUserGroup size={28} style={{ color: settings.brand_color || '#4A90E2' }} />
                  <h3 className={styles.statNumber}>
                    <Counter from={0} to={parseInt(settings.clients_served) || 0} />+
                  </h3>
                  <p className={styles.statLabel}>Happy Clients</p>
                </motion.div>
              )}

              {settings.show_availability && settings.availability && (
                <motion.div className={styles.statCard} variants={scaleIn} transition={{ duration: 0.5, delay: 0.4 }}>
                  <HiBriefcase size={28} style={{ color: settings.brand_color || '#4A90E2' }} />
                  <h3 className={styles.statNumber} style={{ fontSize: '1.5rem' }}>
                    {settings.availability === 'available' && '✓ Available'}
                    {settings.availability === 'busy' && '⏳ Busy'}
                    {settings.availability === 'not-looking' && '✗ Not Available'}
                  </h3>
                  <p className={styles.statLabel}>Current Status</p>
                </motion.div>
              )}

              {settings.show_hourly_rate && settings.hourly_rate && (
                <motion.div className={styles.statCard} variants={scaleIn} transition={{ duration: 0.5, delay: 0.5 }}>
                  <HiCurrencyDollar size={28} style={{ color: settings.brand_color || '#4A90E2' }} />
                  <h3 className={styles.statNumber}>
                    ${settings.hourly_rate}
                  </h3>
                  <p className={styles.statLabel}>Hourly Rate</p>
                </motion.div>
              )}
            </motion.div>
          </div>
        </motion.section>
      )}

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
                      <Image
                        src={project.image}
                        alt={project.title}
                        className={styles.projectImage}
                        width={600}
                        height={400}
                        loading="lazy"
                      />
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


          {/* Services Section */}
{settings.show_services && (
  <motion.section
    id="services"
    className={styles.section}
    initial="hidden"
    whileInView="visible"
    viewport={{ once: true, margin: "-100px" }}
    variants={fadeInUp}
    transition={{ duration: 0.6 }}
  >
    <div className={styles.sectionContent}>
      <h2 className={styles.sectionTitle}>
        {settings.services_title || 'Build Your Next Project'}
      </h2>
      {settings.services_subtitle && (
        <p className={styles.sectionSubtitle}>
          {settings.services_subtitle}
        </p>
      )}
      <Services />
    </div>
  </motion.section>
)}

      <motion.section
        id="contact"
        className={styles.section}
        style={{ position: 'relative', overflow: 'hidden' }}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={fadeInUp}
        transition={{ duration: 0.6 }}
      >
        {/* Background Media */}
        {settings.contact_bg_type !== 'none' && settings.contact_bg_url && (
          <div className={styles.bgMedia}>
            {settings.contact_bg_type === 'image' ? (
              <img src={settings.contact_bg_url} alt="" className={styles.bgImage} />
            ) : (
              <video
                ref={contactVideoRef}
                src={settings.contact_bg_url}
                className={styles.bgVideo}
                autoPlay
                muted
                loop
                playsInline
              />
            )}
            <div
              ref={contactOverlayRef}
              className={styles.bgOverlay}
              style={{ opacity: settings.contact_bg_overlay_opacity }}
            />
          </div>
        )}
        <div className={styles.sectionContent} style={{ position: 'relative', zIndex: 2 }}>
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

   <nav className={styles.mobileNav}>
  {navSections.slice(0, 5).map((section) => {
    const icons: any = {
      home: HiHome,
      about: HiUser,
      projects: HiRectangleGroup,
      services: HiBriefcase,
      skills: HiCodeBracket,
      experience: HiClock,
      contact: HiEnvelope
    };
    
    const Icon = icons[section] || HiHome;
    
    return (
      <button
        key={section}
        onClick={() => scrollToSection(section)}
        className={`${styles.mobileNavItem} ${activeSection === section ? styles.mobileNavItemActive : ''}`}
      >
        <Icon size={22} />
      </button>
    );
  })}
</nav>

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
              <Image
                src={selectedProject.image}
                alt={selectedProject.title}
                className={styles.modalImage}
                width={800}
                height={500}
                priority
              />
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

      {settings.show_blog && (
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
            <h2 className={styles.sectionTitle}>Blog</h2>
            <FeaturedBlog />
          </div>
        </motion.section>
      )}

      <Footer />

        <ScrollToTop />
    </div>
  );
}

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