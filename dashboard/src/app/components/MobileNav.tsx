'use client';

import { useState, useEffect } from 'react';
import styles from './MobileNav.module.css';

interface MobileNavProps {
  children: React.ReactNode;
}

export default function MobileNav({ children }: MobileNavProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  // Close mobile nav when resizing to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsOpen(false);
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  return (
    <>
      <button 
        className={`${styles.mobileMenuToggle} ${isOpen ? styles.active : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle mobile navigation"
        aria-expanded={isOpen}
      >
        <span className={styles.bar}></span>
        <span className={styles.bar}></span>
        <span className={styles.bar}></span>
      </button>
      
      <div className={`${styles.mobileNavOverlay} ${isOpen ? styles.open : ''}`} onClick={() => setIsOpen(false)}></div>
      
      <div className={`${styles.mobileNavContent} ${isOpen ? styles.open : ''}`}>
        <div className={styles.mobileNavHeader}>
          <h2>Menu</h2>
          <button 
            className={styles.closeButton}
            onClick={() => setIsOpen(false)}
            aria-label="Close mobile navigation"
          >
            <span className="icon icon-close">×</span>
          </button>
        </div>
        {children}
      </div>
    </>
  );
}
