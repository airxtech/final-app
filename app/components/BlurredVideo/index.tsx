'use client';

import { useEffect, useRef, useState } from 'react';
import styles from './styles.module.css';

export default function BlurredVideo() {
  const [isLoaded, setIsLoaded] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const handleVisibility = () => {
      if (!videoRef.current) return;

      if (document.hidden) {
        videoRef.current.pause();
      } else {
        videoRef.current.play().catch(console.error);
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, []);

  return (
    <div className={styles.wrapper}>
      <video
        ref={videoRef}
        autoPlay
        loop
        muted
        playsInline
        className={`${styles.video} ${isLoaded ? styles.videoVisible : ''}`}
        onLoadedData={() => setIsLoaded(true)}
      >
        <source src="/bgvideo.mp4" type="video/mp4" />
      </video>
      <div className={styles.blur} />
    </div>
  );
}