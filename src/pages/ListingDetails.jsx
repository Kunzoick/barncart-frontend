import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getListingById } from '../api/listings'
import { useInventory } from '../hooks/useInventory'
import { Calendar, AlertTriangle, Package, ArrowLeft } from 'lucide-react'
import { useCart } from '../context/CartContext'

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-CA', {
    month: 'long', day: 'numeric', year: 'numeric'
  })
}

function UnitLabel({ unit, bagWeightKg }) {
  if (unit === 'BAG' && bagWeightKg) {
    return <span className="text-gray-500">{bagWeightKg}kg bags</span>
  }
  return <span className="text-gray-500">per {unit}</span>
}

export default function ListingDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [listing, setListing] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [quantity, setQuantity] = useState(1)
  const { addItem } = useCart()

  // WebSocket — merges live inventory updates into listing data
  const liveInventory = useInventory(id, listing)

  // Merge live updates into display data
  const display = liveInventory
    ? { ...listing, ...liveInventory }
    : listing

  useEffect(() => {
    getListingById(id)
      .then(res => setListing(res.data))
      .catch(() => setError('Failed to load listing.'))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-100 rounded w-32 mb-6" />
          <div className="grid md:grid-cols-2 gap-8">
            <div className="aspect-square bg-gray-100 rounded-xl" />
            <div className="flex flex-col gap-4">
              <div className="h-6 bg-gray-100 rounded w-3/4" />
              <div className="h-4 bg-gray-100 rounded w-1/2" />
              <div className="h-4 bg-gray-100 rounded w-2/3" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !display) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 text-center">
        <p className="text-red-500 text-sm mb-4">{error || 'Listing not found.'}</p>
        <button
          onClick={() => navigate('/listings')}
          className="text-farm-green text-sm hover:underline"
        >
          Back to listings
        </button>
      </div>
    )
  }

  const {
    produceName, category, unit, bagWeightKg, imageUrl,
    retailPrice, bulkPrice, minBulkQuantity, currency,
    harvestedAt, expiryDate, quantityAvailable, quantityOriginal,
    percentageRemaining, lowStock, batchStatus
  } = display

  const isAvailable = batchStatus === 'ACTIVE' && quantityAvailable > 0
  const isBulk = quantity >= minBulkQuantity
  const activePrice = isBulk ? bulkPrice : retailPrice

  const handleQuantityChange = (val) => {
    const num = Math.max(1, Math.min(Number(val), quantityAvailable))
    setQuantity(num)
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">

      {/* Back */}
      <button
        onClick={() => navigate('/listings')}
        className="flex items-center gap-1 text-sm text-gray-500
          hover:text-farm-green transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to listings
      </button>

      <div className="grid md:grid-cols-2 gap-8">

        {/* Image */}
        <div className="relative aspect-square bg-gray-50 rounded-xl overflow-hidden">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={produceName}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Package className="w-16 h-16 text-gray-200" />
            </div>
          )}

          {lowStock && isAvailable && (
            <div className="absolute top-3 left-3 flex items-center gap-1
              bg-farm-amber text-white text-xs font-medium px-2 py-1 rounded-full">
              <AlertTriangle className="w-3 h-3" />
              Low Stock
            </div>
          )}
        </div>

        {/* Details */}
        <div className="flex flex-col gap-4">

          {/* Header */}
          <div>
            <span className="text-xs text-farm-green font-medium uppercase tracking-wide">
              {category}
            </span>
            <h1 className="text-2xl font-bold text-farm-text mt-1">{produceName}</h1>
          </div>

          {/* Live inventory */}
          <div>
            <div className="flex justify-between text-sm text-gray-500 mb-1">
              <span>{quantityAvailable} {unit === 'BAG' ? 'bags' : unit?.toLowerCase()} available</span>
              <span>{Math.round(percentageRemaining)}% remaining</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  lowStock ? 'bg-farm-amber' : 'bg-farm-green'
                }`}
                style={{ width: `${Math.min(percentageRemaining, 100)}%` }}
              />
            </div>
            {lowStock && (
              <p className="text-xs text-farm-amber mt-1 font-medium">
                Only {quantityAvailable} {unit === 'BAG' ? 'bags' : unit?.toLowerCase()} left — order soon
              </p>
            )}
          </div>

          {/* Dates */}
          <div className="flex flex-col gap-1.5 p-3 bg-farm-greenMuted rounded-lg">
            <div className="flex items-center gap-2 text-sm text-farm-text">
              <Calendar className="w-4 h-4 text-farm-green" />
              <span>Harvested: <strong>{formatDate(harvestedAt)}</strong></span>
            </div>
            <div className="flex items-center gap-2 text-sm text-farm-text">
              <Calendar className="w-4 h-4 text-farm-green" />
              <span>Expires: <strong>{formatDate(expiryDate)}</strong></span>
            </div>
          </div>

          {/* Pricing */}
          <div className="p-4 border border-gray-100 rounded-xl">
            <div className="flex items-end justify-between mb-3">
              <div>
                <div className="text-3xl font-bold text-farm-text">
                  ${activePrice}
                  <span className="text-sm font-normal text-gray-400 ml-1">{currency}</span>
                </div>
                <UnitLabel unit={unit} bagWeightKg={bagWeightKg} />
              </div>
              {isBulk && (
                <span className="text-xs bg-farm-greenMuted text-farm-green
                  font-medium px-2 py-1 rounded-full">
                  Bulk price applied
                </span>
              )}
            </div>

            {!isBulk && (
              <p className="text-xs text-gray-400 mb-3">
                Buy {minBulkQuantity}+ {unit === 'BAG' ? 'bags' : unit?.toLowerCase()} for bulk price —{' '}
                <span className="text-farm-green font-medium">${bulkPrice} each</span>
              </p>
            )}

            {/* Quantity */}
            {isAvailable && (
              <div className="flex items-center gap-3 mb-4">
                <span className="text-sm font-medium text-farm-text">Quantity</span>
                <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                  <button
                    onClick={() => handleQuantityChange(quantity - 1)}
                    className="px-3 py-2 text-gray-500 hover:bg-gray-50
                      transition-colors text-lg leading-none"
                  >
                    −
                  </button>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => handleQuantityChange(e.target.value)}
                    className="w-16 text-center py-2 text-sm font-medium
                      focus:outline-none border-x border-gray-200"
                    min={1}
                    max={quantityAvailable}
                  />
                  <button
                    onClick={() => handleQuantityChange(quantity + 1)}
                    className="px-3 py-2 text-gray-500 hover:bg-gray-50
                      transition-colors text-lg leading-none"
                  >
                    +
                  </button>
                </div>
                <span className="text-xs text-gray-400">
                  {unit === 'BAG'
                    ? `${quantity} bag${quantity > 1 ? 's' : ''} × ${bagWeightKg}kg = ${quantity * bagWeightKg}kg total`
                    : `${unit}`
                  }
                </span>
              </div>
            )}

            {/* Add to cart button — wired in Phase 4 */}
            {isAvailable ? (
              <>
               {error && (
                <div className="mb-3 px-3 py-2 bg-red-50 border border-red-200
                  rounded-lg text-sm text-red-700">
                  {error}
              </div>
            )}
           <button
            className="w-full bg-farm-green text-white py-3 rounded-lg
             font-medium hover:bg-farm-greenLight transition-colors"
            onClick={async () => {
             try {
                await addItem(id, quantity)
                navigate('/cart')
            } catch (err) {
              setError(err.response?.data?.message || 'Failed to add to cart.')
            }
          }}>
          Add to Cart — ${(activePrice * quantity).toFixed(2)}
       </button>
    </>
 ) : (
  <div className="w-full bg-gray-100 text-gray-400 py-3 rounded-lg
    font-medium text-center">
    Unavailable
  </div>
)}
          </div>
        </div>
      </div>
    </div>
  )
}