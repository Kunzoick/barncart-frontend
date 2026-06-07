import { useState } from 'react'
import { Link } from 'react-router-dom'
import { forgotPassword } from '../api/auth'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await forgotPassword({ email })
      setSubmitted(true)
    } catch (err) {
      const msg = err.response?.data?.message || 'Something went wrong. Try again.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <div className="w-full max-w-md bg-white rounded-xl shadow-sm border
          border-gray-100 p-8 text-center">
          <div className="w-12 h-12 bg-farm-greenMuted rounded-full flex items-center
            justify-center mx-auto mb-4">
            <span className="text-farm-green text-xl">✓</span>
          </div>
          <h1 className="text-2xl font-bold text-farm-text mb-2">Check your email</h1>
          <p className="text-sm text-gray-500 mb-6">
            If an account exists for{' '}
            <span className="font-medium text-farm-text">{email}</span>,
            you will receive a reset link shortly.
          </p>
          <Link to="/login"
            className="text-sm text-farm-green font-medium hover:underline">
            Back to Login
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-sm border
        border-gray-100 p-8">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-farm-text mb-1">Forgot password?</h1>
          <p className="text-sm text-gray-500">
            Enter your email and we'll send you a reset link
          </p>
        </div>

        {error && (
          <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-lg
            text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="mb-4 px-4 py-3 bg-yellow-50 border border-yellow-200
  rounded-lg text-sm text-yellow-700">
  Email delivery is currently in test mode. For demo purposes, use the
  Change Password option from your account settings if you are logged in.
</div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-farm-text mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@example.com"
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm
                focus:outline-none focus:ring-2 focus:ring-farm-green
                focus:border-transparent placeholder:text-gray-400"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-farm-green text-white py-2.5 rounded-lg font-medium
              hover:bg-farm-greenLight transition-colors disabled:opacity-60
              disabled:cursor-not-allowed"
          >
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          <Link to="/login" className="text-farm-green font-medium hover:underline">
            Back to Login
          </Link>
        </p>
      </div>
    </div>
  )
}