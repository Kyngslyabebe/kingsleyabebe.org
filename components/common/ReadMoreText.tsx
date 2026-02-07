'use client';

import { useState, useRef, useEffect } from 'react';
import { HiChevronDown, HiChevronUp } from 'react-icons/hi2';
import styles from './ReadMoreText.module.css';

interface ReadMoreTextProps {
  text: string;
  desktopLines?: number;
  mobileLines?: number;
}

export default function ReadMoreText({ 
  text, 
  desktopLines = 10, 
  mobileLines = 8 
}: ReadMoreTextProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [shouldTruncate, setShouldTruncate] = useState(false);
  const [collapsedHeight, setCollapsedHeight] = useState<number>(0);
  const [fullHeight, setFullHeight] = useState<number>(0);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const calculateHeights = () => {
      if (!contentRef.current) return;

      const isMobile = window.innerWidth <= 768;
      const lines = isMobile ? mobileLines : desktopLines;
      
      // Get computed line-height
      const computedStyle = window.getComputedStyle(contentRef.current);
      const lineHeight = parseFloat(computedStyle.lineHeight);
      
      // Calculate collapsed height (number of lines * line-height)
      const calculatedCollapsedHeight = lines * lineHeight;
      
      // Get full content height
      const calculatedFullHeight = contentRef.current.scrollHeight;
      
      // Only truncate if content is taller than collapsed height
      if (calculatedFullHeight > calculatedCollapsedHeight + 20) {
        setShouldTruncate(true);
        setCollapsedHeight(calculatedCollapsedHeight);
        setFullHeight(calculatedFullHeight);
      } else {
        setShouldTruncate(false);
      }
    };

    calculateHeights();
    
    // Recalculate on window resize
    const handleResize = () => {
      setIsExpanded(false); // Reset on resize
      calculateHeights();
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [text, desktopLines, mobileLines]);

  if (!shouldTruncate) {
    return (
      <div className={styles.container}>
        <div className={styles.content} ref={contentRef}>
          {text}
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div 
        className={`${styles.content} ${isExpanded ? styles.expanded : styles.collapsed}`}
        ref={contentRef}
        style={{
          maxHeight: isExpanded ? `${fullHeight}px` : `${collapsedHeight}px`
        }}
      >
        {text}
        {!isExpanded && <div className={styles.fadeOverlay} />}
      </div>

      <button
        className={styles.toggleButton}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {isExpanded ? (
          <>
            <span>Read Less</span>
            <HiChevronUp size={18} />
          </>
        ) : (
          <>
            <span>Read More</span>
            <HiChevronDown size={18} />
          </>
        )}
      </button>
    </div>
  );
}