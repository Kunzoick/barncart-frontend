import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { Link, useNavigate } from 'react-router-dom'
import { Trash2, ShoppingCart } from 'lucide-react'
import { useState } from 'react'

function getPricingType(item) {
  return item.quantity >= item.minBulkQuantity ? 'BULK' : 'RETAIL'
}

function getActivePrice(item) {
  return item.quantity >= item.minBulkQuantity ? item.bulkPrice : item.retailPrice
}

function formatUnit(unit, quantity) {
  if (unit === 'BAG') return `bag${quantity > 1 ? 's' : ''}`
  return unit?.toLowerCase()
}

export default function Cart() {
  const { cart, loading, updateItem, removeItem, emptyCart } = useCart()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [updatingId, setUpdatingId] = useState(null)
  const [removingId, setRemovingId] = useState(null)

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <ShoppingCart className="w-12 h-12 text-gray-200 mx-auto mb-4" />
        <p className="text-gray-500 text-sm mb-4">
          Please log in to view your cart
        </p>
        <Link to="/login"
          className="bg-farm-green text-white px-6 py-2.5 rounded-lg
            text-sm font-medium hover:bg-farm-greenLight transition-colors">
          Login
        </Link>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="animate-pulse flex flex-col gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-24 bg-gray-100 rounded-xl" />
          ))}
        </div>
      </div>
    )
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <ShoppingCart className="w-12 h-12 text-gray-200 mx-auto mb-4" />
        <h2 className="text-lg font-semibold text-farm-text mb-2">
          Your cart is empty
        </h2>
        <p className="text-gray-500 text-sm mb-6">
          Browse fresh produce and add items to your cart
        </p>
        <Link to="/listings"
          className="bg-farm-green text-white px-6 py-2.5 rounded-lg
            text-sm font-medium hover:bg-farm-greenLight transition-colors">
          Shop Now
        </Link>
      </div>
    )
  }

  const handleQuantityChange = async (cartItemId, newQty) => {
    if (newQty < 1) return
    setUpdatingId(cartItemId)
    try {
      await updateItem(cartItemId, newQty)
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update quantity.')
    } finally {
      setUpdatingId(null)
    }
  }

  const handleRemove = async (cartItemId) => {
    setRemovingId(cartItemId)
    try {
      await removeItem(cartItemId)
    } catch (_) {
    } finally {
      setRemovingId(null)
    }
  }

  const handleClear = async () => {
    if (!confirm('Clear your entire cart?')) return
    await emptyCart()
  }

  // Calculate totals
  const subtotal = cart.items.reduce((sum, item) => {
    return sum + getActivePrice(item) * item.quantity
  }, 0)

  const hasBulkItems = cart.items.some(
    item => item.quantity >= item.minBulkQuantity
  )

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-farm-text">
          Your Cart
          <span className="text-sm font-normal text-gray-400 ml-2">
            ({cart.itemCount} {cart.itemCount === 1 ? 'item' : 'items'})
          </span>
        </h1>
        <button
          onClick={handleClear}
          className="text-sm text-red-400 hover:text-red-600 transition-colors"
        >
          Clear cart
        </button>
      </div>

      <div className="grid md:grid-cols-3 gap-6">

        {/* Items list */}
        <div className="md:col-span-2 flex flex-col gap-3">
          {cart.items.map(item => {
            const pricingType = getPricingType(item)
            const activePrice = getActivePrice(item)
            const isUpdating = updatingId === item.cartItemId
            const isRemoving = removingId === item.cartItemId

            return (
              <div key={item.cartItemId}
                className={`bg-white rounded-xl border border-gray-100 p-4
                  flex gap-4 transition-opacity ${isRemoving ? 'opacity-50' : ''}`}>

                {/* Info */}
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-semibold text-farm-text text-sm">
                        {item.produceName}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          pricingType === 'BULK'
                            ? 'bg-farm-greenMuted text-farm-green'
                            : 'bg-gray-100 text-gray-500'
                        }`}>
                          {pricingType}
                        </span>
                        <span className="text-xs text-gray-400">
                          ${activePrice} per {formatUnit(item.unit, 1)}
                        </span>
                      </div>
                      {pricingType === 'RETAIL' && (
                        <p className="text-xs text-gray-400 mt-1">
                          Add {item.minBulkQuantity - item.quantity} more for bulk price —{' '}
                          <span className="text-farm-green">${item.bulkPrice}</span>
                        </p>
                      )}
                    </div>

                    {/* Remove */}
                    <button
                      onClick={() => handleRemove(item.cartItemId)}
                      disabled={isRemoving}
                      className="text-gray-300 hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Quantity + line total */}
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center border border-gray-200
                      rounded-lg overflow-hidden">
                      <button
                        onClick={() => handleQuantityChange(
                          item.cartItemId, item.quantity - 1
                        )}
                        disabled={isUpdating || item.quantity <= 1}
                        className="px-2.5 py-1.5 text-gray-500 hover:bg-gray-50
                          transition-colors disabled:opacity-40 text-sm"
                      >
                        −
                      </button>
                      <span className={`w-12 text-center text-sm font-medium
                        py-1.5 border-x border-gray-200 ${
                          isUpdating ? 'text-gray-300' : 'text-farm-text'
                        }`}>
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => handleQuantityChange(
                          item.cartItemId, item.quantity + 1
                        )}
                        disabled={isUpdating}
                        className="px-2.5 py-1.5 text-gray-500 hover:bg-gray-50
                          transition-colors disabled:opacity-40 text-sm"
                      >
                        +
                      </button>
                    </div>
                    <span className="font-semibold text-farm-text text-sm">
                      ${(activePrice * item.quantity).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Order summary */}
        <div className="bg-white rounded-xl border border-gray-100 p-5 h-fit">
          <h2 className="font-semibold text-farm-text mb-4">Order Summary</h2>

          <div className="flex flex-col gap-2 text-sm mb-4">
            {cart.items.map(item => (
              <div key={item.cartItemId}
                className="flex justify-between text-gray-500">
                <span>{item.produceName} × {item.quantity}</span>
                <span>${(getActivePrice(item) * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>

          <div className="border-t border-gray-100 pt-3 mb-4">
            <div className="flex justify-between font-semibold text-farm-text">
              <span>Subtotal</span>
              <span>${subtotal.toFixed(2)} CAD</span>
            </div>
            {hasBulkItems && (
              <p className="text-xs text-farm-green mt-1">
                Bulk discount applied on eligible items
              </p>
            )}
          </div>

          <button
            onClick={() => navigate('/checkout')}
            className="w-full bg-farm-green text-white py-3 rounded-lg
              font-medium hover:bg-farm-greenLight transition-colors text-sm"
          >
            Proceed to Checkout
          </button>

          <Link to="/listings"
            className="block text-center text-sm text-gray-400
              hover:text-farm-green transition-colors mt-3">
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  )
}