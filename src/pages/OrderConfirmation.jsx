import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { CheckCircle } from 'lucide-react'
import { useCart } from '../context/CartContext'

export default function OrderConfirmation() {
  const { emptyCart } = useCart()

  // Clear cart after successful payment
  useEffect(() => {
    const timer = setTimeout(() => {
        emptyCart().catch(() => {})
    }, 1000)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <CheckCircle className="w-16 h-16 text-farm-green mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-farm-text mb-2">
          Order Confirmed!
        </h1>
        <p className="text-gray-500 text-sm mb-6">
          Your payment was successful. We will prepare your fresh produce
          for delivery.
        </p>
        <div className="flex gap-3 justify-center">
          <Link to="/orders"
            className="bg-farm-green text-white px-6 py-2.5 rounded-lg
              text-sm font-medium hover:bg-farm-greenLight transition-colors">
            View Orders
          </Link>
          <Link to="/listings"
            className="border border-gray-200 text-gray-600 px-6 py-2.5
              rounded-lg text-sm font-medium hover:border-farm-green
              hover:text-farm-green transition-colors">
            Shop More
          </Link>
        </div>
      </div>
    </div>
  )
}