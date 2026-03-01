'use client';
export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination } from 'swiper/modules';
import { supabase } from '@/lib/supabase/client';
import 'swiper/css';
import 'swiper/css/pagination';
import styles from './HeroShowcase.module.css';

interface ShowcaseItem {
  id: string;
  desktop_image: string;
  mobile_image: string;
  title: string;
  order_index: number;
}

interface HeroShowcaseProps {
  showcaseTitle?: string;
}

export default function HeroShowcase({ showcaseTitle = 'Currently Building' }: HeroShowcaseProps) {
  const [items, setItems] = useState<ShowcaseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile (runs once)
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Load data (runs once)
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

  if (loading) {
    return (
      <div className={styles.showcaseContainer}>
        <div className={styles.showcaseHeader}>
          <h3 className={styles.showcaseTitle}>{showcaseTitle}</h3>
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
        <div className={styles.showcaseHeader}>
          <h3 className={styles.showcaseTitle}>{showcaseTitle}</h3>
        </div>
        <div className={styles.emptyState}>
          <p className={styles.emptyText}>No active showcase items</p>
          <p className={styles.emptySubtext}>Add items in admin dashboard</p>
        </div>
      </div>
    );
  }

  // Single item
  if (items.length === 1) {
    const item = items[0];
    return (
      <div className={styles.showcaseContainer}>
        <div className={styles.showcaseHeader}>
          <h3 className={styles.showcaseTitle}>{showcaseTitle}</h3>
        </div>
        <div className={styles.showcaseContent}>
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
        </div>
      </div>
    );
  }

  // Multiple items - Carousel
  return (
    <div className={styles.showcaseContainer}>
      <div className={styles.showcaseHeader}>
        <h3 className={styles.showcaseTitle}>{showcaseTitle}</h3>
      </div>
      <div className={styles.showcaseContent}>
        <Swiper
          modules={[Autoplay, Pagination]}
          spaceBetween={0}
          slidesPerView={1}
          loop={items.length > 2}
          speed={800}
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
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  );
}