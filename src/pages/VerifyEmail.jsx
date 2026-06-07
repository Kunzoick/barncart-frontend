import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { verifyEmail, resendVerification } from '../api/auth'
import { Mail, ArrowRight } from 'lucide-react'

export default function VerifyEmail() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [email, setEmail] = useState(location.state?.email || '')
  const [code, setCode] = useState('')
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [loading, setLoading] = useState(false)
  const [resending, setResending] = useState(false)

  const handleVerify = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const res = await verifyEmail({ email, code })
      login(res.data)
      navigate('/')
    } catch (err) {
      const msg = err.response?.data?.message || 'Verification failed. Please try again.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    setError(null)
    setSuccess(null)
    setResending(true)
    try {
      await resendVerification({ email })
      setSuccess('A new code has been sent to your email.')
    } catch (err) {
      const msg = err.response?.data?.message || 'Could not resend code. Try again.'
      setError(msg)
    } finally {
      setResending(false)
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-sm border
        border-gray-100 p-8">

        <div className="mb-6 text-center">
          <div className="w-12 h-12 bg-farm-greenMuted rounded-full flex items-center
            justify-center mx-auto mb-4">
            <Mail className="w-6 h-6 text-farm-green" />
          </div>
          <h1 className="text-2xl font-bold text-farm-text mb-1">Check your email</h1>
          <p className="text-sm text-gray-500">
            We sent a 6-digit code to{' '}
            <span className="font-medium text-farm-text">{email || 'your email'}</span>
          </p>
        </div>

        {/* Demo notice — prominent */}
        <div className="mb-5 px-4 py-3 bg-amber-50 border border-amber-200
          rounded-lg text-sm text-amber-700">
          <p className="font-medium mb-0.5">Demo mode — email delivery limited</p>
          <p className="text-xs">
            Email verification is optional. You can skip this step and log in directly.
          </p>
        </div>

        {error && (
          <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-lg
            text-sm text-red-700">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 px-4 py-3 bg-green-50 border border-green-200 rounded-lg
            text-sm text-green-700">
            {success}
          </div>
        )}

        <form onSubmit={handleVerify} className="flex flex-col gap-4">
          {!location.state?.email && (
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
          )}

          <div>
            <label className="block text-sm font-medium text-farm-text mb-1">
              Verification Code
            </label>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              required
              placeholder="123456"
              maxLength={6}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm
                tracking-widest text-center font-mono text-lg
                focus:outline-none focus:ring-2 focus:ring-farm-green
                focus:border-transparent placeholder:text-gray-400
                placeholder:tracking-normal placeholder:font-sans placeholder:text-base"
            />
            <p className="text-xs text-gray-400 mt-1">Code expires in 15 minutes</p>
          </div>

          <button
            type="submit"
            disabled={loading || code.length < 6}
            className="w-full bg-farm-green text-white py-2.5 rounded-lg font-medium
              hover:bg-farm-greenLight transition-colors disabled:opacity-60
              disabled:cursor-not-allowed"
          >
            {loading ? 'Verifying...' : 'Verify Email'}
          </button>
        </form>

        <div className="mt-4 text-center">
          <p className="text-sm text-gray-500 mb-1">Didn't receive a code?</p>
          <button
            onClick={handleResend}
            disabled={resending || !email}
            className="text-sm text-farm-green font-medium hover:underline
              disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {resending ? 'Sending...' : 'Resend code'}
          </button>
        </div>

        {/* Skip — prominent, above back to login */}
        <div className="mt-5 pt-5 border-t border-gray-100">
          <Link
            to="/login"
            className="w-full flex items-center justify-center gap-2 py-2.5
              border border-gray-200 rounded-lg text-sm font-medium text-gray-600
              hover:border-farm-green hover:text-farm-green transition-colors"
          >
            Skip verification — go to Login
            <ArrowRight className="w-4 h-4" />
          </Link>
          <p className="text-xs text-gray-400 text-center mt-2">
            You can verify your email later from your account settings
          </p>
        </div>

      </div>
    </div>
  )
}