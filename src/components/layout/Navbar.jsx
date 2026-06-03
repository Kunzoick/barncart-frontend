import { Link, useNavigate } from 'react-router-dom'
import { ShoppingCart, Menu, X, Leaf } from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useCart } from '../../context/CartContext'

export default function Navbar() {
  const { user, logout, authLoading } = useAuth()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const { itemCount } = useCart()
  const cartCount = itemCount

  const handleLogout = async () => {
    await logout()
    navigate('/')
    setMenuOpen(false)
  }

  return (
    <nav className="bg-farm-green text-white sticky top-0 z-50 shadow-md">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-bold text-xl">
          <Leaf className="w-6 h-6 text-farm-amber" />
          <span>BarnCart</span>
        </Link>

        <div className="hidden md:flex items-center gap-8 text-sm font-medium">
          <Link to="/listings" className="hover:text-farm-amber transition-colors">Shop</Link>
          {user?.role === 'ADMIN' && (
            <Link to="/admin" className="hover:text-farm-amber transition-colors">Admin</Link>
          )}
        </div>

        <div className="flex items-center gap-4">
          <Link to="/cart" className="relative hover:text-farm-amber transition-colors">
            <ShoppingCart className="w-6 h-6" />
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-farm-amber text-farm-text
                text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </Link>

          <div className="hidden md:flex items-center gap-3 text-sm">
            {authLoading ? null : user ? (
              <>
                <span className="text-farm-greenMuted">Hello, {user.firstName}</span>
                <Link to="/orders" className="hover:text-farm-amber transition-colors">Orders</Link>
                <button onClick={handleLogout}
                  className="bg-farm-amber text-farm-text px-3 py-1.5 rounded-md
                    font-medium hover:bg-farm-amberLight transition-colors">
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="hover:text-farm-amber transition-colors">Login</Link>
                <Link to="/register"
                  className="bg-farm-amber text-farm-text px-3 py-1.5 rounded-md
                    font-medium hover:bg-farm-amberLight transition-colors">
                  Register
                </Link>
              </>
            )}
          </div>

          <button className="md:hidden" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="md:hidden bg-farm-green border-t border-farm-greenLight px-4 py-4
          flex flex-col gap-4 text-sm font-medium">
          <Link to="/listings" onClick={() => setMenuOpen(false)}
            className="hover:text-farm-amber transition-colors">Shop</Link>
          {authLoading ? null : user ? (
            <>
              <span className="text-farm-greenMuted">Hello, {user.firstName}</span>
              <Link to="/orders" onClick={() => setMenuOpen(false)}
                className="hover:text-farm-amber transition-colors">Orders</Link>
              {user.role === 'ADMIN' && (
                <Link to="/admin" onClick={() => setMenuOpen(false)}
                  className="hover:text-farm-amber transition-colors">Admin</Link>
              )}
              <button onClick={handleLogout}
                className="text-left hover:text-farm-amber transition-colors">Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" onClick={() => setMenuOpen(false)}
                className="hover:text-farm-amber transition-colors">Login</Link>
              <Link to="/register" onClick={() => setMenuOpen(false)}
                className="hover:text-farm-amber transition-colors">Register</Link>
            </>
          )}
        </div>
      )}
    </nav>
  )
}