import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { getSlotsByRange } from '../api/delivery'
import { checkout, getOrders, getClientSecret } from '../api/orders'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { Calendar, Clock, MapPin } from 'lucide-react'
import ReservationTimer from '../components/checkout/ReservationTimer'

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY)

function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0
    const v = c === 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}

function formatDate(dateStr) {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-CA', {
    weekday: 'short', month: 'short', day: 'numeric'
  })
}

function StripePaymentForm({ onError }) {
  const stripe = useStripe()
  const elements = useElements()
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!stripe || !elements) return
    setLoading(true)
    try {
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/order-confirmation`
        }
      })
      if (error) onError(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <PaymentElement />
      <button
        type="submit"
        disabled={!stripe || loading}
        className="w-full bg-farm-green text-white py-3 rounded-lg font-medium
          hover:bg-farm-greenLight transition-colors disabled:opacity-60
          disabled:cursor-not-allowed"
      >
        {loading ? 'Processing...' : 'Confirm Payment'}
      </button>
    </form>
  )
}

export default function Checkout() {
  const { cart } = useCart()
  const { user, authLoading } = useAuth()
  const navigate = useNavigate()

  const [step, setStep] = useState(1)
  const [slots, setSlots] = useState([])
  const [selectedSlot, setSelectedSlot] = useState(null)
  const [clientSecret, setClientSecret] = useState(null)
  const [reservationExpiresAt, setReservationExpiresAt] = useState(null)
  const [paymentError, setPaymentError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [slotsLoading, setSlotsLoading] = useState(true)
  const [resumeChecking, setResumeChecking] = useState(true)
  const [reservationMade, setReservationMade] = useState(false)
  const [idempotencyKey] = useState(() => generateUUID())

  const [address, setAddress] = useState({
    addressLine1: '', addressLine2: '', city: '',
    province: '', postalCode: '', country: 'CA', deliveryNotes: ''
  })

  // Only redirect if not logged in — never redirect away from checkout
  // once we are on the page, even if cart empties after reservation
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login')
    }
  }, [user, authLoading])

  // Resume checkout if user has an existing RESERVED order
  useEffect(() => {
    if (authLoading) return
    if (!user) { setResumeChecking(false); return }
    getOrders()
      .then(async res => {
        const reserved = res.data.find(o => o.status === 'RESERVED')
        if (reserved && reserved.reservationExpiresAt) {
          const expiry = new Date(reserved.reservationExpiresAt)
          if (expiry > new Date()) {
            try {
              const secretRes = await getClientSecret(reserved.orderId)
              setClientSecret(secretRes.data.clientSecret)
              setReservationExpiresAt(reserved.reservationExpiresAt)
              setReservationMade(true)
              setStep(3)
            } catch (err) {
              console.error('getClientSecret failed:', err.response?.status)
            }
          }
        }
      })
      .catch((err) => {
        console.error('getOrders failed:', err)
      })
      .finally(() => setResumeChecking(false))
  }, [user, authLoading])

  // Fetch slots for next 30 days
  useEffect(() => {
    const now = new Date()
    const currentHour = now.getHours()

    const from = new Date()
    if (currentHour >= 17) {
      from.setDate(from.getDate() + 1)
    }

    const to = new Date()
    to.setDate(to.getDate() + 14)

    const fmt = (d) => d.toISOString().split('T')[0]
    const todayStr = fmt(now)

    getSlotsByRange(fmt(from), fmt(to))
      .then(res => {
        setSlots(res.data.filter(s => {
          if (!s.available) return false
          if (s.slotDate !== todayStr) return true
          if (s.slotType === 'MORNING' && currentHour >= 10) return false
          if (s.slotType === 'EVENING' && currentHour >= 17) return false
          return true
        }))
      })
      .catch(() => setSlots([]))
      .finally(() => setSlotsLoading(false))
  }, [])

  const handleAddressChange = (e) => {
    setAddress({ ...address, [e.target.name]: e.target.value })
  }

  const handleCheckout = async () => {
    if (reservationMade) return
    setLoading(true)
    setPaymentError(null)
    sessionStorage.setItem('checkout_debug', 'started')
    try {
     sessionStorage.setItem('checkout_debug', 'calling_backend')
      const res = await checkout({
        idempotencyKey: idempotencyKey,
        deliverySlotId: selectedSlot.id,
        ...address
      })
      sessionStorage.setItem('checkout_debug', 'backend_success')
      setReservationMade(true)
      setClientSecret(res.data.clientSecret)
      setReservationExpiresAt(res.data.reservationExpiresAt)
      sessionStorage.setItem('checkout_debug', 'setting_step_3')
      setStep(3)
    } catch (err) {
      const msg = err.response?.data?.message || err.message || ''
      sessionStorage.setItem('checkout_debug', 'error:' + msg)
      if (msg.toLowerCase().includes('already exists')) {
        try {
          const orderRes = await getOrders()
          const reserved = orderRes.data.find(o => o.status === 'RESERVED')
          if (reserved) {
            const secretRes = await getClientSecret(reserved.orderId)
            setClientSecret(secretRes.data.clientSecret)
            setReservationExpiresAt(reserved.reservationExpiresAt)
            setReservationMade(true)
            setStep(3)
            return
          }
        } catch (_) {}
      }
      setPaymentError(msg || 'Checkout failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const slotsByDate = slots.reduce((acc, slot) => {
    const date = slot.slotDate
    if (!acc[date]) acc[date] = []
    acc[date].push(slot)
    return acc
  }, {})

  const subtotal = cart?.items?.reduce((sum, item) => {
    const price = item.quantity >= item.minBulkQuantity
      ? item.bulkPrice : item.retailPrice
    return sum + price * item.quantity
  }, 0) || 0

  if (authLoading || resumeChecking) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8 text-center">
        <div className="animate-pulse text-gray-400 text-sm">
          Checking for existing reservations...
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-farm-text mb-2">Checkout</h1>

      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-8">
        {['Delivery Slot', 'Address', 'Payment'].map((label, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center
              text-xs font-bold ${
              step > i + 1 || step === i + 1
                ? 'bg-farm-green text-white'
                : 'bg-gray-100 text-gray-400'
            }`}>
              {step > i + 1 ? '✓' : i + 1}
            </div>
            <span className={`text-sm ${
              step === i + 1 ? 'text-farm-text font-medium' : 'text-gray-400'
            }`}>
              {label}
            </span>
            {i < 2 && <div className="w-8 h-px bg-gray-200" />}
          </div>
        ))}
      </div>

       {/* DEBUG — remove after fix */}
      {sessionStorage.getItem('checkout_debug') && (
        <div className="mb-4 p-2 bg-yellow-100 text-xs text-yellow-900 rounded break-all">
          Debug: {sessionStorage.getItem('checkout_debug')}
        </div>
      )}

      {/* Step 1 — Delivery Slot */}
      {step === 1 && (
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-5 h-5 text-farm-green" />
            <h2 className="font-semibold text-farm-text">Choose Delivery Slot</h2>
          </div>

          {slotsLoading && (
            <div className="flex flex-col gap-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-100 rounded-lg animate-pulse" />
              ))}
            </div>
          )}

          {!slotsLoading && Object.keys(slotsByDate).length === 0 && (
            <p className="text-gray-400 text-sm text-center py-8">
              No delivery slots available. Please check back later.
            </p>
          )}

          {!slotsLoading && Object.entries(slotsByDate).map(([date, dateSlots]) => (
            <div key={date} className="mb-4">
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">
                {formatDate(date)}
              </p>
              <div className="flex flex-col sm:flex-row gap-2">
                {dateSlots.map(slot => (
                  <button
                    key={slot.id}
                    onClick={() => setSelectedSlot(slot)}
                    className={`flex-1 flex items-center gap-2 px-4 py-3
                      rounded-lg border text-sm font-medium transition-colors ${
                      selectedSlot?.id === slot.id
                        ? 'border-farm-green bg-farm-greenMuted text-farm-green'
                        : 'border-gray-200 text-gray-600 hover:border-farm-green'
                    }`}
                  >
                    <Clock className="w-4 h-4" />
                    {slot.slotType === 'MORNING' ? 'Morning' : 'Evening'}
                    <span className="text-xs text-gray-400 ml-auto">
                      {slot.capacity - slot.bookedCount} left
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ))}

          <button
            onClick={() => setStep(2)}
            disabled={!selectedSlot}
            className="w-full bg-farm-green text-white py-3 rounded-lg font-medium
              hover:bg-farm-greenLight transition-colors disabled:opacity-60
              disabled:cursor-not-allowed mt-4"
          >
            Continue to Address
          </button>
        </div>
      )}

      {/* Step 2 — Address */}
      {step === 2 && (
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <div className="flex items-center gap-2 mb-4">
            <MapPin className="w-5 h-5 text-farm-green" />
            <h2 className="font-semibold text-farm-text">Delivery Address</h2>
          </div>

          {paymentError && (
            <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200
              rounded-lg text-sm text-red-700">
              {paymentError}
            </div>
          )}

          <div className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-medium text-farm-text mb-1">
                Address Line 1
              </label>
              <input type="text" name="addressLine1" value={address.addressLine1}
                onChange={handleAddressChange} required placeholder="123 Main Street"
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm
                  focus:outline-none focus:ring-2 focus:ring-farm-green focus:border-transparent
                  placeholder:text-gray-400" />
            </div>

            <div>
              <label className="block text-sm font-medium text-farm-text mb-1">
                Address Line 2
                <span className="text-gray-400 font-normal ml-1">(optional)</span>
              </label>
              <input type="text" name="addressLine2" value={address.addressLine2}
                onChange={handleAddressChange} placeholder="Apt 4B"
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm
                  focus:outline-none focus:ring-2 focus:ring-farm-green focus:border-transparent
                  placeholder:text-gray-400" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-farm-text mb-1">City</label>
                <input type="text" name="city" value={address.city}
                  onChange={handleAddressChange} required placeholder="Toronto"
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm
                    focus:outline-none focus:ring-2 focus:ring-farm-green focus:border-transparent
                    placeholder:text-gray-400" />
              </div>
              <div>
                <label className="block text-sm font-medium text-farm-text mb-1">Province</label>
                <input type="text" name="province" value={address.province}
                  onChange={handleAddressChange} required placeholder="ON"
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm
                    focus:outline-none focus:ring-2 focus:ring-farm-green focus:border-transparent
                    placeholder:text-gray-400" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-farm-text mb-1">Postal Code</label>
                <input type="text" name="postalCode" value={address.postalCode}
                  onChange={handleAddressChange} required placeholder="M5V 3A8"
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm
                    focus:outline-none focus:ring-2 focus:ring-farm-green focus:border-transparent
                    placeholder:text-gray-400" />
              </div>
              <div>
                <label className="block text-sm font-medium text-farm-text mb-1">Country</label>
                <input type="text" name="country" value={address.country}
                  onChange={handleAddressChange}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm
                    focus:outline-none focus:ring-2 focus:ring-farm-green focus:border-transparent" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-farm-text mb-1">
                Delivery Notes
                <span className="text-gray-400 font-normal ml-1">(optional)</span>
              </label>
              <textarea name="deliveryNotes" value={address.deliveryNotes}
                onChange={handleAddressChange}
                placeholder="Leave at door, call on arrival..." rows={2}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm
                  focus:outline-none focus:ring-2 focus:ring-farm-green focus:border-transparent
                  placeholder:text-gray-400 resize-none" />
            </div>
          </div>

          <div className="mt-6 p-4 bg-farm-bg rounded-lg">
            <div className="flex justify-between text-sm font-semibold text-farm-text">
              <span>Order Total</span>
              <span>${subtotal.toFixed(2)} CAD</span>
            </div>
            <div className="text-xs text-gray-400 mt-1">
              Slot: {selectedSlot?.slotType === 'MORNING' ? 'Morning' : 'Evening'} —{' '}
              {formatDate(selectedSlot?.slotDate)}
            </div>
          </div>

          <div className="flex gap-3 mt-4">
            <button onClick={() => setStep(1)}
              className="flex-1 border border-gray-200 text-gray-600 py-3 rounded-lg
                font-medium hover:border-farm-green hover:text-farm-green transition-colors text-sm">
              Back
            </button>
            <button onClick={handleCheckout}
              disabled={loading || !address.addressLine1 || !address.city
                || !address.province || !address.postalCode}
              className="flex-grow bg-farm-green text-white py-3 rounded-lg font-medium
                hover:bg-farm-greenLight transition-colors disabled:opacity-60
                disabled:cursor-not-allowed text-sm">
              {loading ? 'Reserving...' : 'Reserve & Pay'}
            </button>
          </div>
        </div>
      )}

      {/* Step 3 — Payment */}
      {step === 3 && clientSecret && (
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <h2 className="font-semibold text-farm-text mb-4">Payment</h2>

          {paymentError && (
            <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200
              rounded-lg text-sm text-red-700">
              {paymentError}
            </div>
          )}

          <div className="mb-4">
            <ReservationTimer
              expiresAt={reservationExpiresAt}
              onExpired={() => {
                setPaymentError('Your reservation has expired. Please start over.')
                setStep(1)
                setClientSecret(null)
                setReservationExpiresAt(null)
                setReservationMade(false)
              }}
            />
          </div>

          <Elements
            stripe={stripePromise}
            options={{
              clientSecret,
              appearance: {
                theme: 'stripe',
                variables: { colorPrimary: '#2D6A4F' }
              }
            }}
          >
            <StripePaymentForm onError={(msg) => setPaymentError(msg)} />
          </Elements>
        </div>
      )}
    </div>
  )
}