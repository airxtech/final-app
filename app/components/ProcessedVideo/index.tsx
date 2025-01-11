'use client';

import { useEffect, useRef, useState } from 'react';
import styles from './styles.module.css';

export default function ProcessedVideo() {
  const [isLoaded, setIsLoaded] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const blurCanvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!videoRef.current || !canvasRef.current || !blurCanvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const blurCanvas = blurCanvasRef.current;
    const ctx = canvas.getContext('2d');
    const blurCtx = blurCanvas.getContext('2d');
    
    if (!ctx || !blurCtx) return;

    const updateCanvasSize = () => {
      const rect = video.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
      blurCanvas.width = rect.width;
      blurCanvas.height = rect.height;
    };

    const processFrame = () => {
      if (!video.paused && !video.ended) {
        updateCanvasSize();
        
        // Draw original frame on both canvases
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        blurCtx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Apply stronger blur to the blur canvas
        blurCtx.filter = 'blur(8px)';
        blurCtx.globalAlpha = 0.3;
        blurCtx.drawImage(blurCanvas, 0, 0, canvas.width, canvas.height);
        
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

    video.addEventListener('playing', processFrame);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Force start processing after video loads
    video.addEventListener('loadeddata', () => {
      setIsLoaded(true);
      video.play().catch(console.error);
    });

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
      >
        <source src="/bgvideo.mp4" type="video/mp4" />
      </video>
      <canvas 
        ref={canvasRef}
        className={`${styles.canvas} ${isLoaded ? styles.visible : ''}`}
      />
      <canvas 
        ref={blurCanvasRef}
        className={`${styles.blurCanvas} ${isLoaded ? styles.visible : ''}`}
      />
    </div>
  );
}