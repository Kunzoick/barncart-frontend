import { useState, useEffect } from 'react'
import { Clock } from 'lucide-react'

export default function ReservationTimer({ expiresAt, onExpired }) {
  const [timeLeft, setTimeLeft] = useState(null)

  useEffect(() => {
    if (!expiresAt) return

    const calculateTimeLeft = () => {
      const expiry = new Date(expiresAt)
      const now = new Date()
      const diff = expiry - now

      if (diff <= 0) {
        setTimeLeft(null)
        onExpired?.()
        return
      }

      const minutes = Math.floor(diff / 1000 / 60)
      const seconds = Math.floor((diff / 1000) % 60)
      setTimeLeft({ minutes, seconds, diff })
    }

    calculateTimeLeft()
    const interval = setInterval(calculateTimeLeft, 1000)
    return () => clearInterval(interval)
  }, [expiresAt])

  if (!timeLeft) return null

  const isUrgent = timeLeft.diff < 5 * 60 * 1000 // under 5 minutes

  return (
    <div className={`flex items-center justify-center gap-2 p-3 rounded-lg
      text-sm font-medium ${
      isUrgent
        ? 'bg-red-50 text-red-600 border border-red-200'
        : 'bg-farm-greenMuted text-farm-green'
    }`}>
      <Clock className="w-4 h-4" />
      <span>
        Complete payment within{' '}
        <strong>
          {String(timeLeft.minutes).padStart(2, '0')}:
          {String(timeLeft.seconds).padStart(2, '0')}
        </strong>
        {' '}or your reservation expires
      </span>
    </div>
  )
}