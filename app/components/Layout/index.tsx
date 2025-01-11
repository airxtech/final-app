'use client';

import { useEffect, useState, useRef } from 'react';
import Navigation from '../Navigation';
import Header from '../Header';
import styles from './styles.module.css';

export default function Layout({ children }: { children: React.ReactNode }) {
  const [isBlurReady, setIsBlurReady] = useState(false);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const [isVideoVisible, setIsVideoVisible] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const mainRef = useRef<HTMLDivElement>(null);
  const blurRef = useRef<HTMLDivElement>(null);
  const attemptCountRef = useRef(0);

  const forceVideoPlay = async () => {
    if (videoRef.current) {
      try {
        await videoRef.current.play();
        setIsVideoVisible(true);
        attemptCountRef.current = 0;
      } catch (error) {
        console.error('Video play error:', error);
        setIsVideoVisible(false);
      }
    }
  };

  const showVideoWithDelay = () => {
    // First, ensure blur is ready
    setIsBlurReady(true);
    
    // Wait for blur to be rendered and computed
    requestAnimationFrame(() => {
      // Double RAF to ensure blur is fully applied
      requestAnimationFrame(() => {
        // Add a small delay for iOS to catch up with blur
        setTimeout(() => {
          setIsVideoVisible(true);
          forceVideoPlay();
        }, 50); // Small delay to ensure blur is visible first
      });
    });
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

    // Initial load
    showVideoWithDelay();

    const handleVisibilityChange = () => {
      if (document.hidden) {
        setIsVideoVisible(false);
        if (videoRef.current) {
          videoRef.current.pause();
        }
      } else {
        // Reset states when coming back to visible
        setIsBlurReady(false);
        setIsVideoVisible(false);
        
        // Reinitialize with delay
        showVideoWithDelay();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    // iOS specific handlers
    const handleFocus = () => {
      setIsBlurReady(false);
      setIsVideoVisible(false);
      showVideoWithDelay();
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
      {<div 
        ref={blurRef}
        className={`${styles.blurOverlay} ${isBlurReady ? styles.blurActive : ''}`} 
      />}
      
      {/* Video layer */}
      {isBlurReady && !videoError && isVideoVisible && (
        <div className={`${styles.videoContainer} ${isVideoLoaded ? styles.videoActive : ''}`}>
          <video
            ref={videoRef}
            autoPlay
            loop
            muted
            playsInline
            onLoadedData={() => {
              setIsVideoLoaded(true);
            }}
            onError={(e) => {
              console.error('Video error event:', e);
              setVideoError(true);
              setIsVideoVisible(false);
            }}
            className={styles.backgroundVideo}
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