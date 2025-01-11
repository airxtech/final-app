'use client';

import { useEffect, useState, useRef } from 'react';
import Navigation from '../Navigation';
import Header from '../Header';
import styles from './styles.module.css';

export default function Layout({ children }: { children: React.ReactNode }) {
  const [isLoaded, setIsLoaded] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const mainRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const resetVideo = () => {
    if (videoRef.current && containerRef.current) {
      videoRef.current.pause();
      setIsLoaded(false);
    }
  };

  const startVideo = async () => {
    if (videoRef.current && containerRef.current) {
      try {
        // Reset video time and play
        videoRef.current.currentTime = 0;
        await videoRef.current.play();
        setIsLoaded(true);
      } catch (error) {
        console.error('Video play error:', error);
      }
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
        resetVideo();
      } else {
        setTimeout(startVideo, 50);
      }
    };

    const handleFocus = () => {
      resetVideo();
      setTimeout(startVideo, 50);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);
    window.addEventListener('pageshow', handleFocus);

    startVideo();

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('pageshow', handleFocus);
      document.body.style.overflow = '';
    };
  }, []);

  return (
    <div className={styles.container}>
      {/* Background color is always visible */}
      <div className={styles.background} />
      
      {/* Combined video and blur container */}
      <div 
        ref={containerRef}
        className={`${styles.mediaContainer} ${isLoaded ? styles.mediaActive : ''}`}
      >
        {/* Video layer */}
        <video
          ref={videoRef}
          autoPlay
          loop
          muted
          playsInline
          onLoadedData={() => setIsLoaded(true)}
          onError={(e) => {
            console.error('Video error event:', e);
          }}
          className={styles.backgroundVideo}
        >
          <source src="/bgvideo.mp4" type="video/mp4" />
        </video>
        
        {/* Blur layer - always present above video */}
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