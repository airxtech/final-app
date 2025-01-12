'use client'

import { useState, useEffect, useRef } from 'react'
import { useTelegram } from '@/app/contexts/TelegramContext'
import ScratchCard from '@/app/components/ScratchCard'
import styles from './styles.module.css'

export default function Earn() {
  const [zoaBalance, setZoaBalance] = useState(0)
  const [showScratchCard, setShowScratchCard] = useState(false)
  const [scratchChances, setScratchChances] = useState(3)
  const [isFarming, setIsFarming] = useState(false)
  const [farmingAmount, setFarmingAmount] = useState(0)
  const farmingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const { user } = useTelegram()

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user?.id) return

      try {
        const response = await fetch(`/api/earn?telegramId=${user.id}`)
        const data = await response.json()
        if (data.success) {
          setZoaBalance(data.zoaBalance)
          setScratchChances(data.scratchChances)
        }
      } catch (error) {
        console.error('Failed to fetch user data:', error)
      }
    }

    fetchUserData()
  }, [user?.id])

  const handleFarming = async () => {
    if (!user?.id) return

    if (isFarming) {
      if (farmingIntervalRef.current) {
        clearInterval(farmingIntervalRef.current)
        farmingIntervalRef.current = null
      }
      
      const finalAmount = farmingAmount
      setFarmingAmount(0)
      setIsFarming(false)

      try {
        const response = await fetch('/api/earn/farming-reward', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            amount: finalAmount,
            telegramId: user.id
          }),
        })
        const data = await response.json()
        if (data.success) {
          setZoaBalance(prev => prev + finalAmount)
        }
      } catch (error) {
        console.error('Failed to process farming reward:', error)
      }
    } else {
      setIsFarming(true)
      let accumulated = 0
      farmingIntervalRef.current = setInterval(() => {
        accumulated += 0.0002
        setFarmingAmount(prev => prev + 0.0002)
      }, 1000)
    }
  }

  useEffect(() => {
    return () => {
      if (farmingIntervalRef.current) {
        clearInterval(farmingIntervalRef.current)
      }
    }
  }, [])

  const handleScratchReveal = async (amount: number) => {
    if (!user?.id) return

    try {
      const response = await fetch('/api/earn/scratch-reward', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          amount,
          telegramId: user.id
        }),
      })
      const data = await response.json()
      if (data.success) {
        setZoaBalance(prev => prev + amount)
        setScratchChances(prev => prev - 1)
      }
    } catch (error) {
      console.error('Failed to process scratch reward:', error)
    }
  }

  return (
    <div className={styles.earnPage}>
      <div className={styles.balanceDisplay}>
        <h2>ZOA Balance</h2>
        <h1>{zoaBalance.toFixed(2)} ZOA</h1>
      </div>

      <div className={styles.actionsContainer}>
        <div className={styles.scratchSection}>
          <h3>Scratch to Earn</h3>
          <p>{scratchChances} chances remaining today</p>
          <button 
            onClick={() => setShowScratchCard(true)}
            disabled={scratchChances <= 0}
            className={`${styles.actionButton} ${scratchChances <= 0 ? styles.disabled : ''}`}
          >
            Scratch Now
          </button>
        </div>

        <div className={styles.farmingSection}>
          <h3>Farming</h3>
          {farmingAmount > 0 && (
            <p className={styles.farmingAmount}>
              {farmingAmount.toFixed(4)} ZOA accumulated
            </p>
          )}
          <button 
            onClick={handleFarming}
            className={styles.actionButton}
          >
            {isFarming ? 'Stop Farming' : 'Start Farming'}
          </button>
          {isFarming && (
            <p className={styles.farmingDisclaimer}>
              Farming pauses if you minimize or close the app
            </p>
          )}
        </div>
      </div>

      {showScratchCard && (
        <ScratchCard 
          onClose={() => setShowScratchCard(false)}
          onReveal={handleScratchReveal}
        />
      )}
    </div>
  )
}