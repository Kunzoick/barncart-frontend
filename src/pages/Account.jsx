import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { changePassword } from '../api/auth'
import { KeyRound, CheckCircle } from 'lucide-react'

export default function Account() {
  const { user } = useAuth()
  const [form, setForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setSuccess(false)

    if (form.newPassword !== form.confirmPassword) {
      setError('New passwords do not match.')
      return
    }
    if (form.newPassword.length > 72) {
      setError('Password must be 72 characters or less.')
      return
    }
    if (form.newPassword === form.currentPassword) {
      setError('New password must be different from your current password.')
      return
    }

    setLoading(true)
    try {
      await changePassword({
        currentPassword: form.currentPassword,
        newPassword: form.newPassword
      })
      setSuccess(true)
      setForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to change password. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-farm-text mb-1">Account</h1>
      <p className="text-sm text-gray-500 mb-8">
        Manage your BarnCart account settings
      </p>

      {/* Profile info */}
      <div className="bg-white rounded-xl border border-gray-100 p-6 mb-6">
        <h2 className="text-sm font-semibold text-farm-text mb-3">Profile</h2>
        <div className="flex flex-col gap-2 text-sm text-gray-600">
          <div className="flex justify-between">
            <span className="text-gray-400">Name</span>
            <span className="font-medium text-farm-text">{user?.firstName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Email</span>
            <span className="font-medium text-farm-text">{user?.email}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Role</span>
            <span className="font-medium text-farm-text capitalize">
              {user?.role?.toLowerCase()}
            </span>
          </div>
        </div>
      </div>

      {/* Change password */}
      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <div className="flex items-center gap-2 mb-4">
          <KeyRound className="w-4 h-4 text-farm-green" />
          <h2 className="text-sm font-semibold text-farm-text">Change Password</h2>
        </div>

        {error && (
          <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200
            rounded-lg text-sm text-red-700">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 px-4 py-3 bg-green-50 border border-green-200
            rounded-lg text-sm text-green-700 flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            Password changed successfully.
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-farm-text mb-1">
              Current Password
            </label>
            <input
              type="password"
              name="currentPassword"
              value={form.currentPassword}
              onChange={handleChange}
              required
              placeholder="••••••••"
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm
                focus:outline-none focus:ring-2 focus:ring-farm-green
                focus:border-transparent placeholder:text-gray-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-farm-text mb-1">
              New Password
            </label>
            <input
              type="password"
              name="newPassword"
              value={form.newPassword}
              onChange={handleChange}
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
              Confirm New Password
            </label>
            <input
              type="password"
              name="confirmPassword"
              value={form.confirmPassword}
              onChange={handleChange}
              required
              placeholder="••••••••"
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
            {loading ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  )
}