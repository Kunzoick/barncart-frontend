import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'
import { registerUser } from '../api/auth'

export default function Register() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phone: ''
  })
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await registerUser(form)
      navigate('/verify-email', { state: { email: form.email } })
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed. Please try again.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md bg-white rounded-xl shadow-sm border border-gray-100 p-8">

        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-farm-text mb-1">Create account</h1>
          <p className="text-sm text-gray-500">Join BarnCart — fresh produce delivered</p>
        </div>

        {error && (
          <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-lg
            text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-farm-text mb-1">
                First Name
              </label>
              <input
                type="text"
                name="firstName"
                value={form.firstName}
                onChange={handleChange}
                required
                placeholder="Jesse"
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm
                  focus:outline-none focus:ring-2 focus:ring-farm-green focus:border-transparent
                  placeholder:text-gray-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-farm-text mb-1">
                Last Name
              </label>
              <input
                type="text"
                name="lastName"
                value={form.lastName}
                onChange={handleChange}
                required
                placeholder="Smith"
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm
                  focus:outline-none focus:ring-2 focus:ring-farm-green focus:border-transparent
                  placeholder:text-gray-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-farm-text mb-1">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
              placeholder="you@example.com"
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm
                focus:outline-none focus:ring-2 focus:ring-farm-green focus:border-transparent
                placeholder:text-gray-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-farm-text mb-1">
              Phone <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <input
              type="tel"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              placeholder="+1 (555) 000-0000"
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm
                focus:outline-none focus:ring-2 focus:ring-farm-green focus:border-transparent
                placeholder:text-gray-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-farm-text mb-1">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={form.password}
                onChange={handleChange}
                required
                placeholder="••••••••"
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm
                  focus:outline-none focus:ring-2 focus:ring-farm-green focus:border-transparent
                  placeholder:text-gray-400 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400
                  hover:text-farm-green transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-1">Maximum 72 characters</p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-farm-green text-white py-2.5 rounded-lg font-medium
              hover:bg-farm-greenLight transition-colors disabled:opacity-60
              disabled:cursor-not-allowed mt-2"
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          Already have an account?{' '}
          <Link to="/login" className="text-farm-green font-medium hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}