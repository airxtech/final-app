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

    document.addEventListener('visibilitychange', handleVisibilityChange);
    startVideo();

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.body.style.overflow = '';
    };
  }, []);

  return (
    <div className={styles.container}>
      {/* Base background with static blur */}
      <div className={styles.background}>
        {/* Static blur elements */}
        <div className={styles.blurElement}></div>
        <div className={styles.blurElement} style={{ left: '25%' }}></div>
        <div className={styles.blurElement} style={{ left: '50%' }}></div>
        <div className={styles.blurElement} style={{ left: '75%' }}></div>
      </div>

      {/* Video wrapped in blur container */}
      <div className={styles.blurWrap}>
        <div 
          ref={containerRef}
          className={`${styles.mediaContainer} ${isLoaded ? styles.mediaActive : ''}`}
        >
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
        </div>
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