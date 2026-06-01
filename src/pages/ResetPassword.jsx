import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { resetPassword } from '../api/auth'

export default function ResetPassword() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')

  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    if (password !== confirm) {
      setError('Passwords do not match.')
      return
    }
    if (password.length > 72) {
      setError('Password must be 72 characters or less.')
      return
    }
    if (!token) {
      setError('Invalid or missing reset token.')
      return
    }

    setLoading(true)
    try {
      await resetPassword({ token, newPassword: password })
      navigate('/login', {
        state: { message: 'Password reset successful. Please sign in.' }
      })
    } catch (err) {
      const msg = err.response?.data?.message || 'Reset failed. The link may have expired.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-sm border
        border-gray-100 p-8">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-farm-text mb-1">Reset password</h1>
          <p className="text-sm text-gray-500">Enter your new password below</p>
        </div>

        {error && (
          <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-lg
            text-sm text-red-700">
            {error}
          </div>
        )}

        {!token && (
          <div className="mb-4 px-4 py-3 bg-yellow-50 border border-yellow-200
            rounded-lg text-sm text-yellow-700">
            Invalid reset link. Please request a new one.
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-farm-text mb-1">
              New Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm
                focus:outline-none focus:ring-2 focus:ring-farm-green
                focus:border-transparent placeholder:text-gray-400"
            />
            <p className="text-xs text-gray-400 mt-1">Maximum 72 characters</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-farm-text mb-1">
              Confirm Password
            </label>
            <input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
              placeholder="••••••••"
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm
                focus:outline-none focus:ring-2 focus:ring-farm-green
                focus:border-transparent placeholder:text-gray-400"
            />
          </div>

          <button
            type="submit"
            disabled={loading || !token}
            className="w-full bg-farm-green text-white py-2.5 rounded-lg font-medium
              hover:bg-farm-greenLight transition-colors disabled:opacity-60
              disabled:cursor-not-allowed"
          >
            {loading ? 'Resetting...' : 'Reset Password'}
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