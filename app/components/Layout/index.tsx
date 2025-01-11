'use client';

import { useEffect, useRef } from 'react';
import Navigation from '../Navigation';
import Header from '../Header';
import styles from './styles.module.css';

export default function Layout({ children }: { children: React.ReactNode }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const mainRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    
    const webApp = window.Telegram?.WebApp;
    if (webApp) {
      try {
        // Set the background color that matches our blur overlay
        webApp.setBackgroundColor('#111827');
        webApp.ready();
        webApp.expand();

        // Also set on visibility change
        const handleVisibilityChange = () => {
          if (document.hidden) {
            webApp.setBackgroundColor('#111827');
            if (videoRef.current) {
              videoRef.current.pause();
            }
          } else {
            if (videoRef.current) {
              videoRef.current.play().catch(console.error);
            }
          }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => {
          document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
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
      {/* Background color */}
      <div className={styles.background} />
      
      {/* Video with blur */}
      <div className={styles.videoContainer}>
        <video
          ref={videoRef}
          autoPlay
          loop
          muted
          playsInline
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