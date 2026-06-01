export default function OrderStatusBadge({ status }) {
  const config = {
    PENDING:        { label: 'Pending',        className: 'bg-gray-100 text-gray-600' },
    RESERVED:       { label: 'Reserved',       className: 'bg-blue-50 text-blue-600' },
    PAID:           { label: 'Paid',           className: 'bg-farm-greenMuted text-farm-green' },
    FULFILLED:      { label: 'Fulfilled',      className: 'bg-green-100 text-green-700' },
    CANCELLED:      { label: 'Cancelled',      className: 'bg-red-50 text-red-600' },
    EXPIRED:        { label: 'Expired',        className: 'bg-gray-100 text-gray-400' },
    PAYMENT_FAILED: { label: 'Payment Failed', className: 'bg-red-50 text-red-600' },
    DISPUTED:       { label: 'Disputed',       className: 'bg-orange-100 text-orange-600'}
  }

  const { label, className } = config[status] || { label: status, className: 'bg-gray-100 text-gray-600' }

  return (
    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${className}`}>
      {label}
    </span>
  )
}
