'use client';

import { useEffect, useState, useRef } from 'react';
import Navigation from '../Navigation';
import Header from '../Header';
import styles from './styles.module.css';

export default function Layout({ children }: { children: React.ReactNode }) {
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const [shouldShowVideo, setShouldShowVideo] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const mainRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Prevent body scrolling
    document.body.style.overflow = 'hidden';
    
    // Initialize blur first, then show video
    setTimeout(() => {
      setShouldShowVideo(true);
    }, 100);

    const webApp = window.Telegram?.WebApp;
    if (webApp) {
      try {
        webApp.ready();
        webApp.expand();
      } catch (error) {
        console.error('Error initializing Telegram Web App:', error);
      }
    }

    // Handle iOS video playback
    const handleVisibilityChange = () => {
      if (videoRef.current) {
        if (document.hidden) {
          videoRef.current.pause();
        } else {
          videoRef.current.currentTime = 0;
          const playPromise = videoRef.current.play();
          if (playPromise !== undefined) {
            playPromise.catch(() => {
              const resumeVideo = () => {
                if (videoRef.current && videoRef.current.paused) {
                  videoRef.current.play().catch(() => {});
                }
                document.removeEventListener('touchend', resumeVideo);
              };
              document.addEventListener('touchend', resumeVideo);
            });
          }
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Handle scroll limits
    const handleScroll = () => {
      if (mainRef.current) {
        const { scrollHeight, clientHeight, scrollTop } = mainRef.current;
        if (scrollTop + clientHeight > scrollHeight) {
          mainRef.current.scrollTop = scrollHeight - clientHeight;
        }
        if (scrollTop < 0) {
          mainRef.current.scrollTop = 0;
        }
      }
    };

    const scrollContainer = mainRef.current;
    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', handleScroll);
    }

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (scrollContainer) {
        scrollContainer.removeEventListener('scroll', handleScroll);
      }
      document.body.style.overflow = '';
    };
  }, []);

  return (
    <div className={styles.container}>
      {/* Blur overlay that's always present */}
      <div className={styles.blurOverlay} />
      
      {/* Video that loads after blur */}
      <div className={styles.videoContainer}>
        {!videoError && shouldShowVideo && (
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
            <source 
              src="/bgvideo.mp4" 
              type="video/mp4"
            />
          </video>
        )}
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