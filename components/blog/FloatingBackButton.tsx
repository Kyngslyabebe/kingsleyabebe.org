'use client';

import { useRouter } from 'next/navigation';
import { HiArrowLeft } from 'react-icons/hi2';
import { analytics } from '@/lib/analytics/events';
import styles from './FloatingBackButton.module.css';

export default function FloatingBackButton({ backTo = '/' }: { backTo?: string }) {
  const router = useRouter();

  const handleBack = () => {
    analytics.navClick('back-to-portfolio');
    router.push(backTo);
  };

  return (
    <button onClick={handleBack} className={styles.floatingBack} title="Back to Portfolio">
      <HiArrowLeft size={24} />
    </button>
  );
}