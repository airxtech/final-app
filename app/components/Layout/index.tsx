'use client';

import { useEffect, useState } from 'react';
import Navigation from '../Navigation';
import Header from '../Header';
import styles from './styles.module.css';

export default function Layout({ children }: { children: React.ReactNode }) {
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const [videoError, setVideoError] = useState(false);

  useEffect(() => {
    // Telegram WebApp initialization
    const webApp = window.Telegram?.WebApp;
    if (webApp) {
      try {
        webApp.ready();
        webApp.expand();
      } catch (error) {
        console.error('Error initializing Telegram Web App:', error);
      }
    }

    // Video debugging
    console.log('Video path:', '/bgvideo.mp4');
    const video = document.querySelector('video');
    console.log('Video element:', video);
    if (video) {
      video.addEventListener('error', (e) => {
        console.error('Video error:', e);
        setVideoError(true);
      });
      video.addEventListener('loadeddata', () => {
        console.log('Video loaded successfully');
        setIsVideoLoaded(true);
      });
    }
  }, []);

  return (
    <div className={styles.container}>
      {!videoError && (
        <video
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