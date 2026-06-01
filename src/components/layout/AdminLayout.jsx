import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Sprout, ShoppingBag, ClipboardList,
  CalendarDays, LogOut, Leaf, Home, BarChart2
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

const navItems = [
  { to: '/admin',            label: 'Dashboard',  icon: LayoutDashboard, end: true },
  { to: '/admin/orders',     label: 'Orders',     icon: ClipboardList },
  { to: '/admin/batches',    label: 'Batches',    icon: Sprout },
  { to: '/admin/listings',   label: 'Listings',   icon: ShoppingBag },
  { to: '/admin/slots',      label: 'Slots',      icon: CalendarDays },
  { to: '/admin/produce',    label: 'Produce',    icon: Leaf },
  { to: '/admin/analytics',  label: 'Analytics',  icon: BarChart2 },
]

export default function AdminLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen flex bg-gray-50">
      <aside className="w-56 bg-farm-green flex flex-col shrink-0">
        <div className="px-6 py-5 border-b border-farm-greenLight/30">
          <span className="text-white font-bold text-lg tracking-tight">BarnCart</span>
          <p className="text-farm-greenLight text-xs mt-0.5">Admin Panel</p>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink key={to} to={to} end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium
                transition-colors ${isActive
                  ? 'bg-white/15 text-white'
                  : 'text-farm-greenLight hover:bg-white/10 hover:text-white'
                }`
              }>
              <Icon size={16} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="px-3 pb-3">
          <NavLink to="/"
            className="flex items-center gap-3 px-3 py-2 rounded-md text-sm
              font-medium text-farm-greenLight hover:bg-white/10 hover:text-white
              transition-colors">
            <Home size={16} />
            Back to Store
          </NavLink>
        </div>

        <div className="px-4 py-4 border-t border-farm-greenLight/30">
          <p className="text-farm-greenLight text-xs truncate mb-2">{user?.email}</p>
          <button onClick={handleLogout}
            className="flex items-center gap-2 text-farm-greenLight
              hover:text-white text-sm transition-colors">
            <LogOut size={14} />
            Sign out
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <div className="flex-1 p-8 overflow-auto">
          <Outlet />
        </div>
      </div>
    </div>
  )
}