import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useOrderStatus } from '../hooks/useOrderStatus'
import OrderStatusBadge from '../components/order/OrderStatusBadge'
import ReservationTimer from '../components/checkout/ReservationTimer'
import { ArrowLeft } from 'lucide-react'
import { getOrderById, cancelOrder, confirmDelivery, disputeOrder } from '../api/orders'

const DISPUTE_REASONS = [
  'Items were incomplete',
  'Wrong items delivered',
  'Items were damaged',
  'Order never arrived',
  'Other',
]

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-CA', {
    month: 'long', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  })
}

export default function OrderDetail() {
  const { orderId } = useParams()
  const navigate = useNavigate()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [cancelling, setCancelling] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const [disputing, setDisputing] = useState(false)
  const [showDisputeForm, setShowDisputeForm] = useState(false)
  const [disputeReason, setDisputeReason] = useState(DISPUTE_REASONS[0])
  const [error, setError] = useState(null)
  const [toast, setToast] = useState(null)

  useEffect(() => {
    getOrderById(orderId)
      .then(res => setOrder(res.data))
      .catch(() => setError('Order not found.'))
      .finally(() => setLoading(false))
  }, [orderId])

  useOrderStatus((update) => {
    if (update.orderId === orderId) {
      setOrder(prev => prev ? { ...prev, status: update.currentStatus } : prev)
      setToast(`Order status updated to ${update.currentStatus}`)
      setTimeout(() => setToast(null), 4000)
    }
  })

  const handleCancel = async () => {
    if (!confirm('Are you sure you want to cancel this order?')) return
    setCancelling(true)
    try {
      const res = await cancelOrder(orderId)
      setOrder(res.data)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to cancel order.')
    } finally {
      setCancelling(false)
    }
  }

  const handleConfirmDelivery = async () => {
    if (!confirm('Confirm you have received your order?')) return
    setConfirming(true)
    try {
      await confirmDelivery(orderId)
      setOrder(prev => ({ ...prev, status: 'DELIVERED' }))
      setToast('Delivery confirmed. Thank you!')
      setTimeout(() => setToast(null), 4000)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to confirm delivery.')
    } finally {
      setConfirming(false)
    }
  }

  const handleDispute = async () => {
    setDisputing(true)
    try {
      await disputeOrder(orderId, disputeReason)
      setOrder(prev => ({ ...prev, status: 'DISPUTED' }))
      setShowDisputeForm(false)
      setToast('Dispute submitted. Our team will review it.')
      setTimeout(() => setToast(null), 5000)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit dispute.')
    } finally {
      setDisputing(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="animate-pulse flex flex-col gap-4">
          <div className="h-8 bg-gray-100 rounded w-32" />
          <div className="h-32 bg-gray-100 rounded-xl" />
          <div className="h-48 bg-gray-100 rounded-xl" />
        </div>
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8 text-center">
        <p className="text-red-500 text-sm mb-4">{error || 'Order not found.'}</p>
        <button onClick={() => navigate('/orders')}
          className="text-farm-green text-sm hover:underline">
          Back to orders
        </button>
      </div>
    )
  }

  const canCancel = order.status === 'RESERVED'
  const canConfirmOrDispute = order.status === 'FULFILLED'

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">

      {toast && (
        <div className="fixed top-20 right-4 bg-farm-green text-white px-4 py-3
          rounded-lg shadow-lg text-sm font-medium z-50">
          {toast}
        </div>
      )}

      <button onClick={() => navigate('/orders')}
        className="flex items-center gap-1 text-sm text-gray-500
          hover:text-farm-green transition-colors mb-6">
        <ArrowLeft className="w-4 h-4" />
        Back to orders
      </button>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-farm-text">Order Details</h1>
          <p className="text-xs text-gray-400 mt-1">Placed {formatDate(order.createdAt)}</p>
        </div>
        <OrderStatusBadge status={order.status} />
      </div>

      {order.status === 'RESERVED' && order.reservationExpiresAt && (
        <div className="mb-4">
          <ReservationTimer
            expiresAt={order.reservationExpiresAt}
            onExpired={() => setOrder(prev => ({ ...prev, status: 'EXPIRED' }))}
          />
        </div>
      )}

      {error && (
        <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200
          rounded-lg text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Order items */}
      <div className="bg-white rounded-xl border border-gray-100 p-5 mb-4">
        <h2 className="font-semibold text-farm-text mb-3">Items</h2>
        <div className="flex flex-col gap-3">
          {order.items.map(item => (
            <div key={item.orderItemId}
              className="flex justify-between items-center text-sm">
              <div>
                <p className="font-medium text-farm-text">{item.produceName}</p>
                <p className="text-xs text-gray-400">
                  {item.quantity} {item.unit?.toLowerCase()} ·{' '}
                  <span className={item.pricingType === 'BULK'
                    ? 'text-farm-green' : 'text-gray-400'}>
                    {item.pricingType}
                  </span>
                </p>
              </div>
              <p className="font-semibold text-farm-text">
                ${(item.priceAtPurchase * item.quantity).toFixed(2)}
              </p>
            </div>
          ))}
        </div>
        <div className="border-t border-gray-100 mt-4 pt-4 flex justify-between
          font-semibold text-farm-text">
          <span>Total</span>
          <span>${order.totalAmount} CAD</span>
        </div>
      </div>

      {/* Cancel button */}
      {canCancel && (
        <div className="mb-4">
          <button onClick={handleCancel} disabled={cancelling}
            className="w-full border border-red-200 text-red-500 py-3 rounded-lg
              text-sm font-medium hover:bg-red-50 transition-colors
              disabled:opacity-60 disabled:cursor-not-allowed">
            {cancelling ? 'Cancelling...' : 'Cancel Order'}
          </button>
        </div>
      )}

      {/* Confirm + Dispute buttons */}
      {canConfirmOrDispute && (
        <div className="flex flex-col gap-3 mb-4">
          <button onClick={handleConfirmDelivery} disabled={confirming}
            className="w-full bg-farm-green text-white py-3 rounded-lg
              text-sm font-medium hover:bg-farm-greenLight transition-colors
              disabled:opacity-60 disabled:cursor-not-allowed">
            {confirming ? 'Confirming...' : '✓ Confirm I Received My Order'}
          </button>
          <button onClick={() => setShowDisputeForm(prev => !prev)}
            className="w-full border border-orange-200 text-orange-600 py-3 rounded-lg
              text-sm font-medium hover:bg-orange-50 transition-colors">
            I Have a Problem With My Order
          </button>
          <p className="text-xs text-gray-400 text-center">
            If you don't confirm within 48 hours, it will be confirmed automatically and marked as delivered.
          </p>
        </div>
      )}

      {/* Dispute form */}
      {showDisputeForm && (
        <div className="mb-4 bg-orange-50 border border-orange-200 rounded-xl p-4">
          <h3 className="text-sm font-semibold text-orange-700 mb-3">
            What went wrong?
          </h3>
          <select
            value={disputeReason}
            onChange={e => setDisputeReason(e.target.value)}
            className="w-full border border-orange-200 rounded-lg px-3 py-2
              text-sm text-farm-text bg-white mb-3 focus:outline-none
              focus:ring-2 focus:ring-orange-300">
            {DISPUTE_REASONS.map(r => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
          <button onClick={handleDispute} disabled={disputing}
            className="w-full bg-orange-500 text-white py-2.5 rounded-lg
              text-sm font-medium hover:bg-orange-600 transition-colors
              disabled:opacity-60 disabled:cursor-not-allowed">
            {disputing ? 'Submitting...' : 'Submit Dispute'}
          </button>
        </div>
      )}

      {/* Disputed notice */}
      {order.status === 'DISPUTED' && (
        <div className="mb-4 px-4 py-3 bg-orange-50 border border-orange-200
          rounded-lg text-sm text-orange-700">
          Your dispute has been submitted. Our team will review and resolve it shortly.
        </div>
      )}

      {order.cancellationReason && (
        <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200
          rounded-lg text-sm text-red-700">
          {order.cancellationReason}
        </div>
      )}
    </div>
  )
}