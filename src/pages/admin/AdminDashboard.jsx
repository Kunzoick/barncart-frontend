import { useState, useEffect, useRef } from 'react'
import { getAdminOrders, getAdminBatches, getAdminListings } from '../../api/admin'
import { ClipboardList, CheckCircle, Clock, Package, Sprout, AlertTriangle, CalendarX } from 'lucide-react'

function useCountUp(target, duration = 600) {
  const [value, setValue] = useState(0)
  const frameRef = useRef(null)

  useEffect(() => {
    if (target === 0) { setValue(0); return }
    let start = null
    const step = (timestamp) => {
      if (!start) start = timestamp
      const progress = Math.min((timestamp - start) / duration, 1)
      setValue(Math.floor(progress * target))
      if (progress < 1) frameRef.current = requestAnimationFrame(step)
      else setValue(target)
    }
    frameRef.current = requestAnimationFrame(step)
    return () => cancelAnimationFrame(frameRef.current)
  }, [target, duration])

  return value
}

function StatCard({ icon: Icon, label, value, sub, color }) {
  const animated = useCountUp(typeof value === 'number' ? value : 0)

  const colors = {
    green:  { bg: 'bg-farm-greenMuted',  icon: 'text-farm-green',  border: 'border-farm-green/20' },
    amber:  { bg: 'bg-farm-amberLight',  icon: 'text-amber-600',   border: 'border-amber-200' },
    red:    { bg: 'bg-red-50',           icon: 'text-red-500',     border: 'border-red-200' },
    blue:   { bg: 'bg-blue-50',          icon: 'text-blue-500',    border: 'border-blue-200' },
  }
  const c = colors[color] ?? colors.green

  return (
    <div className={`rounded-xl border ${c.border} ${c.bg} p-5 flex items-start gap-4`}>
      <div className={`mt-0.5 ${c.icon}`}>
        <Icon size={22} />
      </div>
      <div>
        <p className="text-2xl font-bold text-farm-text">
          {typeof value === 'string' ? value : animated}
        </p>
        <p className="text-sm font-medium text-farm-text mt-0.5">{label}</p>
        {sub && <p className="text-xs text-gray-500 mt-0.5">{sub}</p>}
      </div>
    </div>
  )
}

function RecentOrderRow({ order }) {
  const STATUS_STYLES = {
    PAID:           'bg-farm-greenMuted text-farm-green',
    RESERVED:       'bg-blue-100 text-blue-700',
    FULFILLED:      'bg-gray-100 text-gray-500',
    CANCELLED:      'bg-red-100 text-red-600',
    EXPIRED:        'bg-gray-100 text-gray-500',
    PAYMENT_FAILED: 'bg-red-100 text-red-600',
    DISPUTED: 'bg-orange-100 text-orange-600',
  }

  return (
    <div className="flex items-center gap-4 py-3 border-b border-gray-100 last:border-0">
      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full shrink-0 ${STATUS_STYLES[order.status] ?? 'bg-gray-100 text-gray-600'}`}>
        {order.status}
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-farm-text truncate">
          {order.customerFirstName} — #{order.orderId.slice(-8).toUpperCase()}
        </p>
        <p className="text-xs text-gray-400 truncate">{order.customerEmail}</p>
      </div>
      <div className="text-right shrink-0">
        <p className="text-sm font-semibold text-farm-text">
          ${Number(order.totalAmount).toFixed(2)}
        </p>
        <p className="text-xs text-gray-400">
          {new Date(order.createdAt).toLocaleDateString('en-CA', {
            month: 'short', day: 'numeric'
          })}
        </p>
      </div>
    </div>
  )
}

export default function AdminDashboard() {
  const [orders, setOrders] = useState([])
  const [batches, setBatches] = useState([])
  const [listings, setListings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetchAll() {
      try {
        const [orderRes, batchRes, listingRes] = await Promise.all([
          getAdminOrders(0, 100),
          getAdminBatches(),
          getAdminListings(),
        ])
        setOrders(orderRes.data.content ?? orderRes.data)
        setBatches(batchRes.data)
        setListings(listingRes.data.content ?? listingRes.data)
      } catch {
        setError('Failed to load dashboard data')
      } finally {
        setLoading(false)
      }
    }
    fetchAll()
  }, [])

  const toFulfill     = orders.filter(o => o.status === 'PAID').length
  const reserved      = orders.filter(o => o.status === 'RESERVED').length
  const activeBatches = batches.filter(b => b.status === 'ACTIVE').length
  const lowStock      = listings.filter(l => l.lowStock).length
  const today         = new Date().toISOString().split('T')[0]
  const sevenDaysOut  = new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0]
  const expiringSoon = batches.filter(b => b.status === 'ACTIVE' && b.expiryDate > today && b.expiryDate <= sevenDaysOut).length
  const expiredStock = batches.filter(b => b.status === 'ACTIVE' && b.expiryDate <= today).length
  const pendingConfirmation = orders.filter(o => o.status === 'FULFILLED').length
  const totalRevenue  = orders
    .filter(o => o.status === 'PAID' || o.status === 'FULFILLED')
    .reduce((sum, o) => sum + Number(o.totalAmount), 0)
    .toFixed(2)
  const recentOrders  = [...orders]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5)
  const disputed = orders.filter(o => o.status === 'DISPUTED').length

  if (loading) return <div className="text-gray-500 text-sm">Loading dashboard...</div>
  if (error)   return <div className="text-red-500 text-sm">{error}</div>

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-farm-text">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">
          {new Date().toLocaleDateString('en-CA', {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
          })}
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          icon={CheckCircle}
          label="Orders to Fulfill"
          value={toFulfill}
          sub="PAID — awaiting fulfillment"
          color="green"
        />
        <StatCard
          icon={AlertTriangle}
          label="Active Disputes"
          value={disputed}
          sub="Requires admin review"
          color={disputed > 0 ? 'red' : 'green'}
        />
        <StatCard
          icon={Clock}
          label="Reserved Orders"
          value={reserved}
          sub="Awaiting payment confirmation"
          color="blue"
        />
        <StatCard
          icon={ClipboardList}
          label="Total Revenue"
          value={`$${totalRevenue}`}
          sub="PAID + FULFILLED orders"
          color="green"
        />
        <StatCard
          icon={Sprout}
          label="Active Batches"
          value={activeBatches}
          sub="Batches with available stock"
          color="green"
        />
        <StatCard
          icon={Package}
          label="Active Listings"
          value={listings.length}
          sub="Visible to customers"
          color="green"
        />
        <StatCard
          icon={AlertTriangle}
          label="Low Stock"
          value={lowStock}
          sub="Listings below threshold"
          color={lowStock > 0 ? 'amber' : 'green'}
        />
        <StatCard
        icon={CalendarX}
        label="Expiring Soon"
        value={expiringSoon}
        sub="Active batches expiring within 7 days"
        color={expiringSoon > 0 ? 'amber' : 'green'}
        />
        <StatCard
        icon={CalendarX}
        label="Expired Stock"
        value={expiredStock}
        sub="Active batches past expiry date"
        color={expiredStock > 0 ? 'red' : 'green'}
        />
        <StatCard
        icon={Clock}
        label="Awaiting Confirmation"
        value={pendingConfirmation}
        sub="FULFILLED - waiting for customer confirmation"
        color={pendingConfirmation > 0 ? 'amber' : 'green'}
        />
      </div>

      {/* Recent orders */}
      <div>
        <h2 className="text-base font-semibold text-farm-text mb-3">Recent Orders</h2>
        {recentOrders.length === 0 ? (
          <p className="text-gray-400 text-sm">No orders yet.</p>
        ) : (
          <div className="bg-white border border-gray-200 rounded-xl px-5 divide-y divide-gray-100">
            {recentOrders.map(order => (
              <RecentOrderRow key={order.orderId} order={order} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}