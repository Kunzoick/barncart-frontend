import { useState, useEffect } from 'react'
import { Clock } from 'lucide-react'

export default function ReservationTimer({ expiresAt, onExpired }) {
  const [timeLeft, setTimeLeft] = useState(null)

  useEffect(() => {
    if (!expiresAt) return

    const calculateTimeLeft = () => {
      // Append Z if not already present — backend returns LocalDateTime
      // with no timezone suffix. Without Z, mobile Chrome interprets it
      // as local time instead of UTC, making the expiry appear in the past.
      const rawString = expiresAt.endsWith('Z') ? expiresAt : expiresAt + 'Z'
      const expiry = new Date(rawString)
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

  const isUrgent = timeLeft.diff < 5 * 60 * 1000

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