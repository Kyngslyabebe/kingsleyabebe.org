'use client';

import { motion } from 'framer-motion';
import { HiHome } from 'react-icons/hi2';
import { useRouter } from 'next/navigation';
import styles from './BackToHome.module.css';

export default function BackToHome() {
  const router = useRouter();

  const handleClick = () => {
    router.push('/');
  };

  return (
    <motion.button
      className={styles.backButton}
      onClick={handleClick}
      initial={{ opacity: 0, scale: 0.5, x: 20 }}
      animate={{ opacity: 1, scale: 1, x: 0 }}
      whileHover={{ scale: 1.1, x: -4 }}
      whileTap={{ scale: 0.9 }}
      transition={{
        duration: 0.3,
        ease: "easeOut"
      }}
      aria-label="Back to home"
    >
      <motion.div
        className={styles.iconWrapper}
        animate={{ x: [0, -4, 0] }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "easeInOut",
          repeatDelay: 0.5
        }}
      >
        <HiHome size={24} />
      </motion.div>

      {/* Animated ring */}
      <motion.div
        className={styles.ring}
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.6, 0, 0.6]
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeOut"
        }}
      />
    </motion.button>
  );
}
