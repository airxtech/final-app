'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useTonConnectUI } from '@tonconnect/ui-react'
import styles from './styles.module.css'
import ScratchCard from '@/app/components/shared/ScratchCard'
import { getTelegramUser } from '@/app/utils/telegram'

interface User {
  telegramId: number;
  zoaBalance: number;
  scratchChances: number;
  walletAddress: string | null;
}

export default function EarnPage() {
  const [user, setUser] = useState<User | null>(null)
  const [showScratchCard, setShowScratchCard] = useState(false)
  const [farming, setFarming] = useState(false)
  const [farmingAmount, setFarmingAmount] = useState(0)
  const [lastUpdate, setLastUpdate] = useState<number>(Date.now())
  const router = useRouter()
  const [tonConnectUI] = useTonConnectUI()

  useEffect(() => {
    fetchUserData()
  }, [])

  useEffect(() => {
    if (!farming) return

    const interval = setInterval(() => {
      const now = Date.now()
      const timeDiff = now - lastUpdate
      const increment = (timeDiff / 1000) * 0.0002
      setFarmingAmount(prev => prev + increment)
      setLastUpdate(now)
    }, 100)

    return () => clearInterval(interval)
  }, [farming, lastUpdate])

  // Cleanup effect for farming
  useEffect(() => {
    return () => {
      if (farming && user) {
        // Stop farming cleanup
        const stopFarming = async () => {
          try {
            const response = await fetch('/api/user', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                telegramId: user.telegramId,
                zoaBalance: user.zoaBalance + farmingAmount
              })
            })

            if (response.ok) {
              const updatedUser = await response.json()
              setUser(updatedUser)
              setFarmingAmount(0)
            }
          } catch (error) {
            console.error('Error updating balance:', error)
          }
        }

        stopFarming()
      }
    }
  }, [farming, user, farmingAmount])

  const fetchUserData = async () => {
    try {
      const userId = getTelegramUser()
      if (!userId) return

      const response = await fetch(`/api/user?telegramId=${userId}`)
      const data = await response.json()
      
      if (response.ok) {
        setUser(data)
      }
    } catch (error) {
      console.error('Error fetching user data:', error)
    }
  }

  const handleScratchReveal = async (amount: number) => {
    if (!user) return

    try {
      const response = await fetch('/api/user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          telegramId: user.telegramId,
          zoaBalance: user.zoaBalance + amount,
          scratchChances: user.scratchChances - 1
        })
      })

      if (response.ok) {
        const updatedUser = await response.json()
        setUser(updatedUser)
      }
    } catch (error) {
      console.error('Error updating balance:', error)
    }
  }

  const handleStartFarming = () => {
    if (!tonConnectUI.connected) {
      router.push('/wallet')
      return
    }
    
    setFarming(true)
    setLastUpdate(Date.now())
    setFarmingAmount(0)
    
    const disclaimer = document.createElement('div')
    disclaimer.className = styles.farmingDisclaimer
    disclaimer.textContent = 'Farming pauses if you minimize or close the app'
    document.body.appendChild(disclaimer)
    
    setTimeout(() => {
      disclaimer.remove()
    }, 3000)
  }

  if (!user) {
    return <div className={styles.loading}>Loading...</div>
  }

  return (
    <div className={styles.earnPage}>
      <div className={styles.balanceCard}>
        <h2>Your ZOA Balance</h2>
        <div className={styles.balance}>
          {user.zoaBalance.toFixed(4)} ZOA
          {farming && farmingAmount > 0 && (
            <span className={styles.farming}>
              +{farmingAmount.toFixed(4)}
            </span>
          )}
        </div>
      </div>

      <div className={styles.earnMethods}>
        <div className={styles.scratchSection}>
          <h3>Scratch to Earn</h3>
          <p>Scratch cards refresh daily. Remaining today: {user.scratchChances}</p>
          <button
            onClick={() => tonConnectUI.connected ? setShowScratchCard(true) : router.push('/wallet')}
            disabled={user.scratchChances <= 0}
            className={styles.scratchButton}
          >
            {user.scratchChances > 0 ? 'Scratch & Earn' : 'No chances left today'}
          </button>
        </div>

        <div className={styles.farmingSection}>
          <h3>ZOA Farming</h3>
          <p>Earn 0.0002 ZOA per second while farming</p>
          <button
            onClick={farming ? () => setFarming(false) : handleStartFarming}
            className={`${styles.farmButton} ${farming ? styles.active : ''}`}
          >
            {farming ? 'Stop Farming' : 'Start Farming'}
          </button>
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