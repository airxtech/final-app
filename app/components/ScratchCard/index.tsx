'use client'

import React, { useRef, useState, useEffect } from 'react'
import styles from './styles.module.css'

interface ScratchCardProps {
  onClose: () => void
  onReveal: (amount: number) => void
}

export default function ScratchCard({ onClose, onReveal }: ScratchCardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const backgroundCanvasRef = useRef<HTMLCanvasElement>(null)
  const [isRevealed, setIsRevealed] = useState(false)
  const [hasScratchStarted, setHasScratchStarted] = useState(false)
  const [reward, setReward] = useState<number | null>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [loading, setLoading] = useState(true)
  const scratchRadius = 25

  useEffect(() => {
    const initScratchCard = async () => {
      // Generate random reward between 0.1 and 1.0 ZOA
      const rewardAmount = Math.round((Math.random() * 0.9 + 0.1) * 100) / 100
      setReward(rewardAmount)
      setLoading(false)

      const mainCanvas = canvasRef.current
      const bgCanvas = backgroundCanvasRef.current
      if (!mainCanvas || !bgCanvas) return

      const size = Math.min(window.innerWidth * 0.8, 300)
      mainCanvas.width = size
      mainCanvas.height = size
      bgCanvas.width = size
      bgCanvas.height = size

      // Set up background canvas
      const bgCtx = bgCanvas.getContext('2d')
      if (!bgCtx) return

      bgCtx.fillStyle = 'rgb(17, 24, 39)'
      bgCtx.fillRect(0, 0, size, size)
      bgCtx.font = 'bold 40px Arial'
      bgCtx.textAlign = 'center'
      bgCtx.textBaseline = 'middle'
      
      // Create gradient for text
      const gradient = bgCtx.createLinearGradient(size/4, size/2, 3*size/4, size/2)
      gradient.addColorStop(0, '#00a3ff')
      gradient.addColorStop(1, '#00fff2')
      bgCtx.fillStyle = gradient
      bgCtx.fillText(`${rewardAmount.toFixed(2)} ZOA`, size/2, size/2)

      // Set up scratch layer
      const ctx = mainCanvas.getContext('2d')
      if (!ctx) return

      const scratchGradient = ctx.createLinearGradient(0, 0, size, size)
      scratchGradient.addColorStop(0, '#00a3ff')
      scratchGradient.addColorStop(1, '#00fff2')
      ctx.fillStyle = scratchGradient
      ctx.fillRect(0, 0, size, size)
    }

    initScratchCard()
  }, [])

  const calculateScratchPercentage = (ctx: CanvasRenderingContext2D) => {
    const imageData = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height)
    const pixels = imageData.data
    let transparent = 0
    for (let i = 3; i < pixels.length; i += 4) {
      if (pixels[i] < 128) transparent++
    }
    return (transparent / (pixels.length / 4)) * 100
  }

  const handleTouch = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || isRevealed || !reward) return
    e.preventDefault()

    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const rect = canvas.getBoundingClientRect()
    const x = 'touches' in e 
      ? e.touches[0].clientX - rect.left 
      : (e as React.MouseEvent).clientX - rect.left
    const y = 'touches' in e 
      ? e.touches[0].clientY - rect.top 
      : (e as React.MouseEvent).clientY - rect.top

    if (!hasScratchStarted) {
      setHasScratchStarted(true)
    }

    ctx.globalCompositeOperation = 'destination-out'
    ctx.beginPath()
    ctx.arc(x, y, scratchRadius, 0, Math.PI * 2)
    ctx.fill()

    const percentage = calculateScratchPercentage(ctx)
    if (percentage >= 60 && !isRevealed) {
      setIsRevealed(true)
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      onReveal(reward)
      setTimeout(onClose, 1500)
    }
  }

  if (loading) {
    return (
      <div className={styles.modal}>
        <div className={styles.container}>
          <p className={styles.loading}>Loading your reward...</p>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.modal}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h3>Scratch to Earn ✨</h3>
          {!hasScratchStarted && (
            <button onClick={onClose} className={styles.closeButton}>✕</button>
          )}
        </div>

        <div className={styles.canvasContainer}>
          <canvas
            ref={backgroundCanvasRef}
            className={styles.backgroundCanvas}
          />
          <canvas
            ref={canvasRef}
            onMouseDown={() => setIsDrawing(true)}
            onMouseUp={() => setIsDrawing(false)}
            onMouseOut={() => setIsDrawing(false)}
            onMouseMove={handleTouch}
            onTouchStart={(e) => { setIsDrawing(true); handleTouch(e); }}
            onTouchEnd={() => setIsDrawing(false)}
            onTouchMove={handleTouch}
            className={styles.scratchCanvas}
          />

          {!isRevealed && (
            <div className={styles.instruction}>
              <span>
                {hasScratchStarted 
                  ? "Keep scratching to reveal prize!" 
                  : "Scratch to reveal your prize!"}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}