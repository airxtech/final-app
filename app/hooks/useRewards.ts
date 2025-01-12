import { useState } from 'react'

export const useRewards = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleScratchCard = async () => {
    setLoading(true)
    setError(null)

    try {
      // Generate random reward between 0.5 and 2 ZOA
      const reward = 0.5 + Math.random() * 1.5
      return reward
    } catch (err) {
      setError('Failed to generate reward')
      return null
    } finally {
      setLoading(false)
    }
  }

  return {
    handleScratchCard,
    loading,
    error
  }
}