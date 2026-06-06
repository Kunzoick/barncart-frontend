import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Package, ShoppingCart, Plus, Minus } from 'lucide-react'
import { useCart } from '../../context/CartContext'
import { useAuth } from '../../context/AuthContext'

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
    quantityAvailable,
    percentageRemaining,
    lowStock,
    batchStatus
  } = listing

  const { addItem, cart } = useCart()
  const { user } = useAuth()
  const navigate = useNavigate()

  const [quantity, setQuantity] = useState(1)
  const [adding, setAdding] = useState(false)
  const [added, setAdded] = useState(false)

  const isAvailable = batchStatus === 'ACTIVE' && quantityAvailable > 0
  const isBulk = quantity >= minBulkQuantity
  const displayPrice = isBulk ? bulkPrice : retailPrice

  // Check if already in cart
  const cartItem = cart?.items?.find(i => i.listingId === listingId)
  const currentCartQty = cartItem?.quantity || 0

  const handleDecrement = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setQuantity(q => Math.max(1, q - 1))
  }

  const handleIncrement = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setQuantity(q => Math.min(quantityAvailable - currentCartQty, q + 1))
  }

  const handleAddToCart = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (!user) { navigate('/login'); return }
    if (adding) return
    setAdding(true)
    try {
      await addItem(listingId, quantity)
      setAdded(true)
      setQuantity(1)
      setTimeout(() => setAdded(false), 2000)
    } catch (_) {
    } finally {
      setAdding(false)
    }
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm
      hover:shadow-md transition-shadow overflow-hidden flex flex-col group">

      {/* Image — clicking goes to detail */}
      <Link to={`/listings/${listingId}`} className="block">
        <div className="relative aspect-video bg-gray-50 overflow-hidden">
          {imageUrl ? (
            <img src={imageUrl} alt={produceName}
              className="w-full h-full object-cover group-hover:scale-105
                transition-transform duration-300" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Package className="w-12 h-12 text-gray-200" />
            </div>
          )}

          {lowStock && isAvailable && (
            <div className="absolute top-2 left-2 flex items-center gap-1
              bg-farm-amber text-white text-xs font-medium px-2 py-1 rounded-full">
              Low Stock
            </div>
          )}

          {!isAvailable && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <span className="text-white text-sm font-medium bg-black/60
                px-3 py-1 rounded-full">
                Unavailable
              </span>
            </div>
          )}
        </div>
      </Link>

      {/* Content */}
      <div className="p-4 flex flex-col gap-3 flex-1">

        <Link to={`/listings/${listingId}`} className="block">
          <span className="text-xs text-farm-green font-medium uppercase tracking-wide">
            {category}
          </span>
          <h3 className="font-semibold text-farm-text text-sm leading-snug
            line-clamp-2 mt-0.5">
            {produceName}
          </h3>
        </Link>

        {/* Stock bar */}
        <div>
          <div className="flex justify-between text-xs text-gray-400 mb-1">
            <span>
              {quantityAvailable} {unit === 'BAG' ? 'bags' : unit?.toLowerCase()} left
            </span>
            {lowStock && (
              <span className="text-farm-amber font-medium">Low stock</span>
            )}
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
        <div className="flex items-end justify-between">
          <div>
            <div className="text-lg font-bold text-farm-text">
              ${displayPrice}{' '}
              <span className="text-xs font-normal text-gray-400">{currency}</span>
            </div>
            <UnitLabel unit={unit} bagWeightKg={bagWeightKg} />
          </div>
          <div className="text-right">
            <div className="text-xs text-gray-400">Bulk</div>
            <div className="text-sm font-semibold text-farm-green">${bulkPrice}</div>
            <div className="text-xs text-gray-400">
              {minBulkQuantity}+ {unit === 'BAG' ? 'bags' : unit?.toLowerCase()}
            </div>
          </div>
        </div>

        {/* Quantity + Add to Cart */}
        {isAvailable && (
          <div className="flex items-center gap-2 mt-auto">
            <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
              <button onClick={handleDecrement}
                className="px-2.5 py-2 text-gray-500 hover:bg-gray-50
                  transition-colors disabled:opacity-40"
                disabled={quantity <= 1}>
                <Minus className="w-3 h-3" />
              </button>
              <span className="px-3 py-2 text-sm font-medium text-farm-text
                min-w-[2rem] text-center">
                {quantity}
              </span>
              <button onClick={handleIncrement}
                className="px-2.5 py-2 text-gray-500 hover:bg-gray-50
                  transition-colors disabled:opacity-40"
                disabled={quantity >= quantityAvailable - currentCartQty}>
                <Plus className="w-3 h-3" />
              </button>
            </div>

            <button onClick={handleAddToCart}
              disabled={adding || quantity > quantityAvailable - currentCartQty}
              className={`flex-1 flex items-center justify-center gap-1.5
                py-2 rounded-lg text-sm font-medium transition-colors
                disabled:opacity-60 disabled:cursor-not-allowed ${
                added
                  ? 'bg-farm-green text-white'
                  : 'bg-farm-green text-white hover:bg-farm-greenLight'
              }`}>
              <ShoppingCart className="w-4 h-4" />
              {adding ? 'Adding...' : added ? 'Added!' : 'Add'}
            </button>
          </div>
        )}

        {!isAvailable && (
          <Link to={`/listings/${listingId}`}
            className="mt-auto text-center text-xs text-gray-400 hover:text-farm-green
              transition-colors py-2">
            View details →
          </Link>
        )}
      </div>
    </div>
  )
}