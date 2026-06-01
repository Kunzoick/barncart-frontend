import { useEffect, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { getOrders } from '../api/orders'
import { useAuth } from '../context/AuthContext'
import { useOrderStatus } from '../hooks/useOrderStatus'
import OrderStatusBadge from '../components/order/OrderStatusBadge'
import { ShoppingBag } from 'lucide-react'

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-CA', {
    month: 'short', day: 'numeric', year: 'numeric'
  })
}

export default function Orders() {
  const { user } = useAuth()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState(null)

  const fetchOrders = useCallback(() => {
    getOrders()
      .then(res => setOrders(res.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  // initial load
  useEffect(() => {
    fetchOrders()
  }, [fetchOrders])

  // refetch when tab regains focus — catches expiry that happened while tab was backgrounded
  useEffect(() => {
    window.addEventListener('focus', fetchOrders)
    return () => window.removeEventListener('focus', fetchOrders)
  }, [fetchOrders])

  useOrderStatus((update) => {
    setOrders(prev => prev.map(order =>
      order.orderId === update.orderId
        ? { ...order, status: update.currentStatus }
        : order
    ))
    setToast(`Order status updated to ${update.currentStatus}`)
    setTimeout(() => setToast(null), 4000)
  })

  if (!user) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <p className="text-gray-500 text-sm">Please log in to view your orders.</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex flex-col gap-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-24 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {toast && (
        <div className="fixed top-20 right-4 bg-farm-green text-white px-4 py-3
          rounded-lg shadow-lg text-sm font-medium z-50 animate-pulse">
          {toast}
        </div>
      )}

      <h1 className="text-2xl font-bold text-farm-text mb-6">My Orders</h1>

      {orders.length === 0 && (
        <div className="text-center py-16">
          <ShoppingBag className="w-12 h-12 text-gray-200 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-farm-text mb-2">No orders yet</h2>
          <p className="text-gray-500 text-sm mb-6">
            Browse fresh produce and place your first order
          </p>
          <Link to="/listings"
            className="bg-farm-green text-white px-6 py-2.5 rounded-lg
              text-sm font-medium hover:bg-farm-greenLight transition-colors">
            Shop Now
          </Link>
        </div>
      )}

      <div className="flex flex-col gap-3">
        {orders.map(order => (
          <Link
            key={order.orderId}
            to={`/orders/${order.orderId}`}
            className="bg-white rounded-xl border border-gray-100 p-4
              hover:shadow-md transition-shadow flex items-center justify-between gap-4"
          >
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <OrderStatusBadge status={order.status} />
                <span className="text-xs text-gray-400">
                  {formatDate(order.createdAt)}
                </span>
              </div>
              <p className="text-sm font-medium text-farm-text">
                {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
                {' · '}
                {order.items.map(i => i.produceName).join(', ')}
              </p>
            </div>
            <div className="text-right shrink-0">
              <p className="font-bold text-farm-text">
                ${order.totalAmount} CAD
              </p>
              <p className="text-xs text-gray-400">{order.pricingType}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}