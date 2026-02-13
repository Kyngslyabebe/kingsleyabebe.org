'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Navigation } from 'swiper/modules';
import { HiArrowRight, HiCheckCircle } from 'react-icons/hi2';
import { 
  SiNextdotjs, SiReact, SiTypescript, SiNodedotjs, 
  SiPostgresql, SiSupabase, SiStripe, SiFirebase, 
  SiVercel, SiTailwindcss 
} from 'react-icons/si';
import * as HiIcons from 'react-icons/hi2';
import { supabase } from '@/lib/supabase/client';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import styles from './Services.module.css';

interface Service {
  id: string;
  title: string;
  tagline: string;
  icon: string;
  timeline: string;
  description: string;
  deliverables: string[];
  tech_stack: string[];
  cta_text: string;
  cta_link: string;
  accent_color: string;
}

const techIcons: any = {
  'Next.js': SiNextdotjs,
  'React': SiReact,
  'TypeScript': SiTypescript,
  'Node.js': SiNodedotjs,
  'PostgreSQL': SiPostgresql,
  'Supabase': SiSupabase,
  'Stripe': SiStripe,
  'Firebase': SiFirebase,
  'Vercel': SiVercel,
  'Tailwind': SiTailwindcss,
};

export default function Services() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadServices();
  }, []);

  async function loadServices() {
    try {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('visible', true)
        .order('display_order', { ascending: true });

      if (error) throw error;
      setServices(data || []);
    } catch (error) {
      console.error('Error loading services:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading || services.length === 0) return null;

  return (
    <>
      {/* Desktop: Grid */}
      <div className={styles.desktopGrid}>
        {services.map((service, index) => (
          <ServiceCard key={service.id} service={service} index={index} />
        ))}
      </div>

      {/* Mobile: Swiper */}
      <div className={styles.mobileCarousel}>
        <Swiper
          modules={[Pagination, Navigation]}
          spaceBetween={20}
          slidesPerView={1.1}
          centeredSlides={true}
          pagination={{ clickable: true }}
          className={styles.swiper}
        >
          {services.map((service, index) => (
            <SwiperSlide key={service.id}>
              <ServiceCard service={service} index={index} />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </>
  );
}

function ServiceCard({ service, index }: { service: Service; index: number }) {
  const [flipped, setFlipped] = useState(false);

  // Get the icon component dynamically
  const IconComponent = (HiIcons as any)[service.icon] || HiIcons.HiBriefcase;

  const handleClick = () => {
    setFlipped(!flipped);
  };

  const handleCTAClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const element = document.querySelector(service.cta_link);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <motion.div
      className={styles.cardContainer}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      onClick={handleClick}
      onMouseEnter={() => setFlipped(true)}
      onMouseLeave={() => setFlipped(false)}
    >
      <motion.div
        className={styles.card}
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ duration: 0.6, type: 'spring', stiffness: 100 }}
        style={{ 
          borderColor: service.accent_color,
        }}
      >


{/* FRONT */}
<div className={styles.cardFront}>
  <div className={styles.iconWrapper}>
    <IconComponent 
      size={48} 
      className={styles.icon}
      style={{ color: service.accent_color }}
    />
  </div>
  
  <h3 className={styles.cardTitle}>{service.title}</h3>
  <p className={styles.cardTagline}>{service.tagline}</p>
  
  {/* ADD DESCRIPTION ON FRONT */}
  {service.description && (
    <p className={styles.frontDescription}>{service.description}</p>
  )}
  
  {/* Preview deliverables */}
  <ul className={styles.previewDeliverables}>
    {service.deliverables.slice(0, 3).map((item, i) => (
      <li key={i} className={styles.previewItem}>
        <HiCheckCircle size={14} style={{ color: service.accent_color }} />
        <span>{item}</span>
      </li>
    ))}
  </ul>
  
  <div className={styles.timeline} style={{ backgroundColor: `${service.accent_color}20`, color: service.accent_color }}>
    {service.timeline}
  </div>

  <p className={styles.flipHint}>
    <span className={styles.desktopHint}>Hover for full details</span>
    <span className={styles.mobileHint}>Tap for full details</span>
  </p>
</div>


{/* BACK */}
<div className={styles.cardBack}>
  <h4 className={styles.backTitle}>Full Feature Set:</h4>
  
  {service.description && (
    <p className={styles.description}>{service.description}</p>
  )}
  
  <ul className={styles.deliverables}>
    {service.deliverables.map((item, i) => ( 
      <li key={i} className={styles.deliverable}>
        <HiCheckCircle size={16} style={{ color: service.accent_color }} />
        <span>{item}</span>
      </li>
    ))}
  </ul>

  <div className={styles.techStack}>
    {service.tech_stack.map((tech) => {
      const TechIcon = techIcons[tech];
      return TechIcon ? (
        <div key={tech} className={styles.techIcon} title={tech}>
          <TechIcon size={18} />
        </div>
      ) : null;
    })}
  </div>

  <button 
    className={styles.ctaButton}
    onClick={handleCTAClick}
    style={{ backgroundColor: service.accent_color }}
  >
    {service.cta_text} <HiArrowRight size={16} />
  </button>
</div>
      </motion.div>
    </motion.div>
  );
}