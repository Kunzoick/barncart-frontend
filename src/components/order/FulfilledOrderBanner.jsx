import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getOrders } from '../../api/orders'
import { useAuth } from '../../context/AuthContext'
import { PackageCheck, X } from 'lucide-react'

export default function FulfilledOrderBanner() {
  const { user } = useAuth()
  const [fulfilledOrders, setFulfilledOrders] = useState([])
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    if (!user) return
    getOrders()
      .then(res => {
        const fulfilled = res.data.filter(o => o.status === 'FULFILLED')
        setFulfilledOrders(fulfilled)
      })
      .catch(() => {})
  }, [user])

  if (!user || fulfilledOrders.length === 0 || dismissed) return null

  return (
    <div className="bg-amber-50 border-b border-amber-200 px-4 py-3">
      <div className="max-w-6xl mx-auto flex items-start gap-3">
        <PackageCheck className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="flex-1 text-sm text-amber-800">
          <span className="font-semibold">
            {fulfilledOrders.length === 1
              ? 'You have an order awaiting confirmation.'
              : `You have ${fulfilledOrders.length} orders awaiting confirmation.`}
          </span>
          {' '}Please confirm receipt or raise a dispute within 48 hours — after
          that your order will be automatically marked as delivered.{' '}
          <Link
            to={fulfilledOrders.length === 1
              ? `/orders/${fulfilledOrders[0].orderId}`
              : '/orders'}
            className="font-medium underline hover:text-amber-900 transition-colors"
          >
            {fulfilledOrders.length === 1 ? 'View order' : 'View orders'}
          </Link>
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="text-amber-500 hover:text-amber-700 transition-colors shrink-0"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}