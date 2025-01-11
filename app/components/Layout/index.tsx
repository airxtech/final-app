'use client';

import { useEffect } from 'react';
import Navigation from '../Navigation';
import Header from '../Header';
import styles from './styles.module.css';

export default function Layout({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Initialize Telegram WebApp
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
      <video
        autoPlay
        loop
        muted
        playsInline
        className={styles.backgroundVideo}
      >
        <source src="/bgvideo.mp4" type="video/mp4" />
      </video>

      <Header />
      
      <main className={styles.main}>
        {children}
      </main>
      
      <Navigation />
    </div>
  );
}