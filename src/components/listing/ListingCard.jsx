import { Link } from 'react-router-dom'
import { Calendar, Package, AlertTriangle } from 'lucide-react'

// Formats a date string to readable format
function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-CA', {
    month: 'short', day: 'numeric', year: 'numeric'
  })
}

// Displays unit quantity label
// For BAG unit with bagWeightKg: "50kg bags"
// For others: "per KG", "per LB" etc
function UnitLabel({ unit, bagWeightKg }) {
  if (unit === 'BAG' && bagWeightKg) {
    return <span className="text-xs text-gray-400">{bagWeightKg}kg bags</span>
  }
  return <span className="text-xs text-gray-400">per {unit}</span>
}

export default function ListingCard({ listing }) {
  const {
    listingId,
    produceName,
    category,
    unit,
    bagWeightKg,
    imageUrl,
    retailPrice,
    bulkPrice,
    minBulkQuantity,
    currency,
    harvestedAt,
    expiryDate,
    quantityAvailable,
    percentageRemaining,
    lowStock,
    batchStatus
  } = listing

  const isAvailable = batchStatus === 'ACTIVE' && quantityAvailable > 0

  return (
    <Link
      to={`/listings/${listingId}`}
      className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md
        transition-shadow overflow-hidden flex flex-col group"
    >
      {/* Image */}
      <div className="relative aspect-video bg-gray-50 overflow-hidden">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={produceName}
            className="w-full h-full object-cover group-hover:scale-105
              transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package className="w-12 h-12 text-gray-200" />
          </div>
        )}

        {/* Low stock badge */}
        {lowStock && isAvailable && (
          <div className="absolute top-2 left-2 flex items-center gap-1
            bg-farm-amber text-white text-xs font-medium px-2 py-1 rounded-full">
            <AlertTriangle className="w-3 h-3" />
            Low Stock
          </div>
        )}

        {/* Out of stock overlay */}
        {!isAvailable && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="text-white text-sm font-medium bg-black/60 px-3 py-1
              rounded-full">
              Unavailable
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col gap-2 flex-1">
        {/* Category */}
        <span className="text-xs text-farm-green font-medium uppercase tracking-wide">
          {category}
        </span>

        {/* Name */}
        <h3 className="font-semibold text-farm-text text-sm leading-snug line-clamp-2">
          {produceName}
        </h3>

        {/* Dates */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1 text-xs text-gray-400">
            <Calendar className="w-3 h-3" />
            <span>Harvested {formatDate(harvestedAt)}</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-gray-400">
            <Calendar className="w-3 h-3" />
            <span>Expires {formatDate(expiryDate)}</span>
          </div>
        </div>

        {/* Stock bar */}
        <div className="mt-1">
          <div className="flex justify-between text-xs text-gray-400 mb-1">
            <span>{quantityAvailable} {unit === 'BAG' ? 'bags' : unit?.toLowerCase()} left</span>
            <span>{Math.round(percentageRemaining)}%</span>
          </div>
          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                lowStock ? 'bg-farm-amber' : 'bg-farm-green'
              }`}
              style={{ width: `${Math.min(percentageRemaining, 100)}%` }}
            />
          </div>
        </div>

        {/* Pricing */}
        <div className="mt-auto pt-3 border-t border-gray-50">
          <div className="flex items-end justify-between">
            <div>
              <div className="text-lg font-bold text-farm-text">
                ${retailPrice} <span className="text-xs font-normal text-gray-400">{currency}</span>
              </div>
              <UnitLabel unit={unit} bagWeightKg={bagWeightKg} />
            </div>
            <div className="text-right">
              <div className="text-xs text-gray-400">Bulk</div>
              <div className="text-sm font-semibold text-farm-green">
                ${bulkPrice}
              </div>
              <div className="text-xs text-gray-400">{minBulkQuantity}+ {unit === 'BAG' ? 'bags' : unit?.toLowerCase()}</div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}