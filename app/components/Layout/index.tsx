'use client';

import { useEffect, useState, useRef } from 'react';
import Navigation from '../Navigation';
import Header from '../Header';
import styles from './styles.module.css';

export default function Layout({ children }: { children: React.ReactNode }) {
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
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
          const playPromise = videoRef.current.play();
          if (playPromise !== undefined) {
            playPromise.catch(() => {
              // Auto-play was prevented, try again with user interaction
              document.addEventListener('touchstart', () => {
                videoRef.current?.play();
              }, { once: true });
            });
          }
        }
      }
    };

    // Handle page visibility changes
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Handle iOS wake from background
    window.addEventListener('focus', () => {
      if (videoRef.current && videoRef.current.paused) {
        videoRef.current.play();
      }
    });

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return (
    <div className={styles.container}>
      {!videoError && (
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
            onError={(e) => {
              console.error('Source error event:', e);
              setVideoError(true);
            }}
          />
        </video>
      )}

      <Header />
      
      <main className={styles.main}>
        {children}
      </main>
      
      <Navigation />
    </div>
  );
}