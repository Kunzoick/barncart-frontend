import { useAuth } from '../../context/AuthContext'
import { Navigate, Outlet } from 'react-router-dom'

export default function RequireAdmin() {
  const { user, authLoading } = useAuth()

  if (authLoading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-gray-400 text-sm">Loading...</div>
    </div>
  )

  if (!user) return <Navigate to="/login" replace />

  if (user.role !== 'ADMIN') return <Navigate to="/" replace />

  return <Outlet />
}