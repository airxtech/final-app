'use client';

import { useEffect, useState } from 'react';
import Navigation from '../Navigation';
import Header from '../Header';
import styles from './styles.module.css';

export default function Layout({ children }: { children: React.ReactNode }) {
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);

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
  }, []);

  return (
    <div className={styles.container}>
      {/* Fallback background color is handled in CSS */}
      <video
        autoPlay
        loop
        muted
        playsInline
        onLoadedData={() => setIsVideoLoaded(true)}
        className={`${styles.backgroundVideo} ${isVideoLoaded ? styles.videoLoaded : ''}`}
        poster="/video-poster.jpg" // Optional: Add a poster image
      >
        <source 
          src="/bgvideo.mp4" 
          type="video/mp4"
        />
      </video>

      <Header />
      
      <main className={styles.main}>
        {children}
      </main>
      
      <Navigation />
    </div>
  );
}