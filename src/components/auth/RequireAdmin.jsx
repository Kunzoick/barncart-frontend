import { useAuth } from '../../context/AuthContext'
import { Navigate, Outlet } from 'react-router-dom'

export default function RequireAdmin() {
  const { user, authLoading } = useAuth()

  if (authLoading) return (
    <div className="min-h-screen flex items-center justify-center bg-farm-bg">
      <div className="w-8 h-8 border-4 border-farm-green border-t-transparent rounded-full animate-spin" />
    </div>
  )

  if (!user) return <Navigate to="/login" replace />

  if (user.role !== 'ADMIN') return <Navigate to="/" replace />

  return <Outlet />
}