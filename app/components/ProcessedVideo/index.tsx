'use client';

import { useEffect, useRef, useState } from 'react';
import styles from './styles.module.css';

export default function ProcessedVideo() {
  const [isLoaded, setIsLoaded] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { alpha: false });
    
    if (!ctx) return;

    // Set canvas size to match video
    const updateCanvasSize = () => {
      const rect = video.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
    };

    // Process video frame
    const processFrame = () => {
      if (!video.paused && !video.ended) {
        updateCanvasSize();
        
        // Draw original frame
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Apply blur effect
        ctx.filter = 'blur(8px)';
        ctx.globalAlpha = 0.3;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        ctx.filter = 'none';
        ctx.globalAlpha = 1.0;
        
        requestAnimationFrame(processFrame);
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        video.pause();
      } else {
        video.play().catch(console.error);
      }
    };

    // Start processing when video is ready
    video.addEventListener('playing', processFrame);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      video.removeEventListener('playing', processFrame);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return (
    <div className={styles.container}>
      <video
        ref={videoRef}
        autoPlay
        loop
        muted
        playsInline
        className={styles.video}
        onLoadedData={() => setIsLoaded(true)}
      >
        <source src="/bgvideo.mp4" type="video/mp4" />
      </video>
      <canvas 
        ref={canvasRef}
        className={`${styles.canvas} ${isLoaded ? styles.visible : ''}`}
      />
    </div>
  );
}