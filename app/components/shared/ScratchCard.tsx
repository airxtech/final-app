'use client'

import React, { useRef, useState, useEffect, useCallback } from 'react'
import { X } from 'lucide-react'
import { useRewards } from '@/app/hooks/useRewards'
import styles from './ScratchCard.module.css'

interface ScratchCardProps {
  onClose: () => void
  onReveal: (amount: number) => void
}

const ScratchCard: React.FC<ScratchCardProps> = ({ onClose, onReveal }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const backgroundCanvasRef = useRef<HTMLCanvasElement>(null)
  const [isRevealed, setIsRevealed] = useState(false)
  const [hasScratchStarted, setHasScratchStarted] = useState(false)
  const [reward, setReward] = useState<number | null>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const scratchRadius = 25

  const { handleScratchCard, loading, error } = useRewards()

  const initCanvas = useCallback(async () => {
    const rewardAmount = await handleScratchCard()
    if (rewardAmount === null) {
      onClose()
      return
    }
    setReward(rewardAmount)

    const mainCanvas = canvasRef.current
    const bgCanvas = backgroundCanvasRef.current
    if (!mainCanvas || !bgCanvas) return

    const size = Math.min(window.innerWidth * 0.8, 300)
    mainCanvas.width = size
    mainCanvas.height = size
    bgCanvas.width = size
    bgCanvas.height = size

    const bgCtx = bgCanvas.getContext('2d')
    if (!bgCtx) return

    bgCtx.fillStyle = '#18181b'
    bgCtx.fillRect(0, 0, size, size)
    bgCtx.font = 'bold 40px Inter'
    bgCtx.textAlign = 'center'
    bgCtx.textBaseline = 'middle'
    bgCtx.fillStyle = '#10b981'
    bgCtx.fillText(`${rewardAmount.toFixed(2)} ZOA`, size/2, size/2)

    const ctx = mainCanvas.getContext('2d')
    if (!ctx) return

    const gradient = ctx.createLinearGradient(0, 0, size, size)
    gradient.addColorStop(0, '#10B981')
    gradient.addColorStop(1, '#EAB308')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, size, size)
  }, [handleScratchCard, onClose])

  useEffect(() => {
    initCanvas()
  }, [initCanvas])

  const calculateScratchPercentage = (ctx: CanvasRenderingContext2D) => {
    const imageData = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height)
    const pixels = imageData.data
    let transparent = 0
    for (let i = 3; i < pixels.length; i += 4) {
      if (pixels[i] < 128) transparent++
    }
    return (transparent / (pixels.length / 4)) * 100
  }

  const scratch = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || isRevealed || !reward) return
    e.preventDefault()

    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const rect = canvas.getBoundingClientRect()
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY
    const x = clientX - rect.left
    const y = clientY - rect.top

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
      setTimeout(() => onClose(), 1500)
    }
  }, [isDrawing, isRevealed, reward, hasScratchStarted, onReveal, onClose])

  if (loading) {
    return (
      <div className={styles.modal}>
        <div className={styles.modalOverlay} />
        <div className={styles.modalContent}>
          <p className={styles.loading}>Loading your reward...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={styles.modal}>
        <div className={styles.modalOverlay} />
        <div className={styles.modalContent}>
          <p className={styles.error}>{error}</p>
          <button onClick={onClose} className={styles.closeButton}>
            Close
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.modal}>
      <div className={styles.modalOverlay} />
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <h3>Scratch to Earn ✨</h3>
          {!hasScratchStarted && (
            <button onClick={onClose} className={styles.closeButton}>
              <X size={24} />
            </button>
          )}
        </div>

        <div className={styles.canvasContainer}>
          <canvas
            ref={backgroundCanvasRef}
            className={styles.backgroundCanvas}
          />
          <canvas
            ref={canvasRef}
            onMouseDown={(e) => { setIsDrawing(true); scratch(e); }}
            onMouseUp={() => setIsDrawing(false)}
            onMouseOut={() => setIsDrawing(false)}
            onMouseMove={scratch}
            onTouchStart={(e) => { setIsDrawing(true); scratch(e); }}
            onTouchEnd={() => setIsDrawing(false)}
            onTouchMove={scratch}
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

export default ScratchCard