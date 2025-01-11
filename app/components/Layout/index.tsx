'use client';

import { useEffect, useState, useRef } from 'react';
import Navigation from '../Navigation';
import Header from '../Header';
import styles from './styles.module.css';

export default function Layout({ children }: { children: React.ReactNode }) {
  const [isBlurReady, setIsBlurReady] = useState(false);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const mainRef = useRef<HTMLDivElement>(null);
  const videoContainerRef = useRef<HTMLDivElement>(null);

  const resetVideo = () => {
    if (videoRef.current) {
      videoRef.current.pause();
      // Force video element to reset
      if (videoContainerRef.current) {
        videoContainerRef.current.style.display = 'none';
      }
      setIsVideoLoaded(false);
    }
  };

  const startVideo = async () => {
    if (videoRef.current && videoContainerRef.current) {
      try {
        // Ensure blur is ready first
        setIsBlurReady(true);
        
        // Wait a frame for blur to be applied
        await new Promise(resolve => requestAnimationFrame(resolve));
        
        // Show video container
        videoContainerRef.current.style.display = 'block';
        
        // Reset video time and play
        videoRef.current.currentTime = 0;
        await videoRef.current.play();
        setIsVideoLoaded(true);
      } catch (error) {
        console.error('Video play error:', error);
        // If video fails to play, at least show the blur
        setIsBlurReady(true);
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
        // Small delay to ensure proper state reset
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

    // Start video initially
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
      
      {/* Blur layer */}
      <div className={`${styles.blurOverlay} ${isBlurReady ? styles.blurActive : ''}`} />
      
      {/* Video layer */}
      <div 
        ref={videoContainerRef}
        className={`${styles.videoContainer} ${isVideoLoaded ? styles.videoActive : ''}`}
        style={{ display: 'none' }}
      >
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
            // If video errors, ensure blur is still shown
            setIsBlurReady(true);
          }}
          className={styles.backgroundVideo}
        >
          <source src="/bgvideo.mp4" type="video/mp4" />
        </video>
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