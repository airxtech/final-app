'use client';

import { useEffect, useState, useRef } from 'react';
import Navigation from '../Navigation';
import Header from '../Header';
import styles from './styles.module.css';

export default function Layout({ children }: { children: React.ReactNode }) {
  const [isBlurReady, setIsBlurReady] = useState(false);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const [isVideoVisible, setIsVideoVisible] = useState(true);
  const [videoError, setVideoError] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const mainRef = useRef<HTMLDivElement>(null);
  const attemptCountRef = useRef(0);

  const forceVideoPlay = async () => {
    if (videoRef.current) {
      try {
        await videoRef.current.play();
        setIsVideoVisible(true);
        attemptCountRef.current = 0; // Reset counter on successful play
      } catch (error) {
        console.error('Video play error:', error);
        setIsVideoVisible(false);
      }
    }
  };

  // Function to handle video restart
  const handleVideoRestart = () => {
    if (!isVideoVisible && attemptCountRef.current < 3) { // Limit retry attempts
      attemptCountRef.current += 1;
      setIsVideoVisible(true);
      forceVideoPlay();
    }
  };

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

    const handleVisibilityChange = async () => {
      if (document.hidden) {
        setIsVideoVisible(false);
        if (videoRef.current) {
          videoRef.current.pause();
        }
      } else {
        // Small delay to ensure proper state restoration
        setTimeout(() => {
          setIsVideoVisible(true);
          forceVideoPlay();
        }, 100);
      }
    };

    // Add interaction listeners to restart video
    const interactionEvents = ['touchstart', 'click', 'scroll'];
    const handleInteraction = () => {
      if (!isVideoVisible) {
        handleVideoRestart();
      }
    };

    interactionEvents.forEach(event => {
      document.addEventListener(event, handleInteraction, { once: false });
    });

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // iOS specific handlers
    const handleFocus = () => {
      setTimeout(() => {
        setIsVideoVisible(true);
        forceVideoPlay();
      }, 100);
    };

    window.addEventListener('focus', handleFocus);
    window.addEventListener('pageshow', handleFocus);

    return () => {
      interactionEvents.forEach(event => {
        document.removeEventListener(event, handleInteraction);
      });
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('pageshow', handleFocus);
      document.body.style.overflow = '';
    };
  }, [isVideoVisible]);

  return (
    <div className={styles.container}>
      {/* Background color is always visible */}
      <div className={styles.background} />
      
      {/* Blur layer */}
      {isBlurReady && <div className={styles.blurOverlay} />}
      
      {/* Video layer */}
      {isBlurReady && !videoError && isVideoVisible && (
        <div className={styles.videoContainer}>
          <video
            ref={videoRef}
            autoPlay
            loop
            muted
            playsInline
            onLoadedData={() => {
              setIsVideoLoaded(true);
              forceVideoPlay();
            }}
            onError={(e) => {
              console.error('Video error event:', e);
              setVideoError(true);
              setIsVideoVisible(false);
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