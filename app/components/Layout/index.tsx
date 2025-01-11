'use client';

import { useEffect, useState, useRef } from 'react';
import Navigation from '../Navigation';
import Header from '../Header';
import styles from './styles.module.css';

export default function Layout({ children }: { children: React.ReactNode }) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const mainRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const snapshotRef = useRef<HTMLDivElement>(null);

  const handleMinimize = () => {
    if (snapshotRef.current && videoRef.current) {
      // When minimizing, immediately show the snapshot div with solid bg color
      setIsMinimized(true);
    }
  };

  const handleMaximize = () => {
    // Hide snapshot and restart video
    setIsMinimized(false);
    if (videoRef.current) {
      setTimeout(() => {
        videoRef.current?.play().catch(() => {});
      }, 50);
    }
  };

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

    const handleVisibilityChange = () => {
      if (document.hidden) {
        handleMinimize();
      } else {
        handleMaximize();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('pagehide', handleMinimize);
    window.addEventListener('pageshow', handleMaximize);
    window.addEventListener('focus', handleMaximize);
    window.addEventListener('blur', handleMinimize);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('pagehide', handleMinimize);
      window.removeEventListener('pageshow', handleMaximize);
      window.removeEventListener('focus', handleMaximize);
      window.removeEventListener('blur', handleMinimize);
      document.body.style.overflow = '';
    };
  }, []);

  return (
    <div className={styles.container}>
      {/* Background color is always visible */}
      <div className={styles.background} />
      
      {/* Snapshot overlay for minimize state */}
      <div 
        ref={snapshotRef}
        className={`${styles.snapshot} ${isMinimized ? styles.snapshotActive : ''}`} 
      />
      
      {/* Media container */}
      <div 
        ref={containerRef}
        className={`${styles.mediaContainer} ${isLoaded ? styles.mediaActive : ''} ${isMinimized ? styles.mediaHidden : ''}`}
      >
        <video
          ref={videoRef}
          autoPlay
          loop
          muted
          playsInline
          onLoadedData={() => setIsLoaded(true)}
          className={styles.backgroundVideo}
        >
          <source src="/bgvideo.mp4" type="video/mp4" />
        </video>
        
        <div className={styles.blurOverlay} />
      </div>

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