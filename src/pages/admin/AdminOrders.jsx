import { useState, useEffect } from 'react'
import { getAdminOrders, fulfillOrder, resolveDispute } from '../../api/admin'
import { CheckCircle, AlertTriangle, ChevronDown, ChevronUp, ChevronLeft, ChevronRight } from 'lucide-react'

const STATUS_STYLES = {
  RESERVED:       'bg-blue-100 text-blue-700',
  PAID:           'bg-farm-greenMuted text-farm-green',
  FULFILLED:      'bg-gray-100 text-gray-600',
  CANCELLED:      'bg-red-100 text-red-600',
  EXPIRED:        'bg-gray-100 text-gray-500',
  PAYMENT_FAILED: 'bg-red-100 text-red-600',
  DELIVERED:      'bg-farm-greenMuted text-farm-green',
  DISPUTED:       'bg-orange-100 text-orange-600',
}

const STATUS_ORDER = ['PAID', 'DISPUTED', 'RESERVED', 'FULFILLED', 'PAYMENT_FAILED', 'CANCELLED', 'EXPIRED']
const PAGE_SIZE = 20

function OrderRow({ order, onFulfill, onResolve }) {
  const [expanded, setExpanded] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleFulfill() {
    setLoading(true)
    try { await onFulfill(order.orderId) }
    finally { setLoading(false) }
  }

  async function handleResolve() {
    setLoading(true)
    try { await onResolve(order.orderId) }
    finally { setLoading(false) }
  }

  const isDisputed = order.status === 'DISPUTED'

  return (
    <div className={`border rounded-lg bg-white overflow-hidden ${
      isDisputed ? 'border-orange-300' : 'border-gray-200'
    }`}>
      <div
        className="flex items-center gap-4 px-5 py-4 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => setExpanded(prev => !prev)}
      >
        {isDisputed && <AlertTriangle size={16} className="text-orange-500 shrink-0" />}
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full shrink-0
          ${STATUS_STYLES[order.status] ?? 'bg-gray-100 text-gray-600'}`}>
          {order.status}
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-farm-text truncate">
            {order.customerFirstName} - #{order.orderId.slice(-8).toUpperCase()}
          </p>
          <p className="text-xs text-gray-500 mt-0.5">
            {order.customerEmail} · {new Date(order.createdAt).toLocaleDateString('en-CA', {
              year: 'numeric', month: 'short', day: 'numeric'
            })}
          </p>
        </div>
        <div className="text-right shrink-0">
          <p className="text-sm font-semibold text-farm-text">
            ${Number(order.totalAmount).toFixed(2)} {order.currency}
          </p>
          <p className="text-xs text-gray-500">{order.pricingType}</p>
        </div>
        {expanded
          ? <ChevronUp size={16} className="text-gray-400 shrink-0" />
          : <ChevronDown size={16} className="text-gray-400 shrink-0" />}
      </div>

      {expanded && (
        <div className="border-t border-gray-100 px-5 py-4 bg-gray-50 space-y-3">
          <div className="space-y-2">
            {order.items.map(item => (
              <div key={item.orderItemId} className="flex justify-between text-sm">
                <span className="text-farm-text">
                  {item.produceName} × {item.quantity} {item.unit}
                </span>
                <span className="text-gray-600">
                  ${Number(item.priceAtPurchase).toFixed(2)}
                </span>
              </div>
            ))}
          </div>

          {order.status === 'PAID' && (
            <button onClick={handleFulfill} disabled={loading}
              className="mt-2 flex items-center gap-2 bg-farm-green hover:bg-farm-greenLight
                text-white text-sm font-medium px-4 py-2 rounded-md transition-colors
                disabled:opacity-50">
              <CheckCircle size={15} />
              {loading ? 'Marking fulfilled...' : 'Mark as Fulfilled'}
            </button>
          )}

          {isDisputed && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 space-y-2">
              <p className="text-xs font-semibold text-orange-700">Customer dispute raised</p>
              {order.disputeReason && (
                <p className="text-xs text-orange-600">Reason: {order.disputeReason}</p>
              )}
              <button onClick={handleResolve} disabled={loading}
                className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600
                  text-white text-xs font-medium px-3 py-1.5 rounded-md transition-colors
                  disabled:opacity-50">
                <CheckCircle size={13} />
                {loading ? 'Resolving...' : 'Mark Dispute Resolved'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default function AdminOrders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [currentPage, setCurrentPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)

  useEffect(() => {
    fetchOrders(currentPage)
  }, [currentPage])

  async function fetchOrders(page) {
    try {
      setLoading(true)
      const res = await getAdminOrders(page, PAGE_SIZE)
      setOrders(res.data.content)
      setTotalPages(res.data.totalPages)
      setTotalElements(res.data.totalElements)
    } catch {
      setError('Failed to load orders')
    } finally {
      setLoading(false)
    }
  }

  async function handleFulfill(orderId) {
    await fulfillOrder(orderId)
    setOrders(prev => prev.map(o =>
      o.orderId === orderId ? { ...o, status: 'FULFILLED' } : o
    ))
  }

  async function handleResolve(orderId) {
    await resolveDispute(orderId)
    setOrders(prev => prev.map(o =>
      o.orderId === orderId ? { ...o, status: 'FULFILLED' } : o
    ))
  }

  const filtered = statusFilter === 'ALL'
    ? orders
    : orders.filter(o => o.status === statusFilter)

  const counts = STATUS_ORDER.reduce((acc, s) => {
    acc[s] = orders.filter(o => o.status === s).length
    return acc
  }, {})

  const sorted = [...filtered].sort((a, b) => {
    if (a.status === 'DISPUTED' && b.status !== 'DISPUTED') return -1
    if (b.status === 'DISPUTED' && a.status !== 'DISPUTED') return 1
    return 0
  })

  if (loading) return <div className="text-gray-500 text-sm">Loading orders...</div>
  if (error) return <div className="text-red-500 text-sm">{error}</div>

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-farm-text">Orders</h1>
        <p className="text-gray-500 text-sm mt-1">{totalElements} total orders</p>
      </div>

      {/* Status filter tabs */}
      <div className="flex flex-wrap gap-2">
        <button onClick={() => setStatusFilter('ALL')}
          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
            statusFilter === 'ALL'
              ? 'bg-farm-green text-white'
              : 'bg-white border border-gray-200 text-gray-600 hover:border-farm-green'
          }`}>
          All ({orders.length})
        </button>
        {STATUS_ORDER.map(s => counts[s] > 0 && (
          <button key={s} onClick={() => setStatusFilter(s)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              statusFilter === s
                ? 'bg-farm-green text-white'
                : s === 'DISPUTED'
                  ? 'bg-orange-50 border border-orange-300 text-orange-600 hover:border-orange-400'
                  : 'bg-white border border-gray-200 text-gray-600 hover:border-farm-green'
            }`}>
            {s === 'DISPUTED' && '⚠ '}{s} ({counts[s]})
          </button>
        ))}
      </div>

      {/* Order list */}
      {sorted.length === 0 ? (
        <p className="text-gray-400 text-sm">No orders with status {statusFilter}.</p>
      ) : (
        <div className="space-y-3">
          {sorted.map(order => (
            <OrderRow key={order.orderId} order={order}
              onFulfill={handleFulfill}
              onResolve={handleResolve} />
          ))}
        </div>
      )}

      {/* Pagination controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <p className="text-xs text-gray-500">
            Page {currentPage + 1} of {totalPages}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
              disabled={currentPage === 0}
              className="p-1.5 rounded-md border border-gray-200 text-gray-600
                hover:border-farm-green disabled:opacity-40 disabled:cursor-not-allowed
                transition-colors">
              <ChevronLeft size={15} />
            </button>

            {/* Page number buttons — show max 5 pages */}
            {Array.from({ length: totalPages }, (_, i) => i)
              .filter(i => Math.abs(i - currentPage) <= 2)
              .map(i => (
                <button key={i}
                  onClick={() => setCurrentPage(i)}
                  className={`w-8 h-8 rounded-md text-xs font-medium transition-colors ${
                    i === currentPage
                      ? 'bg-farm-green text-white'
                      : 'border border-gray-200 text-gray-600 hover:border-farm-green'
                  }`}>
                  {i + 1}
                </button>
              ))}

            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))}
              disabled={currentPage === totalPages - 1}
              className="p-1.5 rounded-md border border-gray-200 text-gray-600
                hover:border-farm-green disabled:opacity-40 disabled:cursor-not-allowed
                transition-colors">
              <ChevronRight size={15} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}