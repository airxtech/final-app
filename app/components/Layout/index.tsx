'use client';

import { useEffect, useState, useRef } from 'react';
import Navigation from '../Navigation';
import Header from '../Header';
import styles from './styles.module.css';

export default function Layout({ children }: { children: React.ReactNode }) {
  const [isBlurReady, setIsBlurReady] = useState(false);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const mainRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initialize blur first
    requestAnimationFrame(() => {
      setIsBlurReady(true);
    });

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
      if (videoRef.current) {
        if (document.hidden) {
          videoRef.current.pause();
        } else {
          // Reset blur and video states on visibility change
          setIsBlurReady(false);
          setIsVideoLoaded(false);
          
          requestAnimationFrame(() => {
            setIsBlurReady(true);
            videoRef.current?.play().catch(() => {});
          });
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Handle iOS wake from background
    const handleFocus = () => {
      setIsBlurReady(false);
      setIsVideoLoaded(false);
      
      requestAnimationFrame(() => {
        setIsBlurReady(true);
        if (videoRef.current && videoRef.current.paused) {
          videoRef.current.play().catch(() => {});
        }
      });
    };

    window.addEventListener('focus', handleFocus);
    window.addEventListener('pageshow', handleFocus);

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
      
      {/* Blur layer */}
      {isBlurReady && <div className={styles.blurOverlay} />}
      
      {/* Video layer */}
      {isBlurReady && !videoError && (
        <div className={styles.videoContainer}>
          <video
            ref={videoRef}
            autoPlay
            loop
            muted
            playsInline
            onLoadedData={() => setIsVideoLoaded(true)}
            onError={(e) => {
              console.error('Video error event:', e);
              setVideoError(true);
            }}
            className={`${styles.backgroundVideo} ${isVideoLoaded ? styles.videoLoaded : ''}`}
          >
            <source src="/bgvideo.mp4" type="video/mp4" />
          </video>
        </div>
      )}

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