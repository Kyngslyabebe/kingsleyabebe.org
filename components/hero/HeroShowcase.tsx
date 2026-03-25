'use client';
export const dynamic = 'force-dynamic';

import { useEffect, useState, useCallback } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination } from 'swiper/modules';
import { supabase } from '@/lib/supabase/client';
import { AnimatePresence, motion } from 'framer-motion';
import type { Swiper as SwiperType } from 'swiper';
import 'swiper/css';
import 'swiper/css/pagination';
import styles from './HeroShowcase.module.css';

interface ShowcaseItem {
  id: string;
  desktop_image: string;
  mobile_image: string;
  title: string;
  header: string;
  subheader: string;
  order_index: number;
}

export default function HeroShowcase() {
  const [items, setItems] = useState<ShowcaseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    let mounted = true;

    async function loadData() {
      try {
        const { data, error } = await supabase
          .from('hero_showcase')
          .select('*')
          .eq('active', true)
          .order('order_index', { ascending: true });

        if (error) throw error;

        if (mounted) {
          setItems(data || []);
          setLoading(false);
        }
      } catch (error) {
        console.error('Error loading showcase:', error);
        if (mounted) setLoading(false);
      }
    }

    loadData();

    return () => { mounted = false; };
  }, []);

  const handleSlideChange = useCallback((swiper: SwiperType) => {
    setActiveIndex(swiper.realIndex);
  }, []);

  const currentItem = items[activeIndex];

  if (loading) {
    return (
      <div className={styles.showcaseContainer}>
        <div className={styles.showcaseHeader}>
          <div className={styles.headerPlaceholder} />
        </div>
        <div className={styles.loadingWrapper}>
          <div className={styles.loadingSpinner} />
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className={styles.showcaseContainer}>
        <div className={styles.emptyState}>
          <p className={styles.emptyText}>No active showcase items</p>
          <p className={styles.emptySubtext}>Add items in admin dashboard</p>
        </div>
      </div>
    );
  }

  const renderDeviceMockup = (item: ShowcaseItem) => (
    <div className={styles.deviceContainer}>
      <div className={styles.desktopDevice}>
        <div className={styles.desktopFrame}>
          <div className={styles.browserBar}>
            <div className={styles.browserDots}>
              <span /><span /><span />
            </div>
          </div>
          <div className={styles.desktopContent}>
            <img src={item.desktop_image} alt={item.title || 'Desktop view'} />
          </div>
        </div>
      </div>

      <div className={styles.mobileDevice}>
        <div className={styles.mobileFrame}>
          <div className={styles.mobileNotch} />
          <div className={styles.mobileContent}>
            <img src={item.mobile_image} alt={item.title || 'Mobile view'} />
          </div>
          <div className={styles.homeIndicator} />
        </div>
      </div>
    </div>
  );

  // Single item - no carousel
  if (items.length === 1) {
    return (
      <div className={styles.showcaseContainer}>
        {(currentItem?.header || currentItem?.subheader) && (
          <div className={styles.showcaseHeader}>
            {currentItem.header && (
              <h3 className={styles.showcaseTitle}>{currentItem.header}</h3>
            )}
            {currentItem.subheader && (
              <p className={styles.showcaseSubtitle}>{currentItem.subheader}</p>
            )}
          </div>
        )}
        <div className={styles.showcaseContent}>
          {renderDeviceMockup(items[0])}
        </div>
      </div>
    );
  }

  // Multiple items - carousel with animated header
  return (
    <div className={styles.showcaseContainer}>
      <div className={styles.showcaseHeader}>
        <AnimatePresence mode="wait">
          <motion.div
            key={activeIndex}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.35, ease: 'easeInOut' }}
          >
            {currentItem?.header && (
              <h3 className={styles.showcaseTitle}>{currentItem.header}</h3>
            )}
            {currentItem?.subheader && (
              <p className={styles.showcaseSubtitle}>{currentItem.subheader}</p>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
      <div className={styles.showcaseContent}>
        <Swiper
          modules={[Autoplay, Pagination]}
          spaceBetween={0}
          slidesPerView={1}
          loop={items.length > 2}
          speed={800}
          onSlideChange={handleSlideChange}
          autoplay={!isMobile ? {
            delay: 4500,
            disableOnInteraction: false,
            pauseOnMouseEnter: true,
          } : false}
          pagination={{
            clickable: true,
            dynamicBullets: false,
          }}
          className={styles.showcaseSwiper}
        >
          {items.map((item) => (
            <SwiperSlide key={item.id} className={styles.showcaseSlide}>
              {renderDeviceMockup(item)}
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  );
}
