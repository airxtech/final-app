'use client';

import { useEffect, useRef } from 'react';
import Navigation from '../Navigation';
import Header from '../Header';
import ProcessedVideo from '../ProcessedVideo';
import styles from './styles.module.css';

export default function Layout({ children }: { children: React.ReactNode }) {
  const mainRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    
    const webApp = window.Telegram?.WebApp;
    if (webApp) {
      try {
        webApp.ready();
        webApp.expand();
      } catch (error) {
        console.error('Error initializing Telegram Web App:', error);
      }
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  return (
    <div className={styles.container}>
      <ProcessedVideo />
      
      <Header />
      
      <main className={styles.main}>
        <div ref={mainRef} className={styles.scrollContainer}>
          {children}
        </div>
      </main>
      
      <Navigation />
    </div>
  );
}