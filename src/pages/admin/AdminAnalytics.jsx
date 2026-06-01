import { useState, useEffect } from 'react'
import api from '../../api/axios'
import { TrendingUp, ShoppingBag, DollarSign, Package } from 'lucide-react'

const STATUS_COLORS = {
  DELIVERED:      '#2D6A4F',
  PAID:           '#52B788',
  FULFILLED:      '#74C69D',
  RESERVED:       '#3B82F6',
  CANCELLED:      '#EF4444',
  EXPIRED:        '#9CA3AF',
  PAYMENT_FAILED: '#F87171',
  DISPUTED:       '#F97316',
}

function StatCard({ icon: Icon, label, value, sub, color = 'green' }) {
  const colors = {
    green: { bg: 'bg-farm-greenMuted', icon: 'text-farm-green', border: 'border-farm-green/20' },
    amber: { bg: 'bg-farm-amberLight', icon: 'text-amber-600',  border: 'border-amber-200' },
    blue:  { bg: 'bg-blue-50',         icon: 'text-blue-500',   border: 'border-blue-200' },
  }
  const c = colors[color] ?? colors.green
  return (
    <div className={`rounded-xl border ${c.border} ${c.bg} p-5 flex items-start gap-4`}>
      <div className={`mt-0.5 ${c.icon}`}><Icon size={22} /></div>
      <div>
        <p className="text-2xl font-bold text-farm-text">{value}</p>
        <p className="text-sm font-medium text-farm-text mt-0.5">{label}</p>
        {sub && <p className="text-xs text-gray-500 mt-0.5">{sub}</p>}
      </div>
    </div>
  )
}

function BarChartCSS({ data }) {
  if (!data || data.length === 0) {
    return <p className="text-gray-400 text-sm text-center py-8">No revenue data yet.</p>
  }
  const max = Math.max(...data.map(d => d.revenue))
  return (
    <div className="flex items-end gap-2 h-48 px-2">
      {data.map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1">
          <span className="text-xs text-gray-500 font-medium">
            ${d.revenue.toFixed(0)}
          </span>
          <div className="w-full relative flex items-end" style={{ height: '140px' }}>
            <div
              className="w-full bg-farm-green rounded-t-md transition-all duration-500
                hover:bg-farm-greenLight"
              style={{ height: max > 0 ? `${(d.revenue / max) * 100}%` : '4px',
                minHeight: '4px' }}
            />
          </div>
          <span className="text-xs text-gray-400 text-center truncate w-full">
            {d.week}
          </span>
        </div>
      ))}
    </div>
  )
}

function DonutChart({ data }) {
  if (!data || data.length === 0) {
    return <p className="text-gray-400 text-sm text-center py-8">No orders yet.</p>
  }
  const total = data.reduce((sum, d) => sum + d.value, 0)
  const size = 180
  const cx = size / 2
  const cy = size / 2
  const r = 70
  const innerR = 42

  let cumAngle = -90
  const slices = data.map(d => {
    const angle = (d.value / total) * 360
    const start = cumAngle
    cumAngle += angle
    return { ...d, startAngle: start, endAngle: cumAngle }
  })

  function polarToCartesian(cx, cy, r, angle) {
    const rad = (angle * Math.PI) / 180
    return {
      x: cx + r * Math.cos(rad),
      y: cy + r * Math.sin(rad),
    }
  }

  function arcPath(cx, cy, r, startAngle, endAngle) {
    const start = polarToCartesian(cx, cy, r, endAngle)
    const end = polarToCartesian(cx, cy, r, startAngle)
    const largeArc = endAngle - startAngle > 180 ? 1 : 0
    const startIn = polarToCartesian(cx, cy, innerR, endAngle)
    const endIn = polarToCartesian(cx, cy, innerR, startAngle)
    return [
      `M ${start.x} ${start.y}`,
      `A ${r} ${r} 0 ${largeArc} 0 ${end.x} ${end.y}`,
      `L ${endIn.x} ${endIn.y}`,
      `A ${innerR} ${innerR} 0 ${largeArc} 1 ${startIn.x} ${startIn.y}`,
      'Z'
    ].join(' ')
  }

  return (
    <div className="flex flex-col md:flex-row items-center gap-6">
      <svg width={size} height={size} className="shrink-0">
        {slices.map((s, i) => (
          <path key={i}
            d={arcPath(cx, cy, r, s.startAngle, s.endAngle)}
            fill={STATUS_COLORS[s.name] ?? '#D1D5DB'}
            stroke="white"
            strokeWidth="2"
          />
        ))}
        <text x={cx} y={cy - 8} textAnchor="middle"
          className="text-farm-text" fontSize="22" fontWeight="bold" fill="#1A1A1A">
          {total}
        </text>
        <text x={cx} y={cy + 12} textAnchor="middle"
          fontSize="11" fill="#6B7280">
          orders
        </text>
      </svg>

      {/* Legend */}
      <div className="flex flex-col gap-2 flex-1">
        {slices.map((s, i) => (
          <div key={i} className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-sm shrink-0"
                style={{ backgroundColor: STATUS_COLORS[s.name] ?? '#D1D5DB' }} />
              <span className="text-farm-text">{s.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-500">{s.value}</span>
              <span className="text-xs text-gray-400">
                ({((s.value / total) * 100).toFixed(0)}%)
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function AdminAnalytics() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    api.get('/api/admin/analytics')
      .then(res => setData(res.data))
      .catch(() => setError('Failed to load analytics'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="text-gray-500 text-sm">Loading analytics...</div>
  if (error)   return <div className="text-red-500 text-sm">{error}</div>

  const barData = data.revenueByWeek.map(w => ({
    week: w.week.replace(/^\d{4}-/, ''),
    revenue: Number(w.revenue),
  }))

  const pieData = data.ordersByStatus.map(s => ({
    name: s.status,
    value: Number(s.count),
  }))

  const topProducts = data.topProducts.map(p => ({
    name: p.produceName,
    quantity: Number(p.totalQuantity),
    revenue: Number(p.totalRevenue),
  }))

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-farm-text">Analytics</h1>
        <p className="text-gray-500 text-sm mt-1">Revenue and order insights</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard icon={DollarSign} label="Total Revenue"
          value={`$${data.totalRevenue}`}
          sub="PAID + FULFILLED + DELIVERED" color="green" />
        <StatCard icon={ShoppingBag} label="Total Orders"
          value={data.totalOrders} sub="All time" color="blue" />
        <StatCard icon={TrendingUp} label="Completed Orders"
          value={data.completedOrders}
          sub="Paid, fulfilled, delivered" color="green" />
        <StatCard icon={Package} label="Avg Order Value"
          value={`$${data.averageOrderValue}`}
          sub="Completed orders only" color="amber" />
      </div>

      {/* Revenue bar chart */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h2 className="text-base font-semibold text-farm-text mb-6">
          Revenue — Last 8 Weeks
        </h2>
        <BarChartCSS data={barData} />
      </div>

      {/* Orders by status + Top products */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h2 className="text-base font-semibold text-farm-text mb-6">
            Orders by Status
          </h2>
          <DonutChart data={pieData} />
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h2 className="text-base font-semibold text-farm-text mb-6">
            Top Products by Volume
          </h2>
          {topProducts.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-8">No sales yet.</p>
          ) : (
            <div className="space-y-3">
              {topProducts.map((p, i) => (
                <div key={p.name}
                  className="flex items-center gap-4 py-2 border-b
                    border-gray-50 last:border-0">
                  <span className="text-xs font-bold text-gray-300 w-5">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-farm-text truncate">{p.name}</p>
                    <p className="text-xs text-gray-400">{p.quantity} units sold</p>
                  </div>
                  <p className="text-sm font-semibold text-farm-green shrink-0">
                    ${p.revenue.toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}